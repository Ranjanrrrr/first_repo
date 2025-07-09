import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account';
import { LedgerService } from '../../services/ledger';
import { JournalService } from '../../services/journal';


@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  accountTypes: { name: string, count: number }[] = [];

  accounts: any[] = [];
  currency: any;

  constructor(private accountService: AccountService,
    private legderService:LedgerService,
    private journalService: JournalService
  ) {}
  journalEntries: any[] = [];

  fetchJournalEntries(): void {
    this.journalService.getAllEntries().subscribe({
      next: (data) => {
        this.journalEntries = data.results || data;  // handle pagination response
      },
      error: (err) => {
        console.error('Error fetching journal entries:', err);
      }
    });
  }


  ngOnInit(): void {
    this.fetchAccounts();
    this.fetchJournalEntries();

  }
  fetchAccounts(): void {
  // 🟢 Request with a large page size (assuming your API supports this)
  this.accountService.getAllAccounts({ page_size: 1000 }).subscribe({
    next: (accountsData) => {
      this.accounts = accountsData.results || accountsData;  // keep fallback

      //added currency
      // if (accountsData.results.length > 0 && accountsData.results[0].currency) {
      //   this.currency = accountsData.results[0].currency;
      // }
//       const accountWithCurrency = accountsData.results.find((acc:any) => acc.currency);
//       console.log(accountWithCurrency);
//       if (accountWithCurrency) {
//         this.currency = accountWithCurrency.currency;
//         console.log('Currency set to:', this.currency);
// }
 

      // Load ledger balances for each account
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
  getTotalReceivables(): number {
  return this.accounts
    .filter(acc => acc.type === 'customer')
    .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
}

  getTotalPayables(): number {
    return this.accounts
      .filter(acc => acc.type === 'supplier')
      .reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
  }

  getTransactionCount(): number {
    return this.journalEntries.length;
  }
  getAbsolute(val: number): number {
  return Math.abs(val || 0);
}



}

