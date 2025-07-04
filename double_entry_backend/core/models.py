from django.db import models
from django.contrib.auth.models import User


# Create your models here.



class Account(models.Model):
    ACCOUNT_TYPES = [
        ('customer', 'Customer'),
        ('supplier', 'Supplier'),
        ('asset', 'Asset'),
        ('liability', 'Liability'),
        ('equity', 'Equity'),
        ('income', 'Income'),
        ('expense', 'Expense'),
    ]

    CURRENCIES = [      
        ('AED', 'AED - UAE Dirham'),
        ('INR', 'INR - Indian Rupee'),
        ('USD', 'USD - US Dollar'),
        ('EUR', 'EUR - Euro'),
        ('GBP', 'GBP - British Pound'),
    ]

    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=100)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')
    type = models.CharField(max_length=20, choices=ACCOUNT_TYPES)
    opening_balance = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, choices=CURRENCIES, default='AED')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='accounts', null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

from django.contrib.auth import get_user_model

class JournalEntry(models.Model):
    date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        get_user_model(),
        on_delete=models.CASCADE,
        related_name='journal_entries',
        null=True
    )

    def __str__(self):
        return f"Journal Entry {self.id} on {self.date}"



class JournalEntryLine(models.Model):
    journal_entry = models.ForeignKey(JournalEntry, related_name="lines", on_delete=models.CASCADE)
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    narration = models.CharField(max_length=255, blank=True, default='') 

    def __str__(self):
        return f"{self.account.name}: Dr {self.debit} Cr {self.credit} {self.narration}"



