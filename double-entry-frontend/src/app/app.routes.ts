// import { Routes } from '@angular/router';

// export const routes: Routes = [];

import { Routes } from '@angular/router';
import { LoginPage } from './pages/login.page';
import { RegisterPage } from './pages/register';
import { MainLayout } from './layouts/main-layout';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginPage },
    { path: 'register', component: RegisterPage },
    
  // {
  //   path: 'dashboard',
  //   loadChildren: () =>
  //     import('./pages/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
  // },
  
  //  {
  //   path: 'add-account',
  //   loadChildren: () =>
  //     import('./pages/add-account/add-account.routes').then(m => m.addAccountRoutes)
  // }
  {
    path: '',
    component: MainLayout,
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then(m => m.dashboardRoutes)
      },
      // {
      //   path: 'add-account',
      //   loadChildren: () => import('./pages/add-account/add-account.routes').then(m => m.addAccountRoutes)
      // },
      {
        path: 'accounts',
        loadChildren: () => import('./pages/accounts/accounts.routes').then(m => m.AccountsRoutes)
      },
      {
        path: 'journal-entries',
        loadChildren: () => import('./pages/journal-entries/journal-entries.routes').then(m => m.JournalEntriesRoutes)
      },
      {
        path: 'customer-ledgers',
        loadChildren: () => import('./pages/customer-ledgers/customer-ledgers.routes').then(m => m.CustomerLedgersRoutes)
      },
      {
        path: 'supplier-ledgers',
        loadChildren: () => import('./pages/supplier-ledgers/supplier-ledgers.routes').then(m => m.SupplierLedgersRoutes)
      },
      {
        path:'reports',
        loadChildren:() => import('./pages/report/report.routes').then(m =>m.ReportRoutes)
      },
      {
        path:'trial-balance',
        loadChildren:() => import('./pages/trial-balance/trial-balance.routes').then(m =>m.TrialBalanceRoutes)
      },
      {
        path:'journal-book',
        loadChildren:() => import('./pages/journal-book/journal-book.routes').then(m =>m.JournalBookRoutes)
      }

    ]
  }
];
