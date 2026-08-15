import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LucideAngularModule, Search, X } from 'lucide-angular';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePickerModule,
    SelectModule,
    MultiSelectModule,
    ButtonModule,
    SelectButtonModule,
    LucideAngularModule,
  ],
  templateUrl: './filter-bar.component.html',
  styleUrl: './filter-bar.component.scss',
})
export class FilterBarComponent {
  @Input() form!: FormGroup;
  @Input() wilayahOptions: { label: string; value: number }[] = [];
  @Input() komoditiOptions: { label: string; value: number }[] = [];
  @Input() showWilayah = true;
  @Input() showKomoditi = true;
  @Input() showDateRange = true;
  @Input() showMode = false;
  @Input() modeOptions: { label: string; value: string }[] = [];
  @Input() isLoading = false;

  @Output() filter = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  readonly Search = Search;
  readonly X = X;

  onFilter(): void {
    this.filter.emit();
  }

  onReset(): void {
    this.reset.emit();
  }
}
