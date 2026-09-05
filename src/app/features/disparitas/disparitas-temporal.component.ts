import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, TrendingUp, AlertCircle, CheckCircle, Filter } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { RupiahPipe } from '../../shared/pipes/rupiah.pipe';
import { DisparitasState } from '../../store/disparitas/disparitas.state';
import { LoadDisparitasTemporal } from '../../store/disparitas/disparitas.actions';
import { MasterState } from '../../store/master/master.state';
import { LoadMaster } from '../../store/master/master.actions';

@Component({
  selector: 'app-disparitas-temporal',
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
  templateUrl: './disparitas-temporal.component.html',
  styleUrl: './disparitas-temporal.component.scss',
})
export class DisparitasTemporalComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly TrendingUp = TrendingUp;
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;
  readonly Filter = Filter;

  temporal$ = this.store.select(DisparitasState.temporal);

  wilayahOptions: any[] = [];
  komoditiOptions: any[] = [];
  statusOptions = [
    { label: 'Semua Status', value: null },
    { label: 'Stabil', value: 'stabil' },
    { label: 'Fluktuatif', value: 'fluktuatif' },
  ];

  filterForm = this.fb.group({
    tahun: [new Date() as Date | null],
    wilayah_id: [null as number | null],
    komoditi_id: [null as number | null],
    status: [null as string | null],
  });

  ngOnInit(): void {
    // Master data sudah di-load di MainLayout, langsung ambil dari snapshot
    const wilayah = this.store.selectSnapshot(MasterState.wilayah);
    const komoditi = this.store.selectSnapshot(MasterState.komoditi);
    
    this.wilayahOptions = [
      { label: 'Semua Wilayah', value: null },
      ...wilayah.map((w: any) => ({
        label: w.nama,
        value: w.id,
      })),
    ];

    this.komoditiOptions = [
      { label: 'Semua Komoditi', value: null },
      ...komoditi.map((k: any) => ({
        label: k.nama,
        value: k.id,
      })),
    ];

    // Cek apakah temporal data sudah ada untuk tahun ini (tanpa filter)
    const currentYear = new Date().getFullYear();
    const temporalSnapshot = this.store.selectSnapshot(DisparitasState.temporal);
    
    // Hanya load jika belum ada data
    if (temporalSnapshot.data.length === 0) {
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

    if (form.wilayah_id) payload.wilayah_id = form.wilayah_id;
    if (form.komoditi_id) payload.komoditi_id = form.komoditi_id;
    if (form.status) payload.status = form.status;

    this.store.dispatch(new LoadDisparitasTemporal(payload));
  }

  onReset(): void {
    this.filterForm.patchValue({
      wilayah_id: null,
      komoditi_id: null,
      status: null,
    });
    this.loadData();
  }

  getStatusSeverity(status: string): string {
    return status === 'stabil' ? 'success' : 'danger';
  }

  getStatusClass(status: string): string {
    return status === 'stabil'
      ? 'bg-green-50 text-green-700 border-green-200'
      : 'bg-red-50 text-red-700 border-red-200';
  }

  get tahunLabel(): string {
    const tahun = this.filterForm.value.tahun;
    return tahun ? tahun.getFullYear().toString() : new Date().getFullYear().toString();
  }
}
