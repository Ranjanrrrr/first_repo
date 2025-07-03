import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LedgerService {
  private baseUrl = 'http://127.0.0.1:8000/api/accounts';

  constructor(private http: HttpClient) {}

  getCustomerLedger(accountId: string): Observable<{ ledger: any[], current_balance: number }> {
    return this.http.get<{ ledger: any[], current_balance: number }>(
      `${this.baseUrl}/${accountId}/ledger/`
    );
  }
  getSupplierLedger(accountId : string):Observable<{ ledger:any[],current_balance: number}>{
    return this.http.get<{ledger:any[],current_balance:number}>(
      `${this.baseUrl}/${accountId}/ledger/`
    );
  }
  

}
