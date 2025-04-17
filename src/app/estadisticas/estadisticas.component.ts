import { Component, ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js/auto';

interface Gasto {
  category: string;  // Usamos 'category' para la categoría
  date: string;
  id: string;
  name: string;
  type: string;
  value: number; // Este es el valor del gasto
}

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  template: `
    <div class="chart-container" style="overflow-x: auto;">
      <canvas #chartCanvas height="400"></canvas>  <!-- Ajustamos la altura a 400px -->
    </div>
  `,
  styles: [
    `
      .chart-container {
        max-width: 800px; /* Ajustamos el ancho del gráfico */
        margin: auto;
        overflow-x: auto;  /* Permitir desplazamiento horizontal */
      }
    `
  ]
})

export class EstadisticasComponent implements AfterViewInit, OnChanges {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;
  @Input() plan: any;
  gastos: Gasto[] = [];
  max: number = 0;

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

    // Generar colores dinámicamente basados en el número de categorías
    const backgroundColors = this.generarColores(labels.length);

    this.chart = new Chart(this.chartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Gasto por Categoría',
            data: data,
            backgroundColor: backgroundColors,
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
            // Configuración para el eje Y
            min: 0, // Esto asegura que el eje Y comience desde 0
            max: this.max, // Ajustamos el máximo
            ticks: {
              stepSize: stepSize, // Ajusta la distancia entre indicadores
              maxTicksLimit: 10,  // Limitar la cantidad de indicadores en el eje Y
              autoSkip: false,    // Asegura que las etiquetas no se omitan
            },
            title: {
              display: true,
              text: 'Categorías', // Título del eje Y
              font: {
                size: 14
              }
            }
          },
          x: {
            // Configuración para el eje X
            min: 0, // Esto asegura que el eje X comience desde 0
            ticks: {
              stepSize: 50, // Ajustar los pasos para los valores del eje X
            }
          }
        }
      }
    });
  }

  private agruparGastosPorCategoria() {
    const totales: { [key: string]: number } = {};

    this.gastos.forEach((gasto: Gasto) => {
      // Agrupamos por 'category'
      const categoria = gasto.category;

      if (!totales[categoria]) {
        totales[categoria] = 0;
      }
      totales[categoria] += Number(gasto.value); // Sumar el valor del gasto
    });

    this.max = Math.max(...Object.values(totales));  // Encontrar el valor máximo para ajustar el eje X
    console.log('GASTOS', this.max, totales);

    return {
      labels: Object.keys(totales),  // Etiquetas de las categorías
      data: Object.values(totales)   // Valores agregados para cada categoría
    };
  }

  private generarColores(cantidad: number) {
    // Generar una lista de colores para las categorías
    const colores = [];
    const baseColores = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff5733', '#c70039', '#900c3f', '#581845', '#1c1c1c'];

    for (let i = 0; i < cantidad; i++) {
      colores.push(baseColores[i % baseColores.length]); // Reutilizamos colores si es necesario
    }

    return colores;
  }
}
