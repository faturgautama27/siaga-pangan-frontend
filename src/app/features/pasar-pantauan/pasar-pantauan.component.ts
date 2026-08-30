import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { LucideAngularModule, MapPin, ExternalLink } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ApiService } from '../../core/services/api.service';
import { MasterState } from '../../store/master/master.state';
import { LoadMaster } from '../../store/master/master.actions';

export interface PasarItem {
  id: string;
  nama_pasar: string;
  alamat: string | null;
  latitude: number | null;
  longitude: number | null;
  wilayah: string;
  kode_kemendagri: string;
  maps_url: string | null;
}

@Component({
  selector: 'app-pasar-pantauan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    SelectModule,
    LucideAngularModule,
    PageHeaderComponent,
  ],
  templateUrl: './pasar-pantauan.component.html',
  styleUrl: './pasar-pantauan.component.scss',
})
export class PasarPantauanComponent implements OnInit {
  private api = inject(ApiService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly MapPin = MapPin;
  readonly ExternalLink = ExternalLink;

  data: PasarItem[] = [];
  isLoading = false;
  wilayahOptions: { label: string; value: any }[] = [];

  filterForm = this.fb.group({
    wilayahId: [null as number | null],
  });

  ngOnInit(): void {
    this.store.dispatch(new LoadMaster()).subscribe(() => {
      this.wilayahOptions = [
        { label: 'Semua Wilayah', value: null },
        ...this.store.selectSnapshot(MasterState.wilayah).map((w) => ({
          label: w.nama,
          value: w.id,
        })),
      ];
    });
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    const params: Record<string, any> = {};
    const wilayahId = this.filterForm.value.wilayahId;
    if (wilayahId) params['wilayah_id'] = wilayahId;

    this.api.get<any>('/pasar', params).subscribe({
      next: (res) => {
        this.data = res.data ?? [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onFilter(): void { this.loadData(); }
  onReset(): void { this.filterForm.reset(); this.loadData(); }

  openMaps(url: string | null): void {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }
}
