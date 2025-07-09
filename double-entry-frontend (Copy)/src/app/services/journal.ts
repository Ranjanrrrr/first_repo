import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JournalService {

  private baseUrl = 'http://localhost:8000/api';  

  constructor(private http: HttpClient) {}

  getAllEntries(): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/entries/`);
  }

  createEntry(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/entries/`, payload);
  }

  updateEntry(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/entries/${id}/`, payload);
  }

  deleteEntry(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/entries/${id}/`);
  }

  getAllAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/accounts/`);
  }
  getEntriesByAccount(accountId: string): Observable<any[]> {
  return this.http.get<any[]>(`http://127.0.0.1:8000/api/journal/${accountId}/entries/`);
}

}
