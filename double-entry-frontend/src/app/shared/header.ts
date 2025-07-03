// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-header',
//   imports: [],
//   templateUrl: './header.html',
//   styleUrl: './header.css'
// })
// export class Header {

// }
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  
})
export class Header {
  menuOpen = false;
  logout() {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
  }
}
