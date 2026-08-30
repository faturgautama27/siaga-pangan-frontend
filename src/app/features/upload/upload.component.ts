import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import { RadioButtonModule } from 'primeng/radiobutton';
import {
  LucideAngularModule,
  Upload, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet, ShieldCheck
} from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';
import { Store } from '@ngxs/store';
import { AuthState } from '../../store/auth/auth.state';

export interface SkipDetail {
  row: number | string;
  reason: string;
}

export interface UploadResult {
  inserted: number;
  updated: number;
  skipped: number;
  skip_detail: SkipDetail[];
  mode?: string;
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule,
    CardModule,
    TableModule,
    TagModule,
    ToastModule,
    MessageModule,
    ProgressBarModule,
    RadioButtonModule,
    LucideAngularModule,
  ],
  providers: [MessageService],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  private api = inject(ApiService);
  private messageService = inject(MessageService);
  private store = inject(Store);

  readonly Upload = Upload;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly FileSpreadsheet = FileSpreadsheet;
  readonly ShieldCheck = ShieldCheck;

  isUploading = false;
  result: UploadResult | null = null;
  errorMessage = '';
  
  // Upload mode
  uploadMode: 'insert_only' | 'full_upsert' = 'insert_only';
  
  // Check if user is admin
  get isAdmin(): boolean {
    const role = this.store.selectSnapshot(AuthState.role);
    return role === 'admin';
  }

  onUpload(event: any): void {
    const file = event.files[0];
    if (!file) return;

    this.isUploading = true;
    this.result = null;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('file', file);
    
    // Build query params based on mode
    const params: any = {};
    if (this.isAdmin && this.uploadMode === 'full_upsert') {
      params.mode = 'full_upsert';
    }

    this.api.postForm<any>('/upload', formData, { params }).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.result = res.data;
        
        const mode = res.data.mode === 'insert_only' ? 'Insert Only' : 'Full Upsert';
        const detail = this.uploadMode === 'insert_only' 
          ? `${res.data.inserted} data baru ditambahkan`
          : `${res.data.inserted} data baru, ${res.data.updated} diperbarui`;
        
        this.messageService.add({
          severity: 'success',
          summary: `Upload Berhasil (${mode})`,
          detail: detail,
        });
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage = err.error?.error?.message ?? 'Upload gagal. Coba lagi.';
        this.messageService.add({
          severity: 'error',
          summary: 'Upload Gagal',
          detail: this.errorMessage,
        });
      },
    });
  }
  
  getModeLabel(): string {
    return this.uploadMode === 'insert_only' 
      ? 'Insert Only (Aman)' 
      : 'Full Upsert (Koreksi)';
  }
  
  getModeDescription(): string {
    return this.uploadMode === 'insert_only'
      ? 'Hanya insert tanggal baru, skip tanggal yang sudah ada (Recommended untuk upload harian)'
      : 'Insert tanggal baru DAN update tanggal existing (Gunakan untuk koreksi data)';
  }
}
