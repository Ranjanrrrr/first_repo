import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account';
import { RouterLink } from '@angular/router';

import { LedgerService } from '../../services/ledger';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  accountTypes: { name: string, count: number }[] = [];

  accounts: any[] = [];

  constructor(private accountService: AccountService,
    private legderService:LedgerService
  ) {}

  ngOnInit(): void {
    this.fetchAccounts();
  }

  fetchAccounts(): void {
  this.accountService.getAllAccounts().subscribe({
    next: (accountsData) => {
      this.accounts = accountsData;

      // For each account, load its ledger balance
      this.accounts.forEach(account => {
        this.legderService.getLedger(account.id).subscribe({
          next: (ledgerData) => {
            account.current_balance = ledgerData.current_balance;
          },
          error: (err) => {
            console.error(`❌ Failed to load ledger for account ${account.id}:`, err);
            account.current_balance = 0;
          }
        });
      });

      // Call your account type calculation (or other logic)
      this.calculateAccountTypes();
    },
    error: (err) => {
      console.error('❌ Error fetching accounts:', err);
      alert('Unable to fetch accounts');
    }
  });
}

  
  calculateAccountTypes(): void {
    const types = ['Asset', 'Liability', 'Customer', 'Supplier', 'Income', 'Expense', 'Equity'];
    this.accountTypes = types.map(type => ({
      name: type,
      count: this.accounts.filter(acc => acc.type.toLowerCase() === type.toLowerCase()).length
    }));
  }
}

