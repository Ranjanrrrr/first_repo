import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account';
import { JournalService } from '../../services/journal';
import { LedgerService } from '../../services/ledger';

interface JournalEntryLine {
  account_id: number | null;
  debit: number | null;
  credit: number | null;
  narration: string;
  account_name?: string;
  currency?: string;
}

interface JournalEntry {
  id: number;
  date: string;
  description: string;
  created_at: string;
  lines: JournalEntryLine[];
}

interface Account {
  id: number;
  name: string;
}

@Component({
  selector: 'app-journal-entries',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal-entries.html'
})
export class JournalEntryComponent implements OnInit {
  journalEntries: JournalEntry[] = [];

  accounts: Account[] = [];

  isModalOpen = false;

  date: string = new Date().toISOString().substring(0, 10);
  
  description: string = '';
  lines: JournalEntryLine[] = [
    { account_id: null, debit: null, credit: null, narration: '' },
    { account_id: null, debit: null, credit: null, narration: '' }
  ];

  constructor(
    private accountService: AccountService,
    private journalService: JournalService,
    private ledgerService : LedgerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEntries();
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (data: Account[]) => {
        this.accounts = data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching accounts', err);
        alert('❌ Failed to load accounts');
      }
    });
  }

loadEntries(): void {
  this.journalService.getAllEntries().subscribe({
    next: (data: JournalEntry[]) => {
      console.log('Loaded journal entries:', data);  // DEBUG LINE
      this.journalEntries = (data || []).map(entry => ({
        ...entry,
        lines: (entry.lines || []).map(line => ({
          ...line,
          narration: (line.narration && line.narration.trim()) ? line.narration : '-'
        }))
      }));
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error loading journal entries', err);
      alert('❌ Failed to load journal entries');
    }
  });
}


  getEntryDebitTotal(entry: JournalEntry): number {
    return (entry.lines || []).reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  }

  getEntryCreditTotal(entry: JournalEntry): number {
    return (entry.lines || []).reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  }

  deleteEntry(id: number): void {
    if (confirm('Are you sure you want to delete this entry?')) {
      this.journalService.deleteEntry(id).subscribe({
        next: () => {
          this.journalEntries = this.journalEntries.filter(e => e.id !== id);
          alert('✅ Entry deleted');
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert('❌ Failed to delete entry');
        }
      });
    }
  }

  editEntry(entry: JournalEntry): void {
    alert(`Edit Entry: JE-${entry.id}`);
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  addLine(): void {
    this.lines.push({ account_id: null, debit: null, credit: null, narration: '' });
  }

  removeLine(index: number): void {
    this.lines.splice(index, 1);
  }

  getTotalDebit(): number {
    return this.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  }

  getTotalCredit(): number {
    return this.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  }

  isBalanced(): boolean {
    return this.getTotalDebit() === this.getTotalCredit();
  }

  submit(): void {
  if (!this.isBalanced()) {
    alert('Journal entry is not balanced');
    return;
  }

  const payload = {
    date: this.date,
    description: this.description,
    lines: this.lines
      .filter(line => line.account_id)
      .map(line => ({
        account: Number(line.account_id),
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
        narration: (line.narration || '-').trim()
      }))
  };

  this.journalService.createEntry(payload).subscribe({
    next: () => {
      alert('✅ Journal entry created');
      this.closeModal();

      // 🚀 Capture unique account IDs from this payload
      const uniqueAccountIds = Array.from(new Set(
        payload.lines.map(line => line.account.toString())
      ));

      // 🌟 Load entries, THEN fetch ledgers
      this.loadEntries();

      // 🔥 Fetch ledgers of the affected accounts
      uniqueAccountIds.forEach(accountId => {
        // 👉 You may want to decide if it's customer or supplier
        this.ledgerService.getCustomerLedger(accountId).subscribe({
          next: (data) => {
            console.log(`📌 Ledger for Account ID ${accountId}:`, data.ledger);
            console.log(`📌 Current Balance for Account ID ${accountId}:`, data.current_balance);
          },
          error: (err) => {
            console.error(`❌ Failed to load ledger for account ${accountId}`, err);
          }
        });
      });

    },
    error: (err) => {
      console.error('Create failed:', err);
      alert('❌ Error creating journal entry');
    }
  });
}

  resetForm(): void {
    this.date = new Date().toISOString().substring(0, 10);
    this.description = '';
    this.lines = [
      { account_id: null, debit: null, credit: null, narration: '' },
      { account_id: null, debit: null, credit: null, narration: '' }
    ];
  }
}
