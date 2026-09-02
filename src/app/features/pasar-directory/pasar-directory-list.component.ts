import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, MapPin, ExternalLink } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

export interface PasarDirectoryItem {
  kabupaten_kota: string;
  nama_pasar: string;
  link_gmaps: string;
}

@Component({
  selector: 'app-pasar-directory-list',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    SkeletonModule,
    LucideAngularModule,
    PageHeaderComponent,
  ],
  templateUrl: './pasar-directory-list.component.html',
  styleUrl: './pasar-directory-list.component.scss',
})
export class PasarDirectoryListComponent implements OnInit {
  private http = inject(HttpClient);

  readonly MapPin = MapPin;
  readonly ExternalLink = ExternalLink;

  data = signal<PasarDirectoryItem[]>([]);
  isLoading = signal(false);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.http.get<PasarDirectoryItem[]>('/pasar_pantauan_datasource.json').subscribe({
      next: (res) => {
        this.data.set(res ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  openMaps(link: string): void {
    if (link) window.open(link, '_blank', 'noopener,noreferrer');
  }
}
