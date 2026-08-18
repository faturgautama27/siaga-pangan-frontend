import { Component, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePickerModule } from 'primeng/datepicker';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, AlertTriangle, FileText } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { ApiService } from '../../core/services/api.service';

export interface ExecutiveSummaryData {
  tanggal: string;
  kpi: {
    komoditi_di_atas_het_hap: number;
    alert_ews_aktif: number;
    laporan_masuk: number;
  };
  status_wilayah: {
    wilayah_id: number;
    wilayah: string;
    kode_kemendagri: string;
    jumlah_alert: number;
    status: string;
  }[];
  komoditi_volatil: {
    id: number;
    nama: string;
    range_harga: number;
    rata: number;
  }[];
  tindak_lanjut: {
    wilayah: string;
    komoditi: string;
    status: string;
    isi_laporan: string;
  }[];
}

@Component({
  selector: 'app-executive-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    SkeletonModule,
    DatePickerModule,
    LucideAngularModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    RupiahPipe,
  ],
  templateUrl: './executive-summary.component.html',
  styleUrl: './executive-summary.component.scss',
})
export class ExecutiveSummaryComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private leafletMap: any = null;

  readonly AlertTriangle = AlertTriangle;
  readonly FileText = FileText;

  summaryData: ExecutiveSummaryData | null = null;
  isLoading = false;
  tanggal = new Date().toISOString().split('T')[0];

  filterForm = this.fb.group({
    tanggal: [new Date() as Date | null],
  });

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
  }

  loadData(): void {
    const tanggal = this.filterForm.value.tanggal;
    if (!tanggal) return;
    this.tanggal = tanggal.toISOString().split('T')[0];
    this.isLoading = true;

    this.api.get<any>('/executive-summary', { tanggal: this.tanggal }).subscribe({
      next: (res) => {
        this.summaryData = res.data;
        this.isLoading = false;
        // Render ulang map dengan data baru
        if (this.leafletMap) {
          this.updateMapData();
        }
      },
      error: () => { this.isLoading = false; },
    });
  }

  onTanggalChange(): void {
    this.loadData();
  }

  onExportPdf(): void {
    const el = document.getElementById('executive-content');
    if (!el) return;
    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      html2pdf().from(el).set({
        margin: 10,
        filename: `executive-summary-${this.tanggal}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      }).save();
    });
  }

  getStatusColor(status: string): string {
    if (status === 'Aman') return '#22c55e';
    if (status === 'Waspada') return '#f59e0b';
    return '#ef4444';
  }

  private async initMap(): Promise<void> {
    // Lazy import Leaflet untuk menghindari SSR issue
    const L = await import('leaflet').then(m => m.default ?? m);

    const mapEl = document.getElementById('jateng-map');
    if (!mapEl) return;

    this.leafletMap = L.map('jateng-map', {
      center: [-7.15, 110.14],
      zoom: 7,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.4,
    }).addTo(this.leafletMap);

    if (this.summaryData) {
      this.updateMapData();
    }
  }

  private async updateMapData(): Promise<void> {
    if (!this.leafletMap || !this.summaryData) return;

    const L = await import('leaflet').then(m => m.default ?? m);

    // Hapus layer lama
    this.leafletMap.eachLayer((layer: any) => {
      if (layer.options?.pane !== 'tilePane') {
        this.leafletMap.removeLayer(layer);
      }
    });

    // Tambahkan tile layer kembali
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      opacity: 0.4,
    }).addTo(this.leafletMap);

    // Buat circle marker per wilayah berdasarkan status
    this.summaryData.status_wilayah.forEach((w) => {
      const color = this.getStatusColor(w.status);
      // Koordinat kab/kota Jawa Tengah (pusat approx)
      const coords = this.getWilayahCoords(w.kode_kemendagri);
      if (!coords) return;

      L.circleMarker(coords, {
        radius: 8 + w.jumlah_alert,
        fillColor: color,
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      })
        .addTo(this.leafletMap)
        .bindTooltip(`${w.wilayah}: ${w.status} (${w.jumlah_alert} alert)`, { permanent: false });
    });
  }

  // Koordinat pusat kab/kota Jawa Tengah
  private getWilayahCoords(kode: string): [number, number] | null {
    const coords: Record<string, [number, number]> = {
      '3301': [-7.7153, 108.8568], '3302': [-7.4237, 109.2380],
      '3303': [-7.3868, 109.3668], '3304': [-7.3868, 109.7070],
      '3305': [-7.6782, 109.6496], '3306': [-7.7069, 110.0172],
      '3307': [-7.3609, 109.9041], '3308': [-7.4795, 110.2175],
      '3309': [-7.5136, 110.6014], '3310': [-7.7059, 110.6111],
      '3311': [-7.6753, 110.8324], '3312': [-7.8162, 110.9226],
      '3313': [-7.6014, 111.0268], '3314': [-7.4369, 111.0268],
      '3315': [-7.1036, 110.8994], '3316': [-7.0650, 111.4191],
      '3317': [-6.7063, 111.3422], '3318': [-6.7460, 111.0352],
      '3319': [-6.8042, 110.8325], '3320': [-6.5875, 110.6758],
      '3321': [-6.8940, 110.6159], '3322': [-7.3226, 110.4924],
      '3323': [-7.3077, 110.1748], '3324': [-7.0128, 110.2175],
      '3325': [-7.1036, 109.9256], '3326': [-7.0295, 109.6496],
      '3327': [-6.8940, 109.3669], '3328': [-6.8690, 109.1421],
      '3329': [-6.8690, 108.8568], '3371': [-7.4797, 110.2175],
      '3372': [-7.5753, 110.8243], '3373': [-7.3304, 110.5079],
      '3374': [-6.9932, 110.4203], '3375': [-6.8882, 109.6752],
      '3376': [-6.8690, 109.1421],
    };
    return coords[kode] ?? null;
  }
}
