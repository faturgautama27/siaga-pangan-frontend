import {
  Component, inject, OnInit, OnDestroy, DestroyRef, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RouterOutlet, RouterLink, RouterLinkActive, Router,
  NavigationEnd, Event as RouterEvent,
} from '@angular/router';
import { Store } from '@ngxs/store';
import { filter } from 'rxjs';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { MenuItem } from 'primeng/api';
import {
  LucideAngularModule,
  LayoutDashboard, TrendingUp, BarChart2, PieChart, MapPin, AlertTriangle,
  TrendingDown, Map, Upload, History, LogOut, ShieldAlert, PanelLeft, Bell, Clock3,
} from 'lucide-angular';
import { AuthState } from '../../store/auth/auth.state';
import { Logout } from '../../store/auth/auth.actions';

interface NavItem {
  label: string;
  icon: any;
  route: string;
  roles?: string[];
  dot?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AvatarModule,
    MenuModule,
    ToastModule,
    LucideAngularModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly ShieldAlert = ShieldAlert;
  readonly PanelLeft = PanelLeft;
  readonly Bell = Bell;
  readonly Clock3 = Clock3;
  readonly LogOut = LogOut;

  isSmallScreen = typeof window !== 'undefined' && window.innerWidth < 1024;
  sidebarOpen = !this.isSmallScreen;

  pageTitle = signal('Dashboard');
  clock = signal(this.nowWib());

  userMenuModel: MenuItem[] = [];

  get userName(): string { return this.store.selectSnapshot(AuthState.user)?.nama ?? '-'; }
  get userRole(): string { return this.store.selectSnapshot(AuthState.role) ?? '-'; }
  get userInitial(): string { return this.userName.charAt(0).toUpperCase(); }

  navGroups: NavGroup[] = [
    {
      label: 'Utama',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, route: '/dashboard' },
      ],
    },
    {
      label: 'Monitoring',
      items: [
        { label: 'Harga Harian', icon: BarChart2, route: '/harga-harian' },
        { label: 'Grafik Harga', icon: TrendingUp, route: '/grafik' },
      ],
    },
    {
      label: 'Analisa',
      items: [
        { label: 'Analisa IHK', icon: PieChart, route: '/ihk' },
        { label: 'Analisa Provinsi', icon: Map, route: '/analisa-provinsi' },
        { label: 'Prognosa Stok', icon: TrendingDown, route: '/prognosa' },
      ],
    },
    {
      label: 'Operasional',
      items: [
        { label: 'Early Warning', icon: AlertTriangle, route: '/ews', dot: true },
        { label: 'Pasar Pantauan', icon: MapPin, route: '/pasar' },
      ],
    },
    {
      label: 'Administrasi',
      items: [
        { label: 'Upload Data', icon: Upload, route: '/upload', roles: ['admin', 'operator'] },
        { label: 'Riwayat Upload', icon: History, route: '/upload/riwayat', roles: ['admin', 'operator'] },
      ],
    },
  ];

  ngOnInit(): void {
    // Jam live — update tiap detik
    const timer = setInterval(() => this.clock.set(this.nowWib()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));

    // Judul halaman mengikuti route aktif
    this.router.events
      .pipe(
        filter((e: RouterEvent) => e instanceof NavigationEnd),
      )
      .subscribe(() => this.updatePageTitle());
    this.updatePageTitle();

    // Dropdown user
    this.userMenuModel = [
      {
        label: this.userName,
        disabled: true,
        style: { fontWeight: '700', color: '#0f172a', fontSize: '13px' },
      },
      {
        label: this.userRole.toUpperCase(),
        disabled: true,
        style: { fontSize: '10px', letterSpacing: '0.08em', color: '#94a3b8' },
      },
      { separator: true },
      {
        label: 'Keluar',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  ngOnDestroy(): void {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar(): void {
    if (this.isSmallScreen) this.sidebarOpen = false;
  }

  openUserMenu(event: Event, menu: any): void {
    menu.toggle({ currentTarget: event.target });
  }

  logout(): void {
    this.store.dispatch(new Logout());
  }

  private updatePageTitle(): void {
    const url = this.router.url.split('?')[0];
    const all = this.navGroups.flatMap((g) => g.items);
    const found =
      all.find((i) => url === i.route || url.startsWith(i.route + '/')) ??
      all.find((i) => url.startsWith(i.route));
    this.pageTitle.set(found?.label ?? 'Dashboard');
  }

  private nowWib(): string {
    return new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jakarta',
    }) + ' WIB';
  }
}
