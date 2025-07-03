import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './login.page.html'
})
export class LoginPage {
  username = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  login(): void {
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.auth.storeToken(res.access);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Login error:', err);
        alert('Invalid credentials or server error.');
      }
    });
  }
}
