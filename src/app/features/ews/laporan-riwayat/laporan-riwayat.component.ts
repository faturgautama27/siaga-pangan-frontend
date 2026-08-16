import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { Store } from '@ngxs/store';
import { LucideAngularModule, FileText } from 'lucide-angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ApiService } from '../../../core/services/api.service';
import { MasterState } from '../../../store/master/master.state';
import { LoadMaster } from '../../../store/master/master.actions';

export interface LaporanKoordinasi {
  id: string;
  tanggal: string;
  wilayah: string;
  komoditi: string;
  isi_laporan: string;
  pic: string;
  koordinator: string;
  status: string;
  created_at: string;
}

@Component({
  selector: 'app-laporan-riwayat',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    DatePickerModule,
    SelectModule,
    LucideAngularModule,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './laporan-riwayat.component.html',
  styleUrl: './laporan-riwayat.component.scss',
})
export class LaporanRiwayatComponent implements OnInit {
  private api = inject(ApiService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly FileText = FileText;

  data: LaporanKoordinasi[] = [];
  isLoading = false;
  totalRecords = 0;
  pageSize = 50;

  filterForm = this.fb.group({
    dateRange:  [null as Date[] | null],
    wilayahId:  [null as number | null],
    komoditiId: [null as number | null],
  });

  get wilayahOptions() {
    return this.store.selectSnapshot(MasterState.wilayah).map((w) => ({
      label: w.nama, value: w.id,
    }));
  }

  get komoditiOptions() {
    return this.store.selectSnapshot(MasterState.komoditi).map((k) => ({
      label: k.nama, value: k.id,
    }));
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadMaster());
    this.loadData();
  }

  loadData(page = 1): void {
    this.isLoading = true;
    const params: Record<string, any> = { page, limit: this.pageSize };
    const dateRange = this.filterForm.value.dateRange as Date[] | null;
    const { wilayahId, komoditiId } = this.filterForm.value;

    if (dateRange?.[0]) params['start'] = this.formatDate(dateRange[0]);
    if (dateRange?.[1]) params['end']   = this.formatDate(dateRange[1]);
    if (wilayahId)  params['wilayah_id']  = wilayahId;
    if (komoditiId) params['komoditi_id'] = komoditiId;

    this.api.get<any>('/laporan-koordinasi', params).subscribe({
      next: (res) => {
        this.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? this.data.length;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onFilter(): void { this.loadData(1); }
  onReset(): void { this.filterForm.reset(); this.loadData(1); }
  onPageChange(event: any): void { this.loadData(Math.floor(event.first / event.rows) + 1); }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
