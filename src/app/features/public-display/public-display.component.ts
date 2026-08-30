import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { environment } from '../../../environments/environment';
import { formatDateToYYYYMMDD } from '../../shared/utils/date-utils';

interface PriceData {
  komoditi: string;
  harga: number;
  selisih: number;
  persentase: number;
  satuan: string;
}

@Component({
  selector: 'app-public-display',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePickerModule, SkeletonModule, RupiahPipe],
  templateUrl: './public-display.component.html',
  styleUrl: './public-display.component.scss'
})
export class PublicDisplayComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private refreshSubscription?: Subscription;
  
  prices = signal<PriceData[]>([]);
  currentTime = signal<string>('');
  currentDate = signal<string>('');
  isLoading = signal<boolean>(true);
  
  tanggalSebelum = new Date();
  tanggalHariIni = new Date();

  filterForm = this.fb.group({
    tanggalSebelum: [this.defaultYesterday() as Date | null],
    tanggalHariIni: [new Date() as Date | null],
  });

  ngOnInit() {
    this.loadPrices();
    this.updateDateTime();
    
    // Auto refresh setiap 5 menit
    this.refreshSubscription = interval(5 * 60 * 1000).subscribe(() => {
      this.loadPrices();
    });
    
    // Update jam setiap detik
    interval(1000).subscribe(() => this.updateDateTime());
  }

  ngOnDestroy() {
    this.refreshSubscription?.unsubscribe();
  }

  private updateDateTime() {
    const now = new Date();
    this.currentTime.set(now.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }));
    this.currentDate.set(now.toLocaleDateString('id-ID', { 
      weekday: 'long',
      day: 'numeric',
      month: 'long', 
      year: 'numeric' 
    }));
  }

  loadPrices() {
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
    
    const apiUrl = environment.apiUrl || 'http://localhost:8000';
    
    this.http.get<any>(`${apiUrl}/api/harga-rata-rata`, {
      params: {
        tanggal_sebelum: this.formatDate(tanggalSebelum),
        tanggal_hari_ini: this.formatDate(tanggalHariIni)
      }
    }).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Transform data to match display format
          const transformed = response.data
            .filter((item: any) => item.rata_hari_ini !== null)
            .map((item: any) => ({
              komoditi: item.komoditi,
              harga: item.rata_hari_ini,
              selisih: item.selisih || 0,
              persentase: this.calculatePercentage(item.rata_sebelum, item.rata_hari_ini),
              satuan: 'kg' // Default, bisa disesuaikan
            }));
          this.prices.set(transformed);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load prices', err);
        this.isLoading.set(false);
        this.loadMockData();
      }
    });
  }

  onReset(): void {
    this.filterForm.setValue({ 
      tanggalSebelum: this.defaultYesterday(), 
      tanggalHariIni: new Date() 
    });
    this.loadPrices();
  }

  getImagePath(komoditi: string): string {
    const nama = komoditi.toLowerCase();
    
    // Mapping nama komoditi ke file gambar
    const imageMap: Record<string, string> = {
      'beras': 'beras_medium.png',
      'bawang merah': 'bawang_merah.png',
      'bawang putih': 'bawang_putih.png',
      'cabai merah': 'cabai_merah.png',
      'cabai rawit': 'cabai_rawit.png',
      'daging ayam': 'daging_ayam.png',
      'daging sapi': 'daging_sapi.png',
      'telur': 'telur.png',
      'minyak goreng': 'minyakita.png',
      'gula': 'gula_pasir.png',
      'tomat': 'tomat.png',
      'tepung': 'tepung_terigu.png',
      'ikan': 'ikan.png',
      'kedelai': 'kedelai.png'
    };

    // Cari exact match atau partial match
    for (const [key, value] of Object.entries(imageMap)) {
      if (nama.includes(key)) {
        return value;
      }
    }

    return 'logo_transparent.png'; // Fallback
  }

  getTrendIcon(selisih: number): string {
    if (selisih > 0) return 'pi-arrow-up';
    if (selisih < 0) return 'pi-arrow-down';
    return 'pi-minus';
  }

  getTrendClass(selisih: number): string {
    if (selisih > 0) return 'text-red-600';
    if (selisih < 0) return 'text-green-600';
    return 'text-slate-400';
  }

  getBgTrendClass(selisih: number): string {
    if (selisih > 0) return 'bg-red-50 border-red-200';
    if (selisih < 0) return 'bg-green-50 border-green-200';
    return 'bg-slate-50 border-slate-200';
  }

  dayName(date: Date): string {
    return date.toLocaleDateString('id-ID', { weekday: 'long' });
  }

  private formatDate(date: Date): string {
    return formatDateToYYYYMMDD(date);
  }

  private defaultYesterday(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }

  private calculatePercentage(sebelum: number | null, sekarang: number | null): number {
    if (!sebelum || !sekarang || sebelum === 0) return 0;
    return parseFloat((((sekarang - sebelum) / sebelum) * 100).toFixed(1));
  }

  private loadMockData() {
    // Fallback mock data jika API tidak tersedia
    this.prices.set([
      { komoditi: 'Beras Premium', harga: 13500, selisih: -200, persentase: -1.5, satuan: 'kg' },
      { komoditi: 'Bawang Merah', harga: 42000, selisih: 2000, persentase: 5.0, satuan: 'kg' },
      { komoditi: 'Bawang Putih', harga: 38000, selisih: -1000, persentase: -2.6, satuan: 'kg' },
      { komoditi: 'Cabai Merah', harga: 55000, selisih: 5000, persentase: 10.0, satuan: 'kg' },
      { komoditi: 'Cabai Rawit', harga: 68000, selisih: 8000, persentase: 13.3, satuan: 'kg' },
      { komoditi: 'Daging Ayam', harga: 38000, selisih: 0, persentase: 0, satuan: 'kg' },
      { komoditi: 'Daging Sapi', harga: 135000, selisih: -3000, persentase: -2.2, satuan: 'kg' },
      { komoditi: 'Telur Ayam', harga: 28000, selisih: 1000, persentase: 3.7, satuan: 'kg' },
      { komoditi: 'Minyak Goreng', harga: 16500, selisih: -500, persentase: -2.9, satuan: 'liter' },
      { komoditi: 'Gula Pasir', harga: 15000, selisih: 0, persentase: 0, satuan: 'kg' },
      { komoditi: 'Tomat', harga: 12000, selisih: 2000, persentase: 20.0, satuan: 'kg' },
      { komoditi: 'Tepung Terigu', harga: 10500, selisih: -200, persentase: -1.9, satuan: 'kg' },
    ]);
  }
}
