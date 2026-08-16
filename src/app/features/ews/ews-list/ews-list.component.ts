import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngxs/store';
import { Subscription, timer } from 'rxjs';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { DatePickerModule } from 'primeng/datepicker';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { LucideAngularModule,
  AlertTriangle, CheckCircle, Clock, RefreshCw, FileText
} from 'lucide-angular';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { LaporanFormComponent } from '../laporan-form/laporan-form.component';
import { RupiahPipe } from '../../../shared/pipes/rupiah.pipe';
import { AuthState } from '../../../store/auth/auth.state';
import { EwsState, EwsAlert } from '../../../store/ews/ews.state';
import { LoadEws, EwsTick } from '../../../store/ews/ews.actions';

@Component({
  selector: 'app-ews-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    SkeletonModule,
    DatePickerModule,
    DialogModule,
    ButtonModule,
    TagModule,
    LucideAngularModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    LaporanFormComponent,
    RupiahPipe,
  ],
  templateUrl: './ews-list.component.html',
  styleUrl: './ews-list.component.scss',
})
export class EwsListComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private fb = inject(FormBuilder);
  private timerSub?: Subscription;

  readonly AlertTriangle = AlertTriangle;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly RefreshCw = RefreshCw;
  readonly FileText = FileText;

  alerts$ = this.store.select(EwsState.alerts);
  countdown$ = this.store.select(EwsState.countdown);
  isLoading$ = this.store.select(EwsState.isLoading);

  tanggal = new Date().toISOString().split('T')[0];
  selectedAlert: EwsAlert | null = null;
  showLaporanDialog = false;

  filterForm = this.fb.group({
    tanggal: [new Date() as Date | null],
  });

  get isAllowedToReport(): boolean {
    const role = this.store.selectSnapshot(AuthState.role);
    return ['admin', 'pic', 'koordinator'].includes(role ?? '');
  }

  getAmanCount(alerts: any[]): number {
    return alerts.filter(a => a.status_laporan === 'Aman').length;
  }

  getKoordinasiCount(alerts: any[]): number {
    return alerts.filter(a => a.status_laporan !== 'Aman').length;
  }

  ngOnInit(): void {
    this.loadAlerts();
    // Mulai countdown timer setiap detik via NGXS action
    this.timerSub = timer(0, 1000).subscribe(() => {
      this.store.dispatch(new EwsTick());
    });
  }

  ngOnDestroy(): void {
    this.timerSub?.unsubscribe();
  }

  loadAlerts(): void {
    const tanggal = this.filterForm.value.tanggal;
    if (tanggal) {
      this.tanggal = tanggal.toISOString().split('T')[0];
      this.store.dispatch(new LoadEws(this.tanggal));
    }
  }

  onTanggalChange(): void {
    this.loadAlerts();
  }

  openLaporanDialog(alert: EwsAlert): void {
    this.selectedAlert = alert;
    this.showLaporanDialog = true;
  }

  onLaporanSaved(): void {
    this.showLaporanDialog = false;
    this.selectedAlert = null;
    this.loadAlerts(); // refresh setelah laporan disimpan
  }

  onExportPdf(): void {
    const el = document.getElementById('ews-content');
    if (!el) return;
    import('html2pdf.js').then((mod) => {
      const html2pdf = mod.default ?? mod;
      html2pdf().from(el).set({
        margin: 10,
        filename: `ews-${this.tanggal}.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'landscape', unit: 'mm', format: 'a4' },
      }).save();
    });
  }
}
