import { Injectable } from '@angular/core';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountService {

  public baseUrl = 'http://127.0.0.1:8000/api/accounts/';

  constructor(private http: HttpClient) {}

   getAllAccounts(params: any = {}, url: string = this.baseUrl): Observable<any> {
    // Convert plain object to HttpParams
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      httpParams = httpParams.set(key, params[key]);
    });

    return this.http.get<any>(url, { params: httpParams });
  }

  getAllCustomers(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}customers/`);
  }
  getAllSuppliers(): Observable<any>{
    return this.http.get<any>(`${this.baseUrl}suppliers/`);
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
  getTrialAccounts(): Observable<any> {
  return this.http.get<any>('http://127.0.0.1:8000/api/accounts/accountview/');
}



}
