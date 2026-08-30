import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import {
  LucideAngularModule,
} from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { komoditiIcon } from '../../shared/utils/komoditi-icon';
import { ApiService } from '../../core/services/api.service';
import { formatDateToYYYYMMDD } from '../../shared/utils/date-utils';

export interface RataRataRow {
  komoditi_id: number;
  komoditi: string;
  ref_type: 'HET' | 'HAP' | null;
  ref_min: number | null;
  ref_max: number | null;
  rata_sebelum: number | null;
  rata_hari_ini: number | null;
  selisih: number | null;
}

@Component({
  selector: 'app-harga-harian',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePickerModule,
    SkeletonModule,
    LucideAngularModule,
    PageHeaderComponent,
    RupiahPipe,
  ],
  templateUrl: './harga-harian.component.html',
  styleUrl: './harga-harian.component.scss',
})
export class HargaHarianComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  protected readonly komoditiIcon = komoditiIcon;

  rows = signal<RataRataRow[]>([]);
  isLoading = signal(false);
  errorMessage = '';

  tanggalSebelum = new Date();
  tanggalHariIni = new Date();

  filterForm = this.fb.group({
    tanggalSebelum: [this.defaultYesterday() as Date | null],
    tanggalHariIni: [new Date() as Date | null],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    let { tanggalSebelum, tanggalHariIni } = this.filterForm.value;
    if (!tanggalSebelum || !tanggalHariIni) return;

    // Auto-swap bila urutan terbalik
    if (tanggalSebelum > tanggalHariIni) {
      [tanggalSebelum, tanggalHariIni] = [tanggalHariIni, tanggalSebelum];
      this.filterForm.patchValue({ tanggalSebelum, tanggalHariIni });
    }

    this.tanggalSebelum = tanggalSebelum;
    this.tanggalHariIni = tanggalHariIni;

    this.isLoading.set(true);
    this.errorMessage = '';
    this.rows.set([]);

    this.api.get<any>('/harga-rata-rata', {
      tanggal_sebelum: this.formatDate(tanggalSebelum),
      tanggal_hari_ini: this.formatDate(tanggalHariIni),
    }).subscribe({
      next: (res) => {
        this.rows.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage = 'Gagal memuat data harga rata-rata.';
      },
    });
  }

  onReset(): void {
    this.filterForm.setValue({ tanggalSebelum: this.defaultYesterday(), tanggalHariIni: new Date() });
    this.loadData();
  }

  dayName(date: Date): string {
    return date.toLocaleDateString('id-ID', { weekday: 'long' });
  }

  refText(row: RataRataRow): string {
    if (!row.ref_type || row.ref_min === null) return 'TIDAK ADA HAP/HET';
    if (row.ref_max !== null) {
      return `${row.ref_type}: ${row.ref_min | 0} - ${row.ref_max | 0}`;
    }
    return `${row.ref_type}: Rp ${Math.round(row.ref_min).toLocaleString('id-ID')}`;
  }

  /** Hari ini melebihi plafon acuan? (di atas HET / di atas HAP maks) */
  isAboveRef(row: RataRataRow): boolean {
    if (!row.ref_type || row.rata_hari_ini === null) return false;
    if (row.ref_type === 'HET') return row.rata_hari_ini > (row.ref_min ?? Infinity);
    if (row.ref_max !== null) return row.rata_hari_ini > row.ref_max;
    return row.rata_hari_ini > (row.ref_min ?? Infinity);
  }

  onExportPdf(): void {
    const el = document.getElementById('harga-content');
    if (!el) return;
    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      html2pdf().from(el).set({
        margin: 10,
        filename: `harga-rata-rata-${this.formatDate(this.tanggalHariIni)}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }).save();
    });
  }

  private formatDate(date: Date): string {
    return formatDateToYYYYMMDD(date);
  }

  private defaultYesterday(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }
}
