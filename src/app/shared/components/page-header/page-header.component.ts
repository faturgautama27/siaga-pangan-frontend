import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { LucideAngularModule, FileDown } from 'lucide-angular';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonModule, LucideAngularModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() showExport = false;
  @Input() exportLabel = 'Cetak PDF';
  @Input() isExporting = false;

  @Output() export = new EventEmitter<void>();

  readonly FileDown = FileDown;

  onExport(): void {
    this.export.emit();
  }
}
