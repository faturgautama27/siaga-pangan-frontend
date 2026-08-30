import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { LucideAngularModule, History, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-angular';
import { ApiService } from '../../../core/services/api.service';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { formatDateToYYYYMMDD } from '../../../shared/utils/date-utils';

export interface UploadLog {
  id: string;
  nama_file: string;
  uploaded_by: string;
  uploaded_at: string;
  jumlah_insert: number;
  jumlah_update: number;
  jumlah_skip: number;
  detail_skip: string | null;
}

@Component({
  selector: 'app-riwayat-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    TableModule,
    TagModule,
    DatePickerModule,
    ButtonModule,
    TooltipModule,
    LucideAngularModule,
    PageHeaderComponent,
  ],
  templateUrl: './riwayat-upload.component.html',
  styleUrl: './riwayat-upload.component.scss',
})
export class RiwayatUploadComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  readonly History = History;
  readonly CheckCircle = CheckCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly RefreshCw = RefreshCw;

  logs: UploadLog[] = [];
  isLoading = false;
  totalRecords = 0;
  currentPage = 1;
  pageSize = 20;

  filterForm = this.fb.group({
    dateRange: [null as Date[] | null],
  });

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(page = 1): void {
    this.isLoading = true;
    this.currentPage = page;

    const params: Record<string, any> = {
      page: page,
      limit: this.pageSize,
    };

    const dateRange = this.filterForm.value.dateRange as Date[] | null;
    if (dateRange?.[0]) {
      params['start'] = this.formatDate(dateRange[0]);
    }
    if (dateRange?.[1]) {
      params['end'] = this.formatDate(dateRange[1]);
    }

    this.api.get<any>('/upload-log', params).subscribe({
      next: (res) => {
        this.logs = res.data ?? [];
        this.totalRecords = res.meta?.total ?? 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onPageChange(event: any): void {
    this.loadLogs(Math.floor(event.first / event.rows) + 1);
  }

  onFilter(): void {
    this.loadLogs(1);
  }

  onReset(): void {
    this.filterForm.reset();
    this.loadLogs(1);
  }

  getSkipDetail(log: UploadLog): any[] {
    if (!log.detail_skip) return [];
    try {
      return JSON.parse(log.detail_skip);
    } catch {
      return [];
    }
  }

  private formatDate(date: Date): string {
    return formatDateToYYYYMMDD(date);
  }
}
