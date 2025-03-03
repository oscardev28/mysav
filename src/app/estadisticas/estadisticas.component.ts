import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js/auto';


interface Gasto {
  nombre: string;
  tipo: string;
  valor: number;
  fecha: string; // Se guarda como "YYYY-MM-DD"
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  template: `
    <div class="w-full">
      <canvas #chartCanvas></canvas>
    </div>
  `,
  styles: [
    `
      div {
        max-width: 600px;
        margin: auto;
      }
    `
  ]
})

export class EstadisticasComponent implements AfterViewInit, OnChanges {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() plan: any;
  gastos: Gasto[] = [];
  max: any = 0;

  private chart!: Chart;

  ngOnInit() {
    console.log('PLAN', this.plan);
    this.gastos = this.plan.gastos.concat(this.plan.gastosVariables);
  }

  ngAfterViewInit() {
    this.generarGrafico();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['gastos'] && this.chart) {
      this.chart.destroy();
      this.generarGrafico();
    }
  }
  private generarGrafico() {
    if (!this.chartCanvas) return;

    const { labels, data } = this.agruparGastosPorCategoria();
    const stepSize = this.max / 10; // Tamaño de los saltos para que haya 10 divisiones

    console.log('aa', stepSize)

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Gasto por Categoría',
            data: data,
            backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'],
            borderColor: '#000',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: this.max, // Se coloca aquí en lugar de dentro de ticks
            ticks: {
              stepSize: stepSize, // Ajusta la distancia entre indicadores
              maxTicksLimit: 10,  // Fuerza 10 indicadores en el eje Y
            }
          }
        }
      }
    });
  }

  private agruparGastosPorCategoria() {
    const totales: { [key: string]: number } = {};

    this.gastos.forEach((gasto: any) => {
      if (!totales[gasto.tipo]) {
        totales[gasto.tipo] = 0;
      }
      totales[gasto.tipo] += Number(gasto.valor);
    });

    this.max = Object.values(totales).reduce((max, n) => (n > max ? n : max), 0);
    console.log('GASTOS', this.max, totales);

    return {
      labels: Object.keys(totales),
      data: Object.values(totales)
    };
  }
}
