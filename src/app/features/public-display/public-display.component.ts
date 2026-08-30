import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { komoditiImage } from '../../shared/utils/komoditi-icon';
import { environment } from '../../../environments/environment';

interface PriceData {
  komoditi: string;
  harga: number;
  selisih: number;
  persentase: number;
  satuan: string;
  wilayah?: string;
}

@Component({
  selector: 'app-public-display',
  standalone: true,
  imports: [CommonModule, RupiahPipe],
  templateUrl: './public-display.component.html',
  styleUrl: './public-display.component.scss'
})
export class PublicDisplayComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private refreshSubscription?: Subscription;
  
  prices = signal<PriceData[]>([]);
  currentTime = signal<string>('');
  currentDate = signal<string>('');
  isLoading = signal<boolean>(true);
  
  protected readonly komoditiImage = komoditiImage;

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

  private loadPrices() {
    this.isLoading.set(true);
    
    // Mock data - ganti dengan API call sebenarnya
    // this.http.get<any>(`${environment.apiUrl}/public/harga-harian`).subscribe({...})
    
    // Temporary mock data
    setTimeout(() => {
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
      this.isLoading.set(false);
    }, 500);
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
}
