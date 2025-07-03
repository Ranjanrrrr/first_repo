// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-main-layout',
//   imports: [],
//   templateUrl: './main-layout.html',
//   styleUrl: './main-layout.css'
// })
// export class MainLayout {

// }
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../shared/header';
import { Footer } from '../shared/footer';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Footer],
  template: `
    <div class="flex flex-col min-h-screen">
      <app-header></app-header>

      <main class="flex-1 p-6">
        <router-outlet></router-outlet>
      </main>

      <app-footer></app-footer>
    </div>
  `
})
export class MainLayout {}
