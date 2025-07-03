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

  constructor(
    private accountService: AccountService,
    private ledgerService: LedgerService
  ) {}

  ngOnInit(): void {
  this.accountService.getAllAccounts().subscribe({
    next: (data) => {
      this.accounts = data || [];
      console.log('✅ Accounts loaded:', this.accounts);
      this.accounts.forEach(acc => this.loadLedgerForAccount(acc));
    },
    error: (err) => console.error('❌ Failed loading accounts', err)
  });
}
  


  loadAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts.map(acc => ({
          ...acc,
          debit: 0,
          credit: 0
        }));
        this.accounts.forEach(acc => this.loadLedgerForAccount(acc));
      },
      error: (err) => console.error('Error loading accounts', err)
    });
  }

loadLedgerForAccount(acc: any): void {
  if (acc.type === 'customer') {
    this.ledgerService.getCustomerLedger(acc.id).subscribe({
      next: (data) => {
        acc.debit = data.ledger.reduce((sum: number, row: any) => sum + (row.debit || 0), 0);
        acc.credit = data.ledger.reduce((sum: number, row: any) => sum + (row.credit || 0), 0);
        console.log(`✅ Customer ${acc.name} -> Debit: ${acc.debit}, Credit: ${acc.credit}`);
      },
      error: (err) => console.error(`❌ Failed loading ledger for customer ${acc.id}`, err)
    });
  } else if (acc.type === 'supplier') {
    this.ledgerService.getSupplierLedger(acc.id).subscribe({
      next: (data) => {
        acc.debit = data.ledger.reduce((sum: number, row: any) => sum + (row.debit || 0), 0);
        acc.credit = data.ledger.reduce((sum: number, row: any) => sum + (row.credit || 0), 0);
        console.log(`✅ Supplier ${acc.name} -> Debit: ${acc.debit}, Credit: ${acc.credit}`);
      },
      error: (err) => console.error(`❌ Failed loading ledger for supplier ${acc.id}`, err)
    });
  } else {
    acc.debit = 0;
    acc.credit = 0;
  }
}



 get totalDebit(): number {
  const total = this.accounts.reduce((sum, acc) => sum + (acc.debit || 0), 0);
  console.log('Total Debit:', total, 'Accounts:', this.accounts);
  return total;
}

get totalCredit(): number {
  const total = this.accounts.reduce((sum, acc) => sum + (acc.credit || 0), 0);
  console.log('Total Credit:', total, 'Accounts:', this.accounts);
  return total;
}


  get difference(): number {
    return Math.abs(this.totalDebit - this.totalCredit);
  }

  applyFilters(): void {
    console.log('Apply filter logic not implemented');
  }

  clearFilters(): void {
    this.fromDate = '';
    this.toDate = '';
    this.ledgerFilter = 'All Ledgers';
    this.loadAccounts();
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
      body: this.accounts.map(acc => [
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
  