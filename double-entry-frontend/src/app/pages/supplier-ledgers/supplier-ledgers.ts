import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services/account';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LedgerService } from '../../services/ledger';

@Component({
  selector: 'app-supplier-ledgers',
  imports: [CommonModule,FormsModule],
  templateUrl: './supplier-ledgers.html',
  styleUrl: './supplier-ledgers.css'
})
export class SupplierLedgers implements OnInit {
  suppliers: any[] = [];
  selectedSupplier: string = '';
  ledgers : any[]=[];
  finalBalance: number = 0;        // from backend
  totalDebit: any;
  totalCredit: any;
  combinedBalance: any;
  currency: any;

  fromDate: string = '';
  toDate: string = '';
  filteredLedgers: any[] = [];

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



  constructor(
    private accountService:AccountService,
    private ledgerservice:LedgerService
  ){}
  
  exportExcel(){
    alert('not yet implemented bro')
  }
  exportPDF(){
    alert('not yet implemented bro')
  }


  onSupplierSelect():void{
    if (this.selectedSupplier){
      this.ledgerservice.getSupplierLedger(this.selectedSupplier).subscribe({
        next :(data)=>{
          this.ledgers=data.ledger|| []
          this.finalBalance = data.current_balance || 0;

          this.totalDebit = this.ledgers.reduce((sum, row) => sum + (row.debit || 0), 0);
          this.totalCredit = this.ledgers.reduce((sum, row) => sum + (row.credit || 0), 0);

          // Original combined balance logic (keep as-is)
          this.combinedBalance = this.finalBalance + this.totalDebit + this.totalCredit;

          const selected = this.suppliers.find(c => c.id === +this.selectedSupplier);
          console.log(this.combinedBalance);
          console.log(this.totalCredit);
          console.log(this.totalDebit);

          this.currency = selected?.currency || '';

          // Now compute per-row balance
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

  console.log('Starting (opening) balance:', openingBalance);

  // Ensure ledger rows are in correct date order
  this.ledgers.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  this.ledgers = this.ledgers.map((row, index) => {
    const debit = row.debit || 0;
    const credit = row.credit || 0;

    runningDebit += debit;
    runningCredit += credit;

    const computedBalance = openingBalance + runningDebit + runningCredit;

    console.log(
      `Row ${index + 1} - Date: ${row.date}, Debit: ${debit}, Credit: ${credit}, Computed Balance: ${computedBalance}`
    );

    return {
      ...row,
      computedBalance
    };
  });

}

  

   ngOnInit(): void {
    this.accountService.getAllSuppliers().subscribe({
      next: (data) => this.suppliers = data,
      error: (err) => console.error('Error loading customers', err)
    });
  }

}
