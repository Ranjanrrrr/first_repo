import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css'
})
export class Accounts implements OnInit {
  name = '';
  type = '';
  opening_balance = 0;
  currency = 'AED';
  status = 'active';
  parent: number | null = null;
  isModalOpen = false;
  currentEditingId: number | null = null;  // Track if editing

  parentAccounts: any[] = [];
  accounts: any[] = [];

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadParentAccounts();
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe(data => {
      this.accounts = data;
    });
  }

  loadParentAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => (this.parentAccounts = data),
      error: (err) => console.error('❌ Error fetching accounts:', err)
    });
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  submit(): void {
    const payload = {
      name: this.name.trim(),
      type: this.type.trim(),
      opening_balance: this.opening_balance,
      currency: this.currency,
      status: this.status,
      parent: this.parent || null
    };

    if (!payload.name || !payload.type) {
      alert('⚠️ Please fill in all required fields');
      return;
    }

    if (this.currentEditingId) {
      // Update existing
      this.accountService.updateAccount(this.currentEditingId, payload).subscribe({
        next: () => {
          alert('✅ Account updated');
          this.closeModal();
          this.loadAccounts();
        },
        error: (err) => {
          console.error('❌ Update failed:', err);
          alert('❌ Error updating account');
        }
      });
    } else {
      // Create new
      this.accountService.createAccount(payload).subscribe({
        next: () => {
          alert('✅ Account created');
          this.closeModal();
          this.loadAccounts();
        },
        error: (err) => {
          console.error('❌ Create failed:', err);
          alert('❌ Error creating account');
        }
      });
    }
  }

  editAccount(account: any): void {
    this.currentEditingId = account.id;
    this.name = account.name;
    this.type = account.type;
    this.opening_balance = account.opening_balance;
    this.currency = account.currency;
    this.status = account.status;
    this.parent = account.parent;
    this.isModalOpen = true;
  }

  deleteAccount(id: number): void {
    if (confirm('Are you sure you want to delete this account?')) {
      this.accountService.deleteAccount(id).subscribe({
        next: () => {
          alert('✅ Account deleted');
          this.loadAccounts();
        },
        error: (err) => {
          console.error(' Delete error:', err);
          alert(' Error deleting account');
        }
      });
    }
  }

  private resetForm(): void {
    this.name = '';
    this.type = '';
    this.opening_balance = 0;
    this.currency = 'AED';
    this.status = 'active';
    this.parent = null;
    this.currentEditingId = null;
  }

  getParentAccountName(parentId: number | null): string {
    if (!parentId) return '-';
    const parent = this.accounts.find(acc => acc.id === parentId);
    return parent ? parent.name : 'Unknown';
  }
}
