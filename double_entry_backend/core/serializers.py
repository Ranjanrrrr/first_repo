from rest_framework import serializers
from .models import Account, JournalEntry, JournalEntryLine
from django.db import transaction

class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = '__all__'

class JournalEntryLineSerializer(serializers.ModelSerializer):
    account_id = serializers.IntegerField(source='account.id', read_only=True)  # ✅ Add this line
    account_name = serializers.CharField(source='account.name', read_only=True)

    class Meta:
        model = JournalEntryLine
        fields = ['id', 'account','account_id', 'account_name', 'debit', 'credit', 'narration']

    def to_internal_value(self, data):
        # Clean empty/invalid values
        for field in ['debit', 'credit']:
            try:
                data[field] = float(data.get(field)) if data.get(field) not in [None, '', 'null'] else 0.0
            except (ValueError, TypeError):
                data[field] = 0.0
        return super().to_internal_value(data)

class JournalEntrySerializer(serializers.ModelSerializer):
    lines = JournalEntryLineSerializer(many=True)

    class Meta:
        model = JournalEntry
        fields = ['id', 'date', 'description', 'created_at', 'lines']

    def validate(self, data):
        lines = [line for line in data.get('lines', []) if (line.get('debit') or 0) > 0 or (line.get('credit') or 0) > 0]
        if not lines:
            raise serializers.ValidationError("All lines are empty — please enter valid debit/credit amounts.")

        total_debit = sum(line.get('debit') or 0 for line in lines)
        total_credit = sum(line.get('credit') or 0 for line in lines)

        if total_debit != total_credit:
            raise serializers.ValidationError("Debits and credits must balance.")

        for line in lines:
            if (line.get('debit', 0) < 0) or (line.get('credit', 0) < 0):
                raise serializers.ValidationError("Debit and credit must be positive.")
            if line.get('debit', 0) > 0 and line.get('credit', 0) > 0:
                raise serializers.ValidationError("A line cannot have both debit and credit > 0.")

        data['lines'] = lines
        return data

    def create(self, validated_data):
        lines_data = validated_data.pop('lines')
        with transaction.atomic():
            entry = JournalEntry.objects.create(**validated_data)
            for line_data in lines_data:
                JournalEntryLine.objects.create(journal_entry=entry, **line_data)
        return entry

    def update(self, instance, validated_data):
        lines_data = validated_data.pop('lines')
        instance.date = validated_data.get('date', instance.date)
        instance.description = validated_data.get('description', instance.description)
        instance.save()

        # 🔁 Clear old lines
        instance.lines.all().delete()

        # ✅ Create new lines
        for line_data in lines_data:
            JournalEntryLine.objects.create(journal_entry=instance, **line_data)

        return instance
