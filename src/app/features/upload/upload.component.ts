import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { MessageModule } from 'primeng/message';
import { ProgressBarModule } from 'primeng/progressbar';
import {
  LucideAngularModule,
  Upload, CheckCircle, XCircle, AlertTriangle, FileSpreadsheet
} from 'lucide-angular';
import { ApiService } from '../../core/services/api.service';

export interface SkipDetail {
  row: number;
  reason: string;
}

export interface UploadResult {
  inserted: number;
  updated: number;
  skipped: number;
  skip_detail: SkipDetail[];
}

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    CardModule,
    TableModule,
    TagModule,
    ToastModule,
    MessageModule,
    ProgressBarModule,
    LucideAngularModule,
  ],
  providers: [MessageService],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  private api = inject(ApiService);
  private messageService = inject(MessageService);

  readonly Upload = Upload;
  readonly CheckCircle = CheckCircle;
  readonly XCircle = XCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly FileSpreadsheet = FileSpreadsheet;

  isUploading = false;
  result: UploadResult | null = null;
  errorMessage = '';

  onUpload(event: any): void {
    const file = event.files[0];
    if (!file) return;

    this.isUploading = true;
    this.result = null;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('file', file);

    this.api.postForm<any>('/upload', formData).subscribe({
      next: (res) => {
        this.isUploading = false;
        this.result = res.data;
        this.messageService.add({
          severity: 'success',
          summary: 'Upload Berhasil',
          detail: `${res.data.inserted} data baru, ${res.data.updated} diperbarui`,
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
}
