import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, MapPin, AlertCircle, CheckCircle, Filter } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { DisparitasState } from '../../store/disparitas/disparitas.state';
import { LoadDisparitasSpatial } from '../../store/disparitas/disparitas.actions';
import { MasterState } from '../../store/master/master.state';
import { LoadMaster } from '../../store/master/master.actions';

@Component({
  selector: 'app-disparitas-spatial',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    CardModule,
    DatePickerModule,
    SelectModule,
    SkeletonModule,
    LucideAngularModule,
    PageHeaderComponent,
    RupiahPipe,
  ],
  templateUrl: './disparitas-spatial.component.html',
  styleUrl: './disparitas-spatial.component.scss',
})
export class DisparitasSpatialComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly MapPin = MapPin;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;
  readonly Filter = Filter;

  spatial$ = this.store.select(DisparitasState.spatial);

  komoditiOptions: any[] = [];
  bulanOptions = [
    { label: 'Semua Bulan', value: null },
    { label: 'Januari', value: 1 },
    { label: 'Februari', value: 2 },
    { label: 'Maret', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Mei', value: 5 },
    { label: 'Juni', value: 6 },
    { label: 'Juli', value: 7 },
    { label: 'Agustus', value: 8 },
    { label: 'September', value: 9 },
    { label: 'Oktober', value: 10 },
    { label: 'November', value: 11 },
    { label: 'Desember', value: 12 },
  ];
  statusOptions = [
    { label: 'Semua Status', value: null },
    { label: 'Wajar', value: 'wajar' },
    { label: 'Tinggi', value: 'tinggi' },
  ];

  filterForm = this.fb.group({
    tahun: [new Date() as Date | null],
    bulan: [null as number | null],
    komoditi_id: [null as number | null],
    status: [null as string | null],
  });

  ngOnInit(): void {
    // Master data sudah di-load di MainLayout, langsung ambil dari snapshot
    const komoditi = this.store.selectSnapshot(MasterState.komoditi);
    
    this.komoditiOptions = [
      { label: 'Semua Komoditi', value: null },
      ...komoditi.map((k: any) => ({
        label: k.nama,
        value: k.id,
      })),
    ];

    // Cek apakah spatial data sudah ada
    const spatialSnapshot = this.store.selectSnapshot(DisparitasState.spatial);
    
    // Hanya load jika belum ada data
    if (spatialSnapshot.data.length === 0) {
      this.loadData();
    }
  }

  loadData(): void {
    const form = this.filterForm.value;
    const tahun = form.tahun;
    if (!tahun) return;

    const payload: any = {
      tahun: tahun.getFullYear(),
    };

    if (form.bulan !== null) payload.bulan = form.bulan;
    if (form.komoditi_id) payload.komoditi_id = form.komoditi_id;
    if (form.status) payload.status = form.status;

    this.store.dispatch(new LoadDisparitasSpatial(payload));
  }

  onReset(): void {
    this.filterForm.patchValue({
      bulan: null,
      komoditi_id: null,
      status: null,
    });
    this.loadData();
  }

  getStatusClass(status: string): string {
    return status === 'wajar'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-orange-50 text-orange-700 border-orange-200';
  }

  getBulanName(bulan: number): string {
    const names = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return names[bulan - 1] || '';
  }

  get tahunLabel(): string {
    const tahun = this.filterForm.value.tahun;
    return tahun ? tahun.getFullYear().toString() : new Date().getFullYear().toString();
  }
}
