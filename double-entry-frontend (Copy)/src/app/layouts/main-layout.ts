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
  templateUrl:'./main-layout.html'
})
export class MainLayout {}
