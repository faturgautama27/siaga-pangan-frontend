import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ApexAxisChartSeries, ApexChart, ApexXAxis, ApexYAxis,
  ApexTooltip, ApexDataLabels, ApexPlotOptions, ApexGrid,
  ApexNoData, ApexLegend
} from 'ng-apexcharts';

export interface BarChartSeries {
  name: string;
  data: number[];
}

@Component({
  selector: 'app-apex-bar-chart',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './apex-bar-chart.component.html',
  styleUrl: './apex-bar-chart.component.scss',
})
export class ApexBarChartComponent implements OnChanges {
  @Input() series: BarChartSeries[] = [];
  @Input() categories: string[] = [];
  @Input() height = 400;
  @Input() title = '';
  @Input() yAxisLabel = 'Harga (Rp)';
  @Input() horizontal = false;

  chartSeries: ApexAxisChartSeries = [];
  chartOptions: ApexChart = {
    type: 'bar',
    height: this.height,
    toolbar: { show: true },
    animations: { enabled: false },
    fontFamily: 'inherit',
  };
  plotOptions: ApexPlotOptions = {
    bar: {
      horizontal: this.horizontal,
      columnWidth: '60%',
      borderRadius: 4,
    },
  };
  xaxis: ApexXAxis = {
    categories: [],
    labels: { rotate: -45, style: { fontSize: '11px' } },
  };
  yaxis: ApexYAxis = {
    title: { text: this.yAxisLabel },
    labels: {
      formatter: (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
      }).format(val),
    },
  };
  dataLabels: ApexDataLabels = { enabled: false };
  tooltip: ApexTooltip = {
    y: {
      formatter: (val) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
      }).format(val),
    },
  };
  grid: ApexGrid = { borderColor: '#f1f5f9', strokeDashArray: 4 };
  legend: ApexLegend = { position: 'top' };
  noData: ApexNoData = {
    text: 'Tidak ada data untuk ditampilkan',
    style: { color: '#9ca3af', fontSize: '14px' }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] || changes['categories'] || changes['height'] || changes['horizontal']) {
      this.chartSeries = [...this.series];
      this.chartOptions = { ...this.chartOptions, height: this.height };
      this.xaxis = { ...this.xaxis, categories: [...this.categories] };
      this.plotOptions = {
        bar: { ...this.plotOptions.bar, horizontal: this.horizontal }
      };
      this.yaxis = { ...this.yaxis, title: { text: this.yAxisLabel } };
    }
  }
}
