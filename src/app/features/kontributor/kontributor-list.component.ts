import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, Phone, ExternalLink } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

export interface KontributorItem {
  kota_kabupaten: string;
  nama_kontributor: string;
  link_wa: string;
}

@Component({
  selector: 'app-kontributor-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    SkeletonModule,
    LucideAngularModule,
    PageHeaderComponent,
  ],
  templateUrl: './kontributor-list.component.html',
  styleUrl: './kontributor-list.component.scss',
})
export class KontributorListComponent implements OnInit {
  private http = inject(HttpClient);

  readonly Phone = Phone;
  readonly ExternalLink = ExternalLink;

  data = signal<KontributorItem[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.http.get<KontributorItem[]>('/kontributor_datasource.json').subscribe({
      next: (res) => {
        this.data.set(res ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openWhatsApp(link: string): void {
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  }
}
