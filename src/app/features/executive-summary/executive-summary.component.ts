import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { LucideAngularModule, BarChart2, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardModule, LucideAngularModule],
  templateUrl: './executive-summary.component.html',
  styleUrl: './executive-summary.component.scss',
})
export class DashboardComponent {
  readonly BarChart2 = BarChart2;
  readonly AlertTriangle = AlertTriangle;
}
