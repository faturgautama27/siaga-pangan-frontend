import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatusHetHap =
  | 'Di Atas HET'
  | 'Sama dengan HET'
  | 'Di Bawah HET'
  | 'Di Atas HAP'
  | 'Sama dengan HAP'
  | 'Di Bawah HAP'
  | 'Di Atas HAP Maks'
  | 'Di Bawah HAP Min'
  | 'Di Antara HAP'
  | 'Tidak Ada HET/HAP'
  | 'Normal'
  | 'Naik'
  | 'Turun'
  | 'Tetap'
  | 'Di Atas Prov'
  | 'Di Bawah Prov'
  | 'Sama Prov'
  | 'Koordinasi'
  | 'Aman'
  | 'Waspada'
  | 'Belum Lapor'
  | string;

interface BadgeConfig {
  bg: string;
  text: string;
  dot: string;
}

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  @Input() status: StatusHetHap = '';
  @Input() size: 'sm' | 'md' = 'md';

  get config(): BadgeConfig {
    const s = this.status;
    if (!s) return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };

    // Merah — di atas batas / masalah
    if (['Di Atas HET', 'Di Atas HAP', 'Di Atas HAP Maks', 'Di Atas Prov', 'Koordinasi'].includes(s)) {
      return { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' };
    }
    // Hijau — aman / normal
    if (['Aman', 'Normal', 'Di Antara HAP', 'Sama dengan HET', 'Sama dengan HAP', 'Di Bawah HET', 'Sama Prov'].includes(s)) {
      return { bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' };
    }
    // Kuning — waspada / di bawah
    if (['Waspada', 'Di Bawah HAP', 'Di Bawah HAP Min', 'Di Bawah Prov', 'Belum Lapor'].includes(s)) {
      return { bg: 'bg-yellow-50', text: 'text-yellow-700', dot: 'bg-yellow-500' };
    }
    // Biru — naik
    if (s === 'Naik') {
      return { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' };
    }
    // Abu-abu — tetap / tidak ada referensi
    if (['Tetap', 'Tidak Ada HET/HAP'].includes(s)) {
      return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
    }
    // Turun — orange
    if (s === 'Turun') {
      return { bg: 'bg-orange-50', text: 'text-orange-700', dot: 'bg-orange-500' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
  }
}
