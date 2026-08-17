import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePickerModule } from 'primeng/datepicker';
import { LucideAngularModule, TrendingUp, TrendingDown, Package } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { ApiService } from '../../core/services/api.service';

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

  data: PrognosaItem[] = [];
  isLoading = false;
  tanggal = new Date().toISOString().split('T')[0];

  filterForm = this.fb.group({
    tanggal: [new Date() as Date | null],
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const tanggal = this.filterForm.value.tanggal;
    if (!tanggal) return;
    this.tanggal = tanggal.toISOString().split('T')[0];
    this.isLoading = true;
    this.data = [];

    this.api.get<any>('/prognosa-stok', { tanggal: this.tanggal }).subscribe({
      next: (res) => {
        this.data = res.data ?? [];
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; },
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
