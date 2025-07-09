import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { JournalService } from '../../services/journal';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-journal-book',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './journal-book.html'
})
export class JournalBookComponent implements OnInit {
  fromDate: string = '';
  toDate: string = '';
  ledgerFilter: string = '';

  accounts: any[] = [];
  journalEntries: any[] = [];
  filteredEntries: any[] = [];
  generatedAt: string = '';

  constructor(private journalService: JournalService) {}

  ngOnInit(): void {
    this.generatedAt = new Date().toLocaleString();
    this.loadAccounts();
    this.loadJournalEntries();
  }

  loadAccounts(): void {
    this.journalService.getAllAccounts().subscribe({
      next: (data) => {
        this.accounts = data || [];
      },
      error: (err) => console.error('Error loading accounts', err)
    });
  }

  loadJournalEntries(): void {
    this.journalService.getAllEntries().subscribe({
      next: (data) => {
        this.journalEntries = data || [];
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

      if (from && entryDate < from) return false;
      if (to && entryDate > to) return false;
      if (this.ledgerFilter && entry.ledger_name !== this.ledgerFilter) return false;

      return true;
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
    const data = this.filteredEntries.map(entry => ({
      Date: entry.date,
      Description: entry.description,
      Debit: entry.debit || 0,
      Credit: entry.credit || 0
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Journal Book');
    XLSX.writeFile(wb, 'journal_book.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    doc.text('Journal Book', 14, 14);
    autoTable(doc, {
      head: [['Date', 'Description', 'Debit', 'Credit']],
      body: this.filteredEntries.map(entry => [
        entry.date,
        entry.description,
        (entry.debit || 0).toFixed(2),
        (entry.credit || 0).toFixed(2)
      ]),
      startY: 20
    });
    doc.save('journal_book.pdf');
  }
  onAccountSelect(): void {
  if (this.ledgerFilter) {
    this.filteredEntries = this.journalEntries.filter(j => j.account_id == this.ledgerFilter);
  } else {
    this.filteredEntries = this.journalEntries;
  }
}


}
