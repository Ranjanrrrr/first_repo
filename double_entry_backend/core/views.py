from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import Account, JournalEntry, JournalEntryLine
from .serializers import AccountSerializer, JournalEntrySerializer
from .pagination import StandardResultsSetPagination  # ✅ Import your custom pagination
from django.db.models import Sum


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination  # ✅ Apply custom pagination

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)
    
    # @action(detail=False, methods=['get'], url_path='accountview')
    # def accountview(self, request):
    #     accounts = self.get_queryset()
    #     data = []

    #     for acc in accounts:
    #         # Start from opening balance
    #         balance = acc.opening_balance or 0

    #         # Sum all debits and credits for this account
    #         lines = JournalEntryLine.objects.filter(
    #             journal_entry__created_by=request.user,
    #             account=acc
    #         )

    #         debit_total = lines.aggregate(Sum('debit'))['debit__sum'] or 0
    #         credit_total = lines.aggregate(Sum('credit'))['credit__sum'] or 0

    #         if acc.type in ['asset', 'expense', 'customer']:
    #             balance += debit_total - credit_total
    #         else:
    #             balance += credit_total - debit_total

    #         # Determine debit or credit value based on balance
    #         debit_val = balance if balance > 0 else 0
    #         credit_val = abs(balance) if balance < 0 else 0

    #         acc_data = AccountSerializer(acc).data
    #         acc_data['debit'] = round(debit_val, 2)
    #         acc_data['credit'] = round(credit_val, 2)

    #         data.append(acc_data)

    #     return Response(data)
    

    @action(detail=False, methods=['get'], url_path='accountview')
    def account_view(self, request):
        accounts = self.get_queryset()
        response_data = []

        for acc in accounts:
            # Fetch all ledger lines for this account
            lines = JournalEntryLine.objects.filter(
                journal_entry__created_by=request.user,
                account=acc
            )

            balance = acc.opening_balance or 0

            for line in lines:
                if acc.type in ['asset', 'expense', 'customer']:
                    balance += (line.debit or 0) - (line.credit or 0)
                else:
                    balance += (line.credit or 0) - (line.debit or 0)

            response_data.append({
                "id": acc.id,
                "name": acc.name,
                "type": acc.type,
                "status": acc.status,
                "currency": acc.currency,
                # ✅ Split balance into debit/credit
                "debit": balance if balance > 0 else 0,
                "credit": -balance if balance < 0 else 0
            })

        return Response(response_data)

    

    @action(detail=True, methods=['get'])
    def ledger(self, request, pk=None):
        try:
            account = self.get_queryset().get(pk=pk)
        except Account.DoesNotExist:
            return Response({"error": "Account not found"}, status=404)

        lines = JournalEntryLine.objects.filter(
            journal_entry__created_by=request.user,
            account=account
        ).order_by('journal_entry__date', 'id')

        balance = account.opening_balance or 0
        ledger_data = []
        for line in lines:
            if account.type in ['asset', 'expense', 'customer']:
                balance += (line.debit or 0) - (line.credit or 0)
            else:
                balance += (line.credit or 0) - (line.debit or 0)

            ledger_data.append({
                'date': line.journal_entry.date.strftime('%Y-%m-%d'),
                'description': line.journal_entry.description or '',
                'debit': float(line.debit),
                'credit': float(line.credit),
                'balance': float(balance)
            })

        return Response({
            "ledger": ledger_data,
            "current_balance": float(balance)
        })

    @action(detail=False, methods=['get'], url_path='customers')
    def customers(self, request):
        customers = self.get_queryset().filter(type='customer')
        page = self.paginate_queryset(customers)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(customers, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='suppliers')
    def suppliers(self, request):
        suppliers = self.get_queryset().filter(type='supplier')
        page = self.paginate_queryset(suppliers)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(suppliers, many=True)
        return Response(serializer.data)

class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all().order_by('-date')
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination  # ✅ Apply custom pagination

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username and password are required"}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=400)

        user = User.objects.create_user(username=username, password=password)
        return Response({"message": "User created successfully"}, status=201)
