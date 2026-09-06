import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngxs/store';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { SkeletonModule } from 'primeng/skeleton';
import { LucideAngularModule, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, MapPin, Package, RefreshCw, Clock } from 'lucide-angular';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DisparitasState } from '../../store/disparitas/disparitas.state';
import { LoadDisparitasSummary } from '../../store/disparitas/disparitas.actions';
import { getTodayYYYYMMDD } from '../../shared/utils/date-utils';

@Component({
  selector: 'app-disparitas-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    DatePickerModule,
    SkeletonModule,
    LucideAngularModule,
    PageHeaderComponent,
  ],
  templateUrl: './disparitas-dashboard.component.html',
  styleUrl: './disparitas-dashboard.component.scss',
})
export class DisparitasDashboardComponent implements OnInit {
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly TrendingUp = TrendingUp;
  readonly TrendingDown = TrendingDown;
  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly MapPin = MapPin;
  readonly Package = Package;
  readonly RefreshCw = RefreshCw;
  readonly Clock = Clock;

  summary$ = this.store.select(DisparitasState.summary);
  
  filterForm = this.fb.group({
    tahun: [new Date() as Date | null],
  });

  ngOnInit(): void {
    // Cek apakah summary sudah ada untuk tahun ini
    const currentYear = new Date().getFullYear();
    const summarySnapshot = this.store.selectSnapshot(DisparitasState.summary);
    
    // Hanya load jika belum ada data atau tahun berbeda
    if (!summarySnapshot.data) {
      this.loadData();
    }
  }

  loadData(): void {
    const tahun = this.filterForm.value.tahun;
    if (!tahun) return;
    
    const tahunNum = tahun.getFullYear();
    this.store.dispatch(new LoadDisparitasSummary(tahunNum));
  }

  get tahunLabel(): string {
    const tahun = this.filterForm.value.tahun;
    return tahun ? tahun.getFullYear().toString() : new Date().getFullYear().toString();
  }
}
