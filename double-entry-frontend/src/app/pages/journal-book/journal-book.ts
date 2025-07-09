import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JournalService } from '../../services/journal';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AccountService } from '../../services/account';

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

@Component({
  selector: 'app-journal-book',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './journal-book.html'
})
export class JournalBookComponent implements OnInit {
  fromDate: string = '';
  toDate: string = '';
  ledgerFilter: string = '';
  generatedAt: string = '';

  accounts: { id: number; name: string }[] = [];
  journalEntries: JournalEntry[] = [];
  filteredEntries: JournalEntry[] = [];

  constructor(private journalService: JournalService,
    private accountService:AccountService,

    
  ) {}

  ngOnInit(): void {
    this.generatedAt = new Date().toLocaleString();
    this.loadAccounts();
    this.loadJournalEntries();
  }

  loadAccounts(): void {
  this.accountService.getAllAccounts().subscribe({
    next: (data: any) => {
      this.accounts = data.results || data || [];
    },
    error: (err) => {
      console.error('Error fetching accounts', err);
      alert(' Failed to load accounts');
    }
  });
}
   getEntryDebitTotal(entry: JournalEntry): number {
  return entry.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
}

getEntryCreditTotal(entry: JournalEntry): number {
  return entry.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
}


  loadJournalEntries(): void {
    this.journalService.getAllEntries().subscribe({
      next: (data) => {
        this.journalEntries = data?.results || data || [];
        this.filteredEntries = this.journalEntries;
        this.generatedAt = new Date().toLocaleString();
      },
      error: (err) => console.error('Error loading journal entries', err)
    });
  }

  applyFilters(): void {
    this.filteredEntries = this.journalEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const from = this.fromDate ? new Date(this.fromDate) : null;
      const to = this.toDate ? new Date(this.toDate) : null;

      const accountMatch = !this.ledgerFilter || entry.lines.some(line => line.account_id?.toString() === this.ledgerFilter);

      return (!from || entryDate >= from) &&
             (!to || entryDate <= to) &&
             accountMatch;
    });
    this.generatedAt = new Date().toLocaleString();
  }

  clearFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.ledgerFilter = '';
    this.filteredEntries = this.journalEntries;
    this.generatedAt = new Date().toLocaleString();
  }

  exportExcel(): void {
    const data = this.filteredEntries.flatMap(entry =>
      entry.lines.map(line => ({
        Date: entry.date,
        Description: entry.description,
        Account: line.account_name,
        Debit: line.debit || 0,
        Credit: line.credit || 0
      }))
    );
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Journal Book');
    XLSX.writeFile(wb, 'journal_book.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    doc.text('Journal Book', 14, 14);
    autoTable(doc, {
      head: [['Date', 'Description', 'Account', 'Debit', 'Credit']],
      body: this.filteredEntries.flatMap(entry =>
        entry.lines.map(line => [
          entry.date,
          entry.description,
          line.account_name,
          (Number(line.debit) || 0).toFixed(2),
          (Number(line.credit) || 0).toFixed(2)

        ])
      ),
      startY: 20
    });
    doc.save('journal_book.pdf');
  }

  onAccountSelect(): void {
    this.applyFilters(); // Use same logic
  }
}
