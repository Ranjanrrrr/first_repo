import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account';
import { LedgerService } from '../../services/ledger';

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-trial-balance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trial-balance.html'
})
export class TrialBalanceComponent implements OnInit {
  fromDate: string = '';
  toDate: string = '';
  ledgerFilter: string = 'All Ledgers';

  accounts: any[] = [];
  filteredAccounts: any[] = []; // <-- Add this

  constructor(
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
  this.accountService.getTrialAccounts().subscribe({
    next: (data) => {
      this.accounts = data || [];
      this.filteredAccounts = [...this.accounts];  // ✅ initialize with all accounts
      console.log('✅ Trial accounts loaded:', this.accounts);
    },
    error: (err) => console.error('❌ Failed to load trial accounts', err)
  });
}





 get totalDebit(): number {
  return this.filteredAccounts.reduce((sum, acc) => sum + (acc.debit || 0), 0);
}

get totalCredit(): number {
  return this.filteredAccounts.reduce((sum, acc) => sum + (acc.credit || 0), 0);
}



  get difference(): number {
    return Math.abs(this.totalDebit - this.totalCredit);
  }

  applyFilters(): void {
  const from = this.fromDate ? new Date(this.fromDate) : null;
  const to = this.toDate ? new Date(this.toDate) : null;

  this.filteredAccounts = this.accounts.filter(acc => {
    const matchesLedger =
      this.ledgerFilter === 'All Ledgers' ||
      acc.type?.toLowerCase() === this.ledgerFilter.toLowerCase();

    const createdDate = acc.created_at ? new Date(acc.created_at) : null;
    const matchesFrom = !from || (createdDate && createdDate >= from);
    const matchesTo = !to || (createdDate && createdDate <= to);

    return matchesLedger && matchesFrom && matchesTo;
  });
}



  clearFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.ledgerFilter = 'All Ledgers';
    this.filteredAccounts = [...this.accounts];  // ✅ Reset view
    // this.loadAccounts();
  }

  exportExcel(): void {
    const data = this.accounts.map(acc => ({
      'Account Name': acc.name,
      'Account Type': acc.type,
      'Debit': acc.debit || 0,
      'Credit': acc.credit || 0
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance');
    XLSX.writeFile(wb, 'trial_balance.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    doc.text('Trial Balance Report', 14, 14);
    autoTable(doc, {
      head: [['Account Name', 'Account Type', 'Debit', 'Credit']],
      body: this.filteredAccounts.map(acc => [
        acc.name,
        acc.type,
        (acc.debit || 0).toFixed(2),
        (acc.credit || 0).toFixed(2)
      ]),
      startY: 20
    });
    doc.save('trial_balance.pdf');
  }
}
  