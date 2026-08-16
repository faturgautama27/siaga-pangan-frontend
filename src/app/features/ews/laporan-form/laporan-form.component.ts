import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { MessageModule } from 'primeng/message';
import { LucideAngularModule, Send } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { AuthState } from '../../../store/auth/auth.state';
import { EwsAlert } from '../../../store/ews/ews.state';
import { MasterState } from '../../../store/master/master.state';
import { RupiahPipe } from '../../../shared/pipes/rupiah.pipe';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-laporan-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    TextareaModule,
    SelectModule,
    MessageModule,
    LucideAngularModule,
    RupiahPipe,
    StatusBadgeComponent,
  ],
  templateUrl: './laporan-form.component.html',
  styleUrl: './laporan-form.component.scss',
})
export class LaporanFormComponent implements OnInit {
  @Input() visible = false;
  @Input() alert: EwsAlert | null = null;
  @Input() tanggal = '';
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<void>();

  private api = inject(ApiService);
  private store = inject(Store);
  private fb = inject(FormBuilder);

  readonly Send = Send;

  isSaving = false;
  errorMessage = '';

  statusOptions = [
    { label: 'Koordinasi', value: 'Koordinasi' },
    { label: 'Aman', value: 'Aman' },
  ];

  form = this.fb.group({
    isi_laporan: ['', [Validators.required, Validators.minLength(10)]],
    status: ['Koordinasi', Validators.required],
  });

  get isReadOnly(): boolean {
    const role = this.store.selectSnapshot(AuthState.role);
    return !['admin', 'pic', 'koordinator'].includes(role ?? '');
  }

  get userNama(): string {
    return this.store.selectSnapshot(AuthState.user)?.nama ?? '-';
  }

  ngOnInit(): void {
    if (this.isReadOnly) {
      this.form.disable();
    }
  }

  onHide(): void {
    this.visible = false;
    this.visibleChange.emit(false);
    this.form.reset({ status: 'Koordinasi' });
    this.errorMessage = '';
  }

  onSubmit(): void {
    if (this.form.invalid || !this.alert) return;
    this.isSaving = true;
    this.errorMessage = '';

    const payload = {
      wilayah_id:    this.alert.wilayah_id,
      komoditi_id:   this.alert.komoditi_id,
      tanggal:       this.tanggal,
      isi_laporan:   this.form.value.isi_laporan,
      status:        this.form.value.status,
      pic_id:        1, // default — idealnya dari mapping penanggung_jawab
      koordinator_id: 1,
    };

    this.api.post<any>('/laporan-koordinasi', payload).subscribe({
      next: () => {
        this.isSaving = false;
        this.form.reset({ status: 'Koordinasi' });
        this.saved.emit();
      },
      error: (err) => {
        this.isSaving = false;
        this.errorMessage = err.error?.error?.message ?? 'Gagal menyimpan laporan.';
      },
    });
  }
}
