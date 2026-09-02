import {
  Component, inject, OnInit, AfterViewInit, OnDestroy,
  signal, viewChild, ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePickerModule } from 'primeng/datepicker';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { Store } from '@ngxs/store';
import {
  LucideAngularModule,
  AlertTriangle, FileText, Package, MapPin, TrendingUp, TrendingDown, Building, UserCheck, Phone,
} from 'lucide-angular';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ApexLineChartComponent, LineChartSeries } from '../../shared/components/apex-line-chart/apex-line-chart.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { ApiService } from '../../core/services/api.service';
import { MasterState } from '../../store/master/master.state';
import { LoadMaster } from '../../store/master/master.actions';
import { formatDateToYYYYMMDD, getTodayYYYYMMDD } from '../../shared/utils/date-utils';

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

export interface KabidItem {
  kabupaten_kota: string;
  nomenklatur: string;
  kepala_dinas: {
    nama: string;
    whatsapp: string;
  };
}

export interface KabidResponse {
  data: KabidItem[];
}

@Component({
  selector: 'app-executive-summary',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    SkeletonModule,
    DatePickerModule,
    NgApexchartsModule,
    LucideAngularModule,
    StatusBadgeComponent,
    ApexLineChartComponent,
    RupiahPipe,
  ],
  templateUrl: './executive-summary.component.html',
  styleUrl: './executive-summary.component.scss',
})
export class ExecutiveSummaryComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private store = inject(Store);
  private http = inject(HttpClient);
  private leafletMap: any = null;
  private mapReady?: Promise<void>;

  // Div map ada di luar blok @if sehingga persisten — tidak pernah dihancurkan
  // saat ganti tanggal / loading state, jadi instance Leaflet selalu valid.
  private jatengMapEl = viewChild<ElementRef<HTMLDivElement>>('jatengMap');

  readonly AlertTriangle = AlertTriangle;
  readonly FileText = FileText;
  readonly Package = Package;
  readonly MapPin = MapPin;
  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly BuildingIcon = Building;
  readonly UserCheckIcon = UserCheck;
  readonly PhoneIcon = Phone;

  summaryData = signal<ExecutiveSummaryData | null>(null);
  isLoading = signal(false);
  lastUpdated = signal('');

  kabidData = signal<KabidItem[]>([]);

  statusCounts = signal({ aman: 0, waspada: 0, koordinasi: 0 });
  donutSeries = signal<number[]>([0, 0, 0]);

  volatilList = signal<{ id: number; nama: string; range_harga: number; rata: number }[]>([]);
  maxRange = signal(1);

  trendSeries = signal<LineChartSeries[]>([]);
  trendTitle = signal('');

  tanggal = getTodayYYYYMMDD();

  filterForm = this.fb.group({
    tanggal: [new Date() as Date | null],
  });

  donutOptions: any = {
    chart: {
      type: 'donut',
      height: 235,
      fontFamily: 'inherit',
      animations: { enabled: false },
      toolbar: { show: false },
    },
    labels: ['Aman', 'Waspada', 'Koordinasi'],
    colors: ['#22c55e', '#f59e0b', '#ef4444'],
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { width: 2, colors: ['#ffffff'] },
    plotOptions: {
      pie: {
        donut: {
          size: '76%',
          labels: {
            show: true,
            name: { fontSize: '11px', color: '#94a3b8', offsetY: 10 },
            value: {
              fontSize: '28px',
              fontWeight: 700,
              color: '#0f172a',
              offsetY: -4,
              fontFamily: 'Inter, sans-serif',
            },
            total: {
              show: true,
              label: 'TOTAL WILAYAH',
              fontSize: '10px',
              color: '#94a3b8',
            },
          },
        },
      },
    },
    tooltip: { enabled: true },
  };

  ngOnInit(): void {
    this.store.dispatch(new LoadMaster());
    this.loadData();
    this.loadKabidData();
  }

  ngAfterViewInit(): void {
    // Div map sudah pasti ada (di luar @if) — init sekali di sini.
    // Jika data sudah datang lebih dulu, langsung gambar markernya.
    this.ensureMap().then(() => {
      if (this.summaryData()) this.updateMapData();
    });
  }

  ngOnDestroy(): void {
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
  }

  get totalKomoditi(): number {
    return this.store.selectSnapshot(MasterState.komoditi).length;
  }

  get tanggalLabel(): string {
    return new Date(this.tanggal + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  loadData(): void {
    const tanggal = this.filterForm.value.tanggal;
    if (!tanggal) return;
    this.tanggal = formatDateToYYYYMMDD(tanggal);
    this.isLoading.set(true);

    this.api.get<any>('/executive-summary', { tanggal: this.tanggal }).subscribe({
      next: (res) => {
        const data: ExecutiveSummaryData = res.data;
        this.summaryData.set(data);
        this.isLoading.set(false);
        this.lastUpdated.set(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));

        this.computeDistributions(data);
        this.computeVolatil(data);

        // Map persisten — cukup refresh marker, tidak perlu re-init
        this.ensureMap().then(() => this.updateMapData());

        // Tren 7 hari untuk komoditi paling volatil
        const top = data.komoditi_volatil?.[0];
        if (top?.id) {
          this.loadTrend(top.id, top.nama);
        } else {
          this.trendSeries.set([]);
          this.trendTitle.set('');
        }
      },
      error: () => this.isLoading.set(false),
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

  barWidth(range: number): number {
    const max = this.maxRange();
    return max > 0 ? Math.max(6, Math.round((range / max) * 100)) : 0;
  }

  private computeDistributions(data: ExecutiveSummaryData): void {
    const c = { aman: 0, waspada: 0, koordinasi: 0 };
    for (const w of data.status_wilayah ?? []) {
      if (w.status === 'Aman') c.aman++;
      else if (w.status === 'Waspada') c.waspada++;
      else c.koordinasi++;
    }
    this.statusCounts.set(c);
    this.donutSeries.set([c.aman, c.waspada, c.koordinasi]);
  }

  private computeVolatil(data: ExecutiveSummaryData): void {
    const list = [...(data.komoditi_volatil ?? [])].sort((a, b) => b.range_harga - a.range_harga);
    this.volatilList.set(list);
    this.maxRange.set(list.length ? list[0].range_harga : 1);
  }

  /**
   * Ambil tren harian 7 hari untuk satu komoditi, agregasi rata-rata
   * seluruh wilayah menjadi satu garis tingkat provinsi.
   */
  private loadTrend(komoditiId: number, nama: string): void {
    const end = new Date(this.tanggal + 'T00:00:00');
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    this.api.get<any>('/grafik', {
      komoditi_id: komoditiId,
      mode: 'daily',
      start: formatDateToYYYYMMDD(start),
      end: formatDateToYYYYMMDD(end),
    }).subscribe({
      next: (res) => {
        const rows: { periode: string; harga: string | null }[] = res.data ?? [];

        // Agregasi rata-rata antar wilayah per tanggal
        const byPeriode = new Map<string, { sum: number; n: number }>();
        for (const r of rows) {
          if (r.harga == null) continue;
          const cur = byPeriode.get(r.periode) ?? { sum: 0, n: 0 };
          cur.sum += parseFloat(String(r.harga));
          cur.n += 1;
          byPeriode.set(r.periode, cur);
        }

        const points = Array.from(byPeriode.entries())
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([periode, v]) => ({
            x: new Date(periode + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            y: Math.round(v.sum / v.n),
          }));

        this.trendTitle.set(nama);
        this.trendSeries.set(points.length ? [{ name: 'Rata-rata Provinsi', data: points }] : []);
      },
      error: () => {
        this.trendSeries.set([]);
      },
    });
  }

  /**
   * Inisialisasi map tepat satu kali. Promise di-memoize sehingga pemanggilan
   * berulang (dari ngAfterViewInit maupun loadData) aman dan terurut —
   * updateMapData selalu jalan SETELAH async import Leaflet selesai.
   */
  private ensureMap(): Promise<void> {
    this.mapReady ??= (async () => {
      const L = await import('leaflet').then(m => m.default ?? m);

      // Komponen bisa saja sudah destroy saat import selesai
      const host = this.jatengMapEl()?.nativeElement;
      if (!host) return;

      this.leafletMap = L.map(host, {
        center: [-7.15, 110.14],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        opacity: 0.35,
      }).addTo(this.leafletMap);
    })();
    return this.mapReady;
  }

  private async updateMapData(): Promise<void> {
    const data = this.summaryData();
    if (!this.leafletMap || !data) return;

    const L = await import('leaflet').then(m => m.default ?? m);

    // Hapus layer marker lama (tile layer tetap)
    this.leafletMap.eachLayer((layer: any) => {
      if (layer.options?.pane !== 'tilePane') {
        this.leafletMap.removeLayer(layer);
      }
    });

    // Buat circle marker per wilayah berdasarkan status
    data.status_wilayah.forEach((w) => {
      const color = this.getStatusColor(w.status);
      const coords = this.getWilayahCoords(w.kode_kemendagri);
      if (!coords) return;

      L.circleMarker(coords, {
        radius: w.jumlah_alert > 0 ? 9 + w.jumlah_alert : 6,
        fillColor: color,
        color: '#ffffff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.85,
      })
        .addTo(this.leafletMap)
        .bindTooltip(
          `<strong>${w.wilayah}</strong><br>${w.status} · ${w.jumlah_alert} alert`,
          { direction: 'top', offset: [0, -6] },
        );
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

  loadKabidData(): void {
    this.http.get<KabidResponse>('/kabid_datasource.json').subscribe({
      next: (res) => {
        this.kabidData.set(res.data ?? []);
      },
      error: () => {
        this.kabidData.set([]);
      },
    });
  }

  formatPhoneKabid(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length >= 11) {
      return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8)}`;
    }
    return phone;
  }

  openWhatsAppKabid(phone: string, name: string): void {
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, '');
    const intlPhone = cleaned.startsWith('0') ? '62' + cleaned.slice(1) : cleaned;
    const message = encodeURIComponent(`Halo Bapak/Ibu ${name}, `);
    const link = `https://wa.me/${intlPhone}?text=${message}`;
    window.open(link, '_blank', 'noopener,noreferrer');
  }
}