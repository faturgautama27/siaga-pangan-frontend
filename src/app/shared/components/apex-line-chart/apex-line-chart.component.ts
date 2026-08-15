import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis,
  ApexTooltip, ApexStroke, ApexLegend, ApexDataLabels,
  ApexGrid, ApexNoData
} from 'ng-apexcharts';

export interface LineChartSeries {
  name: string;
  data: { x: string; y: number | null }[];
}

@Component({
  selector: 'app-apex-line-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './apex-line-chart.component.html',
  styleUrl: './apex-line-chart.component.scss',
})
export class ApexLineChartComponent implements OnChanges {
  @Input() series: LineChartSeries[] = [];
  @Input() height = 350;
  @Input() yAxisLabel = 'Harga (Rp)';
  @Input() title = '';

  chartSeries: ApexAxisChartSeries = [];
  chartOptions: ApexChart = {
    type: 'line',
    height: this.height,
    zoom: { enabled: true },
    toolbar: { show: true, tools: { download: true, zoom: true, reset: true } },
    animations: { enabled: false },
    fontFamily: 'inherit',
  };
  xaxis: ApexXAxis = { type: 'category', labels: { rotate: -45, style: { fontSize: '11px' } } };
  yaxis: ApexYAxis = {
    title: { text: this.yAxisLabel },
    labels: {
      formatter: (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val),
    },
  };
  stroke: ApexStroke = { curve: 'smooth', width: 2 };
  legend: ApexLegend = { position: 'top', horizontalAlign: 'left' };
  dataLabels: ApexDataLabels = { enabled: false };
  tooltip: ApexTooltip = {
    y: {
      formatter: (val) => val != null
        ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
        : 'Tidak ada data',
    },
  };
  grid: ApexGrid = { borderColor: '#f1f5f9', strokeDashArray: 4 };
  noData: ApexNoData = { text: 'Tidak ada data untuk ditampilkan', style: { color: '#9ca3af', fontSize: '14px' } };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] || changes['height']) {
      this.chartSeries = this.series.map((s) => ({
        name: s.name,
        data: s.data.map((d) => ({ x: d.x, y: d.y })),
      }));
      this.chartOptions = { ...this.chartOptions, height: this.height };
      this.yaxis = { ...this.yaxis, title: { text: this.yAxisLabel } };
    }
  }
}
