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
      {
        path: 'ihk',
        loadComponent: () =>
          import('./features/ihk/ihk.component').then((m) => m.IhkComponent),
      },
      {
        path: 'analisa-provinsi',
        loadComponent: () =>
          import('./features/analisa-provinsi/analisa-provinsi.component').then(
            (m) => m.AnalisaProvinsiComponent
          ),
      },
      {
        path: 'ews',
        loadComponent: () =>
          import('./features/ews/ews-list/ews-list.component').then((m) => m.EwsListComponent),
      },
      {
        path: 'ews/riwayat',
        loadComponent: () =>
          import('./features/ews/laporan-riwayat/laporan-riwayat.component').then(
            (m) => m.LaporanRiwayatComponent
          ),
      },
      { path: 'prognosa',         redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'pasar',            redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
