import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AccountService } from '../../services/account';
import { LedgerService } from '../../services/ledger';

// 👉 NEW IMPORTS FOR EXPORT
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-customer-ledgers',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './customer-ledgers.html'
})
export class CustomerLedgers implements OnInit {
  customers: any[] = [];
  selectedCustomer: string = '';
  ledgers: any[] = [];

  totalDebit: number = 0;
  totalCredit: number = 0;
  finalBalance: number = 0;
  combinedBalance: number = 0;
  currency: string = '';

  fromDate: string = '';
  toDate: string = '';
  filteredLedgers: any[] = [];

  constructor(
    private accountService: AccountService,
    private ledgerService: LedgerService
  ) {}

  ngOnInit(): void {
    this.accountService.getAllCustomers().subscribe({
      next: (data) => this.customers = data,
      error: (err) => console.error('Error loading customers', err)
    });
  }

  onCustomerSelect(): void {
    if (this.selectedCustomer) {
      this.ledgerService.getCustomerLedger(this.selectedCustomer).subscribe({
        next: (data) => {
          this.ledgers = data.ledger || [];
          this.finalBalance = data.current_balance || 0;
          this.totalDebit = this.ledgers.reduce((sum, row) => sum + (row.debit || 0), 0);
          this.totalCredit = this.ledgers.reduce((sum, row) => sum + (row.credit || 0), 0);
          this.combinedBalance = this.finalBalance + this.totalDebit + this.totalCredit;

          const selected = this.customers.find(c => c.id === +this.selectedCustomer);
          this.currency = selected?.currency || '';

          this.updateRunningBalances();
        },
        error: (err) => console.error('Error loading ledger', err)
      });
    }
  }

  updateRunningBalances(): void {
    let runningDebit = 0;
    let runningCredit = 0;
    let openingBalance = this.finalBalance || 0;

    this.ledgers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    this.ledgers = this.ledgers.map((row) => {
      const debit = row.debit || 0;
      const credit = row.credit || 0;
      runningDebit += debit;
      runningCredit += credit;
      const computedBalance = openingBalance + runningDebit + runningCredit;
      return { ...row, computedBalance };
    });
  }

  applyDateFilter(): void {
    if (!this.fromDate && !this.toDate) {
      this.filteredLedgers = this.ledgers;
      return;
    }
    this.filteredLedgers = this.ledgers.filter(row => {
      const rowDate = new Date(row.date);
      const from = this.fromDate ? new Date(this.fromDate) : null;
      const to = this.toDate ? new Date(this.toDate) : null;
      if (from && rowDate < from) return false;
      if (to && rowDate > to) return false;
      return true;
    });
  }

  clearDateFilter(): void {
    this.fromDate = '';
    this.toDate = '';
    this.filteredLedgers = this.ledgers;
  }

  // 🚀 Export to Excel
  exportExcel(): void {
    const dataToExport = (this.filteredLedgers.length ? this.filteredLedgers : this.ledgers).map(row => ({
      Date: row.date,
      Description: row.description || '-',
      Debit: row.debit || 0,
      Credit: row.credit || 0,
      Balance: row.computedBalance || 0
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer Ledger');

    XLSX.writeFile(workbook, `customer_ledger_${this.selectedCustomer}.xlsx`);
  }

  // 🚀 Export to PDF
  exportPDF(): void {
    const doc = new jsPDF();

    doc.text(`Customer Ledger: ${this.selectedCustomer}`, 14, 14);
    autoTable(doc, {
      head: [['Date', 'Description', 'Debit', 'Credit', 'Balance']],
      body: (this.filteredLedgers.length ? this.filteredLedgers : this.ledgers).map(row => [
        row.date,
        row.description || '-',
        (row.debit || 0).toFixed(2),
        (row.credit || 0).toFixed(2),
        (row.computedBalance || 0).toFixed(2)
      ]),
      startY: 20
    });

    doc.save(`customer_ledger_${this.selectedCustomer}.pdf`);
  }
}
