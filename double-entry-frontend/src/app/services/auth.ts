// src/app/services/auth.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api/token/';

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<{ access: string; refresh: string }> {
    return this.http.post<{ access: string; refresh: string }>(this.apiUrl, {
      username,
      password
    });
  }

  storeToken(token: string): void {
    console.log('✅ Token saved to localStorage:', token);
    localStorage.setItem('access_token', token);
  }

  getToken(): string | null {
    const token = localStorage.getItem('access_token');
    console.log('🧪 Token fetched from storage:', token);
    return token;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    console.log('🚪 Logged out and token cleared');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
