from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import Account, JournalEntry, JournalEntryLine
from .serializers import AccountSerializer, JournalEntrySerializer
from rest_framework.pagination import PageNumberPagination
from django.db import transaction
from rest_framework.exceptions import ValidationError



class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # e.g. PageNumberPagination

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)

    @action(detail=True, methods=['get','post','put','patch'])
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
            balance += (line.debit or 0) - (line.credit or 0)
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
        serializer = self.get_serializer(customers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods= ['get'],url_path='suppliers')
    def suppliers(self,request):
        suppliers=self.get_queryset().filter(type='supplier')
        serializer=self.get_serializer(suppliers,many=True)
        return Response(serializer.data)


# class JournalEntryPagination(PageNumberPagination):
#     page_size = 10  # default page size
#     page_size_query_param = 'page_size'
#     max_page_size = 100

class JournalEntryViewSet(viewsets.ModelViewSet):
    queryset = JournalEntry.objects.all().order_by('-date')
    serializer_class = JournalEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    # pagination_class = JournalEntryPagination   # 💡 ADD THIS LINE
    pagination_class = None  # e.g. PageNumberPagination


    def get_queryset(self):
        return self.queryset.filter(created_by=self.request.user)

    

    def perform_create(self, serializer):
     with transaction.atomic():
        journal_entry = serializer.save(created_by=self.request.user)
        lines_data = self.request.data.get('lines', [])

        if not lines_data:
            raise ValidationError("At least one debit and one credit line required.")

        total_debit = 0
        total_credit = 0

        for line in lines_data:
            debit = float(line.get('debit', 0) or 0)
            credit = float(line.get('credit', 0) or 0)
            total_debit += debit
            total_credit += credit

            JournalEntryLine.objects.create(
                journal_entry=journal_entry,
                account_id=line['account_id'],
                debit=debit,
                credit=credit
            )

        if total_debit != total_credit:
            raise ValidationError("Debits and credits must balance.")



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



