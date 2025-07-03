import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountService {

  private baseUrl = 'http://127.0.0.1:8000/api/accounts/';

  constructor(private http: HttpClient) {}

  getAllAccounts(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  getAllCustomers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}customers/`);
  }
  getAllSuppliers(): Observable<any>{
    return this.http.get<any[]>(`${this.baseUrl}suppliers/`);
  }

  createAccount(data: {
    name: string;
    type: string;
    parent: number | null;
    opening_balance: number;
    currency: string;
    status: string;
  }): Observable<any> {
    return this.http.post(this.baseUrl, data);
  }

  updateAccount(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}${id}/`, data);
  }

  deleteAccount(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}${id}/`);
  }
  getTrialBalance(filters?: any) {
  // Replace /trial-balance with your actual API
  return this.http.get('/api/trial-balance', { params: filters });
}


}
