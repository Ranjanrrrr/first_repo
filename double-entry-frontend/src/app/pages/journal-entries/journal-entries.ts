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
  account_name: string;
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
    { account_id: null,account_name:'' ,debit: null, credit: null, narration: '' },
    { account_id: null,account_name:'' , debit: null, credit: null, narration: '' }
  ];
  editingEntryId: number | null = null;


  constructor(
    private accountService: AccountService,
    private journalService: JournalService,
    private ledgerService: LedgerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadEntries();
    this.loadAccounts();
  }

  loadAccounts(): void {
  this.accountService.getAllAccounts().subscribe({
    next: (data: any) => {
      this.accounts = data.results || data || [];
      this.cdr.detectChanges();
    },
    error: (err) => {
      console.error('Error fetching accounts', err);
      alert(' Failed to load accounts');
    }
  });
}

  loadEntries(): void {
  this.journalService.getAllEntries().subscribe({
    next: (data: any) => {  // use 'any' to match paginated structure
      this.journalEntries = (data.results || data || []).map((entry: JournalEntry) => ({
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
      alert(' Failed to load journal entries');
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
          alert(' Entry deleted');
        },
        error: (err) => {
          console.error('Delete failed:', err);
          alert(' Failed to delete entry');
        }
      });
    }
  }

 editEntry(entry: JournalEntry): void {
  this.editingEntryId = entry.id;
  this.date = entry.date;
  this.description = entry.description;
  


  this.lines = entry.lines.map(line => {
    const matchedAccount = this.accounts.find(acc => acc.id === Number(line.account_id));
    console.log(`Mapping line with account_id: ${line.account_id} → Found: ${matchedAccount?.name}`);
    return {
      account_id: Number(line.account_id),
      debit: line.debit,
      credit: line.credit,
      narration: line.narration,
      account_name: matchedAccount ? matchedAccount.name : '',
      currency: line.currency
    };
  });

  this.isModalOpen = true;
  this.cdr.detectChanges();
}


onAccountChange(line: JournalEntryLine): void {
  const selected = this.accounts.find(a => a.id === line.account_id);
  line.account_name = selected?.name || '';
}



  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  addLine(): void {
    this.lines.push({ account_id: null,account_name:'', debit: null, credit: null, narration: '' });
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

  resetForm(): void {
    this.date = new Date().toISOString().substring(0, 10);
    this.description = '';
    this.lines = [
      { account_id: null,account_name:'', debit: null, credit: null, narration: '' },
      { account_id: null, account_name:'' ,debit: null, credit: null, narration: '' }
    ];
      this.editingEntryId = null;
  }

  // 🟢 New method: handle debit input
  onDebitInput(line: JournalEntryLine): void {
    if (Number(line.debit) > 0) {
      line.credit = 0;  // clear credit if debit entered
    }
  }

  // 🟢 New method: handle credit input
  onCreditInput(line: JournalEntryLine): void {
    if (Number(line.credit) > 0) {
      line.debit = 0;  // clear debit if credit entered
    }
  }
  


  submit(): void {
    if (!this.description || this.description.trim() === '') {
      alert('Description is required!');
      return;
    }

    if (this.lines.length < 2) {
      alert('At least two journal lines are required!');
      return;
    }

    if (this.lines.find(line => !line.account_id)) {
      alert('All journal lines must have an account selected!');
      return;
    }

    // 🟢 New validation: ensure no line has both debit and credit, or neither
    const invalidLine = this.lines.find(line => {
      const debit = Number(line.debit) || 0;
      const credit = Number(line.credit) || 0;
      return (debit > 0 && credit > 0) || (debit === 0 && credit === 0);
    });

    if (invalidLine) {
      alert(' Each line must have either debit or credit — not both, not neither!');
      return;
    }

    if (!this.isBalanced()) {
      alert('Journal entry is not balanced!');
      return;
    }
    

    

    const payload = {
      date: this.date,
      description: this.description.trim(),
      lines: this.lines
        .filter(line => line.account_id)
        .map(line => ({
          account: Number(line.account_id),
          debit: Number(line.debit) || 0,
          credit: Number(line.credit) || 0,
          narration: (line.narration || '-').trim(),
          account_name: (line.account_name) .trim()
        }))
    };
    
    
    
     const request$ = this.editingEntryId
     ? this.journalService.updateEntry(this.editingEntryId, payload)  // use PATCH or PUT in service
     : this.journalService.createEntry(payload);

    request$.subscribe({
      next: () => {
        alert(this.editingEntryId ? 'Journal entry updated!' : 'Journal entry created!');
        this.closeModal();
        this.loadEntries();
      },
      error: (err) => {
        console.error(' Error saving journal entry:', err);
        alert(' Failed to save journal entry');
      }
    });

  }
}
