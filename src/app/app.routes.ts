import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'display',
    loadComponent: () =>
      import('./features/public-display/public-display.component').then(
        (m) => m.PublicDisplayComponent
      ),
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
            (m) => m.ExecutiveSummaryComponent
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
      {
        path: 'prognosa',
        loadComponent: () =>
          import('./features/prognosa-stok/prognosa-stok.component').then(
            (m) => m.PrognosaStokComponent
          ),
      },
      {
        path: 'pasar',
        loadComponent: () =>
          import('./features/pasar-pantauan/pasar-pantauan.component').then(
            (m) => m.PasarPantauanComponent
          ),
      },
      {
        path: 'kabid',
        loadComponent: () =>
          import('./features/kabid/kabid-list.component').then(
            (m) => m.KabidListComponent
          ),
      },
      {
        path: 'kontributor',
        loadComponent: () =>
          import('./features/kontributor/kontributor-list.component').then(
            (m) => m.KontributorListComponent
          ),
      },
      {
        path: 'pasar-directory',
        loadComponent: () =>
          import('./features/pasar-directory/pasar-directory-list.component').then(
            (m) => m.PasarDirectoryListComponent
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
    ],
  },
  { path: '**', redirectTo: 'login' },
];
