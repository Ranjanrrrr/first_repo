// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-register',
//   imports: [],
//   templateUrl: './register.html',
//   styleUrl: './register.css'
// })
// export class Register {

// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './register.html'
})
export class RegisterPage {
  username = '';
  password = '';
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  register() {
    const body = { username: this.username, password: this.password };

    this.http.post('http://127.0.0.1:8000/api/register/', body).subscribe({
      next: () => {
        alert('✅ Registration successful. Please login.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error = err.error?.error || '❌ Registration failed';
      }
    });
  }
}
