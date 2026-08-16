import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { LucideAngularModule, BarChart2 } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ApexBarChartComponent, BarChartSeries } from '../../shared/components/apex-bar-chart/apex-bar-chart.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { ApiService } from '../../core/services/api.service';
import { MasterState } from '../../store/master/master.state';
import { LoadMaster } from '../../store/master/master.actions';

export interface IhkRow {
  komoditi_id: number;
  komoditi: string;
  satuan: string;
  harga_tanggal1: number | null;
  harga_tanggal2: number | null;
  status_perubahan: { status: string; selisih: number } | null;
  status_het_hap: string | null;
}

@Component({
  selector: 'app-ihk',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    SkeletonModule,
    SelectModule,
    DatePickerModule,
    LucideAngularModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    ApexBarChartComponent,
    RupiahPipe,
  ],
  templateUrl: './ihk.component.html',
  styleUrl: './ihk.component.scss',
})
export class IhkComponent implements OnInit {
  private api = inject(ApiService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly BarChart2 = BarChart2;

  data: IhkRow[] = [];
  isLoading = false;
  errorMessage = '';

  // ApexCharts bar chart data
  chartSeries: BarChartSeries[] = [];
  chartCategories: string[] = [];

  filterForm = this.fb.group({
    wilayahId: [null as number | null],
    tanggal1:  [null as Date | null],
    tanggal2:  [null as Date | null],
  });

  get wilayahIhkOptions() {
    return this.store.selectSnapshot(MasterState.wilayahIhk).map((w) => ({
      label: w.nama,
      value: w.id,
    }));
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadMaster());
  }

  onFilter(): void {
    const { wilayahId, tanggal1, tanggal2 } = this.filterForm.value;
    if (!wilayahId || !tanggal1 || !tanggal2) {
      this.errorMessage = 'Pilih wilayah, tanggal 1, dan tanggal 2.';
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    this.data = [];

    this.api.get<any>('/ihk', {
      wilayah_id: wilayahId,
      tanggal1: this.formatDate(tanggal1),
      tanggal2: this.formatDate(tanggal2),
    }).subscribe({
      next: (res) => {
        this.data = res.data ?? [];
        this.buildChart();
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
    });
  }

  onReset(): void {
    this.filterForm.reset();
    this.data = [];
    this.chartSeries = [];
    this.chartCategories = [];
  }

  onExportPdf(): void {
    const el = document.getElementById('ihk-content');
    if (!el) return;
    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      html2pdf().from(el).set({
        margin: 10,
        filename: `ihk-${new Date().toISOString().split('T')[0]}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }).save();
    });
  }

  private buildChart(): void {
    const tanggal1Label = this.formatDate(this.filterForm.value.tanggal1!);
    const tanggal2Label = this.formatDate(this.filterForm.value.tanggal2!);

    // Ambil max 10 komoditi untuk chart agar tidak terlalu padat
    const slice = this.data.slice(0, 10);
    this.chartCategories = slice.map((r) => r.komoditi);
    this.chartSeries = [
      { name: tanggal1Label, data: slice.map((r) => r.harga_tanggal1 ?? 0) },
      { name: tanggal2Label, data: slice.map((r) => r.harga_tanggal2 ?? 0) },
    ];
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
