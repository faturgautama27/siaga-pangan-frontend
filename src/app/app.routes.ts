import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then((m) => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/executive-summary/executive-summary.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'harga-harian',
        loadComponent: () =>
          import('./features/harga-harian/harga-harian.component').then(
            (m) => m.HargaHarianComponent
          ),
      },
      {
        path: 'grafik',
        loadComponent: () =>
          import('./features/grafik-perbandingan/grafik-perbandingan.component').then(
            (m) => m.GrafikPerbandinganComponent
          ),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('./features/upload/upload.component').then((m) => m.UploadComponent),
        canActivate: [roleGuard(['admin', 'operator'])],
      },
      {
        path: 'upload/riwayat',
        loadComponent: () =>
          import('./features/upload/riwayat-upload/riwayat-upload.component').then(
            (m) => m.RiwayatUploadComponent
          ),
        canActivate: [roleGuard(['admin', 'operator'])],
      },
      // Placeholder — akan diimplementasi fase berikutnya
      { path: 'ihk',              redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'analisa-provinsi', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'ews',              redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'prognosa',         redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'pasar',            redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
