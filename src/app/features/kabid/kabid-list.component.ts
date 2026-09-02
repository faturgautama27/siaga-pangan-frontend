import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, Building, Users, User, UserCheck, Phone, ExternalLink, ChevronDown } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

export interface BidangItem {
  nama_bidang: string;
  kepala_bidang: string;
  whatsapp: string;
}

export interface KabidItem {
  kabupaten_kota: string;
  nomenklatur: string;
  kepala_dinas: {
    nama: string;
    whatsapp: string;
  };
  bidang: BidangItem[];
}

export interface KabidResponse {
  data: KabidItem[];
}

@Component({
  selector: 'app-kabid-list',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    SkeletonModule,
    LucideAngularModule,
    PageHeaderComponent,
  ],
  templateUrl: './kabid-list.component.html',
  styleUrl: './kabid-list.component.scss',
})
export class KabidListComponent implements OnInit {
  private http = inject(HttpClient);

  readonly Building = Building;
  readonly Users = Users;
  readonly User = User;
  readonly UserCheck = UserCheck;
  readonly Phone = Phone;
  readonly ExternalLink = ExternalLink;
  readonly ChevronDown = ChevronDown;

  data = signal<KabidItem[]>([]);
  isLoading = signal(false);
  expandedItems = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.http.get<KabidResponse>('/kabid_datasource.json').subscribe({
      next: (res) => {
        this.data.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  countBidang(item: KabidItem): number {
    return item.bidang.filter(b => b.kepala_bidang && b.kepala_bidang.trim() !== '').length;
  }

  formatPhone(phone: string): string {
    if (!phone) return '';
    // Format: 08xx-xxxx-xxxx
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    return phone;
  }

  openWhatsApp(phone: string, name: string): void {
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, '');
    const intlPhone = cleaned.startsWith('0') ? '62' + cleaned.slice(1) : cleaned;
    const message = encodeURIComponent(`Halo Bapak/Ibu ${name}, `);
    const link = `https://wa.me/${intlPhone}?text=${message}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  toggleExpand(kabupaten: string): void {
    const expanded = this.expandedItems();
    if (expanded.has(kabupaten)) {
      expanded.delete(kabupaten);
    } else {
      expanded.add(kabupaten);
    }
    this.expandedItems.set(new Set(expanded));
  }

  isExpanded(kabupaten: string): boolean {
    return this.expandedItems().has(kabupaten);
  }
}
