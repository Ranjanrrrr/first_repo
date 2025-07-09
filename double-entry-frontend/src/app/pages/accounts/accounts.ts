import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account';
import { LedgerService } from '../../services/ledger';

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
  opening_balance: number | null = null;
  currency: any = '';
  status = 'active';
  parent: number | null = null;
  isModalOpen = false;
  currentEditingId: number | null = null;

  parentAccounts: any[] = [];
  accounts: any[] = [];
  totalCount = 0;
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  paginationArray: (number | string)[] = [];
  pageStart = 0;
  pageEnd = 0;

  constructor(
    private accountService: AccountService,
    private ledgerService: LedgerService
  ) {}

  ngOnInit(): void {
    this.loadParentAccounts();
    this.loadAccounts();
  }

  loadAccounts(): void {
    const params = {
      page: this.currentPage,
      page_size: this.pageSize
    };

    this.accountService.getAllAccounts(params).subscribe({
      next: (res) => {
        this.accounts = res.results || [];
        this.totalCount = res.count || this.accounts.length;
        this.totalPages = Math.ceil(this.totalCount / this.pageSize);
        this.pageStart = ((this.currentPage - 1) * this.pageSize) + 1;
        this.pageEnd = this.pageStart + this.accounts.length - 1;
        this.buildPaginationArray();

        this.accounts.forEach(acc => {
          this.ledgerService.getLedger(acc.id).subscribe({
            next: ledger => acc.current_balance = ledger.current_balance,
            error: () => acc.current_balance = 0
          });
        });
      },
      error: (err) => {
        console.error('❌ Error loading accounts:', err);
      }
    });
  }

  buildPaginationArray(): void {
    const pages: (number | string)[] = [];
    if (this.totalPages <= 5) {
      for (let i = 1; i <= this.totalPages; i++) pages.push(i);
    } else {
      if (this.currentPage <= 3) {
        pages.push(1, 2, 3, '...', this.totalPages);
      } else if (this.currentPage >= this.totalPages - 2) {
        pages.push(1, '...', this.totalPages - 2, this.totalPages - 1, this.totalPages);
      } else {
        pages.push(1, '...', this.currentPage, '...', this.totalPages);
      }
    }
    this.paginationArray = pages;
  }

  changePage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadAccounts();
    }
  }

  loadParentAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data) => this.parentAccounts = data.results || data,
      error: (err) => console.error('❌ Error fetching parent accounts:', err)
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
      opening_balance: this.opening_balance ?? 0,
      currency: this.currency,
      status: this.status,
      parent: this.parent || null
    };

    if (!payload.name) {
      alert('⚠️ Name is required');
      return;
    }
    if (!payload.type) {
      alert('⚠️ Type is required');
      return;
    }
    if (!payload.currency) {
      alert('⚠️ Currency is required');
      return;
    }

    if (this.currentEditingId) {
      this.accountService.updateAccount(this.currentEditingId, payload).subscribe({
        next: () => {
          alert('✅ Account updated');
          this.closeModal();
          this.loadAccounts();
        },
        error: (err) => {
          console.error('❌ Update failed:', err);
          alert(err?.error?.detail || '❌ Error updating account');
        }
      });
    } else {
      this.accountService.createAccount(payload).subscribe({
        next: () => {
          alert('✅ Account created');
          this.closeModal();
          this.loadAccounts();
        },
        error: (err) => {
          console.error('❌ Create failed:', err);
          alert(err?.error?.detail || '❌ Error creating account');
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
          console.error(' Delete failed:', err);
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
  getAbsolute(val: number): number {
  return Math.abs(val || 0);
  }

}
