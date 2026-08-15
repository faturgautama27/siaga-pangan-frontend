import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, TrendingUp, TrendingDown, Minus } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { ApiService } from '../../core/services/api.service';
import { MasterState } from '../../store/master/master.state';
import { LoadMaster } from '../../store/master/master.actions';

export interface HargaHarian {
  id: string;
  tanggal: string;
  harga: number;
  wilayah: string;
  kode_kemendagri: string;
  komoditi: string;
  satuan: string;
}

@Component({
  selector: 'app-harga-harian',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    TagModule,
    SkeletonModule,
    LucideAngularModule,
    PageHeaderComponent,
    FilterBarComponent,
    RupiahPipe,
  ],
  templateUrl: './harga-harian.component.html',
  styleUrl: './harga-harian.component.scss',
})
export class HargaHarianComponent implements OnInit {
  private api = inject(ApiService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Minus = Minus;

  data: HargaHarian[] = [];
  isLoading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 50;

  filterForm = this.fb.group({
    dateRange: [null as Date[] | null],
    wilayahId: [null as number | null],
    komoditiId: [null as number | null],
  });

  get wilayahOptions() {
    return this.store.selectSnapshot(MasterState.wilayah).map((w) => ({
      label: w.nama,
      value: w.id,
    }));
  }

  get komoditiOptions() {
    return this.store.selectSnapshot(MasterState.komoditi).map((k) => ({
      label: k.nama,
      value: k.id,
    }));
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadMaster());
    this.loadData();
  }

  loadData(page = 1): void {
    this.isLoading = true;
    this.currentPage = page;

    const params: Record<string, any> = {
      page,
      limit: this.pageSize,
    };

    const dateRange = this.filterForm.value.dateRange as Date[] | null;
    const wilayahId = this.filterForm.value.wilayahId;
    const komoditiId = this.filterForm.value.komoditiId;

    if (dateRange?.[0]) params['start'] = this.formatDate(dateRange[0]);
    if (dateRange?.[1]) params['end'] = this.formatDate(dateRange[1]);
    if (wilayahId) params['wilayah_id'] = wilayahId;
    if (komoditiId) params['komoditi_id'] = komoditiId;

    this.api.get<any>('/harga-harian', params).subscribe({
      next: (res) => {
        this.data = res.data ?? [];
        this.totalRecords = res.meta?.total ?? 0;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onFilter(): void { this.loadData(1); }
  onReset(): void { this.filterForm.reset(); this.loadData(1); }
  onPageChange(event: any): void { this.loadData(Math.floor(event.first / event.rows) + 1); }

  onExportPdf(): void {
    const el = document.getElementById('harga-harian-table');
    if (!el) return;
    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      html2pdf().from(el).set({
        margin: 10,
        filename: `harga-harian-${new Date().toISOString().split('T')[0]}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }).save();
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
