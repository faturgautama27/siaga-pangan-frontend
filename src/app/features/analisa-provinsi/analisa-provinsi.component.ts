import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { LucideAngularModule, Map } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ApexBarChartComponent, BarChartSeries } from '../../shared/components/apex-bar-chart/apex-bar-chart.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { ApiService } from '../../core/services/api.service';
import { MasterState } from '../../store/master/master.state';
import { LoadMaster } from '../../store/master/master.actions';
import { formatDateToYYYYMMDD, getTodayYYYYMMDD } from '../../shared/utils/date-utils';

export interface AnalisaRow {
  wilayah_id: number;
  wilayah: string;
  kode_kemendagri: string;
  harga: number;
  rata_provinsi: number;
  status_het_hap: string;
  status_provinsi: string;
  gap_het: number | null;
  gap_hap: number | null;
  gap_rata_provinsi: number | null;
}

@Component({
  selector: 'app-analisa-provinsi',
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
  templateUrl: './analisa-provinsi.component.html',
  styleUrl: './analisa-provinsi.component.scss',
})
export class AnalisaProvinsiComponent implements OnInit {
  private api = inject(ApiService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly Map = Map;

  data: AnalisaRow[] = [];
  isLoading = false;
  errorMessage = '';
  rataProvinsi = 0;

  chartSeries: BarChartSeries[] = [];
  chartCategories: string[] = [];

  filterForm = this.fb.group({
    komoditiId: [null as number | null],
    tanggal:    [null as Date | null],
  });

  get komoditiOptions() {
    return this.store.selectSnapshot(MasterState.komoditi).map((k) => ({
      label: k.nama,
      value: k.id,
    }));
  }

  get selectedKomoditiName(): string {
    const id = this.filterForm.value.komoditiId;
    return this.store.selectSnapshot(MasterState.komoditi).find((k) => k.id === id)?.nama ?? '';
  }

  ngOnInit(): void {
    this.store.dispatch(new LoadMaster());
  }

  onFilter(): void {
    const { komoditiId, tanggal } = this.filterForm.value;
    if (!komoditiId || !tanggal) {
      this.errorMessage = 'Pilih komoditi dan tanggal.';
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    this.data = [];

    this.api.get<any>('/analisa-provinsi', {
      komoditi_id: komoditiId,
      tanggal: this.formatDate(tanggal),
    }).subscribe({
      next: (res) => {
        this.data = res.data ?? [];
        if (this.data.length > 0) {
          this.rataProvinsi = this.data[0].rata_provinsi;
          this.buildChart();
        }
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
    const el = document.getElementById('analisa-content');
    if (!el) return;
    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      html2pdf().from(el).set({
        margin: 10,
        filename: `analisa-provinsi-${getTodayYYYYMMDD()}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }).save();
    });
  }

  getGapColor(gap: number | null): string {
    if (gap === null) return 'text-gray-400';
    if (gap > 0) return 'text-red-600 font-semibold';
    if (gap < 0) return 'text-green-600';
    return 'text-gray-600';
  }

  private buildChart(): void {
    this.chartCategories = this.data.map((r) => r.wilayah);
    this.chartSeries = [
      { name: 'Harga', data: this.data.map((r) => r.harga) },
    ];
  }

  private formatDate(date: Date): string {
    return formatDateToYYYYMMDD(date);
  }
}
