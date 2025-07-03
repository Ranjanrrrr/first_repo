from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Account

@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'currency', 'status', 'opening_balance', 'parent', 'created_by')
    search_fields = ('name', 'type', 'currency')
    list_filter = ('type', 'currency', 'status')

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs  # superuser sees all accounts
        return qs.filter(created_by=request.user)  # regular user sees only their accounts

    def has_change_permission(self, request, obj=None):
        if obj is None or request.user.is_superuser:
            return True
        return obj.created_by == request.user  # only if they created it

    def has_delete_permission(self, request, obj=None):
        if obj is None or request.user.is_superuser:
            return True
        return obj.created_by == request.user  # only if they created it

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        obj.save()
