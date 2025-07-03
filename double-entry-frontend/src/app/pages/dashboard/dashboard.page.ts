import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../services/account';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  accountTypes: { name: string, count: number }[] = [];

  accounts: any[] = [];

  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.fetchAccounts();
  }

  fetchAccounts(): void {
    this.accountService.getAllAccounts().subscribe({
      next: (res) => {
        this.accounts = res;
        this.calculateAccountTypes();
      },
      error: (err) => {
        console.error('Error fetching accounts:', err);
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
}

