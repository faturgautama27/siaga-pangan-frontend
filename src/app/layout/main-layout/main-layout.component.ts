import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { ToastModule } from 'primeng/toast';
import {
  LucideAngularModule,
  LayoutDashboard, TrendingUp, BarChart2, MapPin, AlertTriangle,
  TrendingDown, Map, Upload, LogOut, ShieldAlert, Menu, X
} from 'lucide-angular';
import { AuthState } from '../../store/auth/auth.state';
import { Logout } from '../../store/auth/auth.actions';

export interface NavItem {
  label: string;
  icon: any;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    AvatarModule,
    ToastModule,
    LucideAngularModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private store = inject(Store);
  private router = inject(Router);

  readonly ShieldAlert = ShieldAlert;
  readonly LogOut = LogOut;
  readonly Menu = Menu;
  readonly X = X;

  sidebarOpen = true;
  today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  get userName(): string { return this.store.selectSnapshot(AuthState.user)?.nama ?? '-'; }
  get userRole(): string { return this.store.selectSnapshot(AuthState.role) ?? '-'; }
  get userInitial(): string { return this.userName.charAt(0).toUpperCase(); }

  navItems: NavItem[] = [
    { label: 'Dashboard',           icon: LayoutDashboard, route: '/dashboard' },
    { label: 'Harga Harian',        icon: BarChart2,       route: '/harga-harian' },
    { label: 'Grafik Perbandingan', icon: TrendingUp,      route: '/grafik' },
    { label: 'Analisa IHK',         icon: BarChart2,       route: '/ihk' },
    { label: 'Analisa Provinsi',    icon: Map,             route: '/analisa-provinsi' },
    { label: 'Early Warning System',icon: AlertTriangle,   route: '/ews' },
    { label: 'Prognosa Stok',       icon: TrendingDown,    route: '/prognosa' },
    { label: 'Pasar Pantauan',      icon: MapPin,          route: '/pasar' },
    { label: 'Upload Data',         icon: Upload,          route: '/upload', roles: ['admin', 'operator'] },
    { label: 'Riwayat Upload',      icon: Upload,          route: '/upload/riwayat', roles: ['admin', 'operator'] },
  ];

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout(): void {
    this.store.dispatch(new Logout());
  }
}
