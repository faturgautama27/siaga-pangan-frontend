import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { CardModule } from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { MessageModule } from 'primeng/message';
import { LucideAngularModule, TrendingUp } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FilterBarComponent } from '../../shared/components/filter-bar/filter-bar.component';
import { ApexLineChartComponent, LineChartSeries } from '../../shared/components/apex-line-chart/apex-line-chart.component';
import { ApiService } from '../../core/services/api.service';
import { MasterState } from '../../store/master/master.state';
import { LoadMaster } from '../../store/master/master.actions';

@Component({
  selector: 'app-grafik-perbandingan',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    SelectButtonModule,
    MultiSelectModule,
    DatePickerModule,
    SelectModule,
    SkeletonModule,
    MessageModule,
    LucideAngularModule,
    PageHeaderComponent,
    ApexLineChartComponent,
  ],
  templateUrl: './grafik-perbandingan.component.html',
  styleUrl: './grafik-perbandingan.component.scss',
})
export class GrafikPerbandinganComponent implements OnInit {
  private api = inject(ApiService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly TrendingUp = TrendingUp;

  series: LineChartSeries[] = [];
  isLoading = false;
  errorMessage = '';

  modeOptions = [
    { label: 'Harian',   value: 'daily'   },
    { label: 'Mingguan', value: 'weekly'  },
    { label: 'Bulanan',  value: 'monthly' },
  ];

  filterForm = this.fb.group({
    dateRange:   [null as Date[] | null],
    komoditiId:  [null as number | null],
    wilayahIds:  [[] as number[]],
    mode:        ['daily'],
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

  get selectedKomoditiName(): string {
    const id = this.filterForm.value.komoditiId;
    if (!id) return '';
    return this.store.selectSnapshot(MasterState.komoditi).find((k) => k.id === id)?.nama ?? '';
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadMaster());
  }

  onFilter(): void {
    const { komoditiId } = this.filterForm.value;
    if (!komoditiId) {
      this.errorMessage = 'Pilih komoditi terlebih dahulu.';
      return;
    }
    this.errorMessage = '';
    this.loadData();
  }

  onReset(): void {
    this.filterForm.reset({ mode: 'daily' });
    this.series = [];
  }

  onExportPdf(): void {
    const el = document.getElementById('grafik-content');
    if (!el) return;
    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      html2pdf().from(el).set({
        margin: 10,
        filename: `grafik-perbandingan-${new Date().toISOString().split('T')[0]}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }).save();
    });
  }

  private loadData(): void {
    this.isLoading = true;
    const { komoditiId, wilayahIds, mode } = this.filterForm.value;
    const dateRange = this.filterForm.value.dateRange as Date[] | null;

    const params: Record<string, any> = {
      komoditi_id: komoditiId,
      mode: mode ?? 'daily',
    };

    if (dateRange?.[0]) params['start'] = this.formatDate(dateRange[0]);
    if (dateRange?.[1]) params['end'] = this.formatDate(dateRange[1]);
    if (wilayahIds && wilayahIds.length > 0) {
      params['wilayah_id'] = wilayahIds;
    }

    this.api.get<any>('/grafik', params).subscribe({
      next: (res) => {
        this.series = this.transformToSeries(res.data ?? []);
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  private transformToSeries(data: any[]): LineChartSeries[] {
    // Group by wilayah
    const map = new Map<string, { x: string; y: number | null }[]>();

    for (const row of data) {
      if (!map.has(row.wilayah)) map.set(row.wilayah, []);
      map.get(row.wilayah)!.push({ x: row.periode, y: row.harga != null ? parseFloat(row.harga) : null });
    }

    return Array.from(map.entries()).map(([name, data]) => ({ name, data }));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
