from rest_framework import serializers
from .models import Account, JournalEntry, JournalEntryLine
from django.contrib.auth.models import User

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'
        # read_only_fields = ['created_by']

class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = JournalEntryLine
        fields = ['id', 'account', 'account_name', 'debit', 'credit','narration']

    # def to_internal_value(self, data):
    #     if 'account' in data:
    #         data['account']=data['account'] if data['account'] not in [None,"null",""] else None
    #     dataa= super().to_internal_value(data)
    #     return dataa
    def to_internal_value(self, data):
        # Handle account
        account = data.get('account')
        if account in [None, '', 'null']:
            data['account'] = None

        # Handle debit
        debit = data.get('debit')
        try:
            data['debit'] = float(debit) if debit not in [None, '', 'null'] else 0.0
        except (ValueError, TypeError):
            data['debit'] = 0.0

        # Handle credit
        credit = data.get('credit')
        try:
            data['credit'] = float(credit) if credit not in [None, '', 'null'] else 0.0
        except (ValueError, TypeError):
            data['credit'] = 0.0

        return super().to_internal_value(data)

class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True)

    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'description', 'created_at', 'lines']
    # def validate_account(self,value):
    #     if value is null:
    #         raise
    #     return value

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        entry = JournalEntry.objects.create(**validated_data)
        for line_data in lines_data:
            JournalEntryLine.objects.create(journal_entry=entry, **line_data)
        return entry
    

    