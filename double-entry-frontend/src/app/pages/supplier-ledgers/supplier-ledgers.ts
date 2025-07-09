import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services/account';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LedgerService } from '../../services/ledger';

// 👉 NEW IMPORTS FOR EXPORT
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-supplier-ledgers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './supplier-ledgers.html',
  styleUrl: './supplier-ledgers.css'
})
export class SupplierLedgers implements OnInit {
  suppliers: any[] = [];
  selectedSupplier: string = '';
  ledgers: any[] = [];
  filteredLedgers: any[] = [];

  finalBalance: number = 0;
  totalDebit: number = 0;
  totalCredit: number = 0;
  combinedBalance: number = 0;
  currency: string = '';

  fromDate: string = '';
  toDate: string = '';
  openingBalance:number=0;

  constructor(
    private accountService: AccountService,
    private ledgerservice: LedgerService
  ) {}

  ngOnInit(): void {
    this.accountService.getAllSuppliers().subscribe({
      next: (data) => this.suppliers = data.results,
      error: (err) => console.error('Error loading suppliers', err)
    });
  }

  onSupplierSelect(): void {
    if (this.selectedSupplier) {
      this.ledgerservice.getSupplierLedger(this.selectedSupplier).subscribe({
        next: (data) => {
          this.ledgers = data.ledger || [];
          this.finalBalance = Math.abs(data.current_balance || 0); // ✅ No negative sign in frontend

          this.totalDebit = this.ledgers.reduce((sum, row) => sum + (row.debit || 0), 0);
          this.totalCredit = this.ledgers.reduce((sum, row) => sum + (row.credit || 0), 0);

          const selected = this.suppliers.find(c => c.id === +this.selectedSupplier);
          this.currency = selected?.currency || '';
          this.openingBalance = selected?.opening_balance || 0; // ← Add this line

          // this.updateRunningBalances();
        },
        error: (err) => console.error('Error loading ledger', err)
      });
    }
  }
    getAbsolute(val: number): number {
      return Math.abs(val || 0);
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Supplier Ledger');

    XLSX.writeFile(workbook, `supplier_ledger_${this.selectedSupplier}.xlsx`);
  }

  // 🚀 Export to PDF
  exportPDF(): void {
    const doc = new jsPDF();

    doc.text(`Supplier Ledger: ${this.selectedSupplier}`, 14, 14);
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

    doc.save(`supplier_ledger_${this.selectedSupplier}.pdf`);
  }
}
