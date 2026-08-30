import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePickerModule } from 'primeng/datepicker';
import { LucideAngularModule, TrendingUp, TrendingDown, Package } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { ApiService } from '../../core/services/api.service';
import { formatDateToYYYYMMDD, getTodayYYYYMMDD } from '../../shared/utils/date-utils';

export interface PrognosaItem {
  komoditi_id: number;
  komoditi: string;
  rata_provinsi: number;
  potensi_defisit: { harga: number; wilayah: string; kode_kemendagri: string }[];
  potensi_surplus: { harga: number; wilayah: string; kode_kemendagri: string }[];
}

@Component({
  selector: 'app-prognosa-stok',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    SkeletonModule,
    DatePickerModule,
    LucideAngularModule,
    PageHeaderComponent,
    RupiahPipe,
  ],
  templateUrl: './prognosa-stok.component.html',
  styleUrl: './prognosa-stok.component.scss',
})
export class PrognosaStokComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly Package = Package;

  data = signal<PrognosaItem[]>([]);
  isLoading = signal(false);
  tanggal = getTodayYYYYMMDD();

  filterForm = this.fb.group({
    tanggal: [new Date() as Date | null],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const tanggal = this.filterForm.value.tanggal;
    if (!tanggal) return;
    this.tanggal = formatDateToYYYYMMDD(tanggal);
    this.isLoading.set(true);
    this.data.set([]);

    this.api.get<any>('/prognosa-stok', { tanggal: this.tanggal }).subscribe({
      next: (res) => {
        this.data.set(res.data ?? []);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onTanggalChange(): void {
    this.loadData();
  }

  onExportPdf(): void {
    const el = document.getElementById('prognosa-content');
    if (!el) return;
    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      html2pdf().from(el).set({
        margin: 10,
        filename: `prognosa-stok-${this.tanggal}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }).save();
    });
  }
}
