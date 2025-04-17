import { Component, Input, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-grafico-gastos',
  templateUrl: './grafico-gastos.component.html',
  styleUrls: ['./grafico-gastos.component.css']
})
export class GraficoGastosComponent implements OnInit {
  @Input() plan: any; // Recibe el plan con gastos
  chart: any;

  ngOnInit() {
    this.generarGrafica();
  }

  generarGrafica() {
    if (!this.plan?.gastos) return;

    // Agrupar gastos por día
    const gastosPorDia: { [key: string]: number } = {};

    const gastos = this.plan.gastos.concat(this.plan.gastosVariables);

    console.log('GASTOS', gastos)

    gastos.forEach((gasto: any) => {
      const fecha = new Date(gasto.date).getDate(); // Obtener día del mes
      gastosPorDia[fecha] = gasto.value;
    });

    // Crear etiquetas y valores para la gráfica
    const etiquetas = Object.keys(gastosPorDia).map(d => `Día ${d}`);
    const valores = Object.values(gastosPorDia);

    console.log(valores, gastosPorDia)

    // Crear gráfico
    this.chart = new Chart('gastosChart', {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [
          {
            label: 'Gasto por Día',
            data: valores,
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.4,
            pointRadius: 4,
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true }
        },
        animation: {
          duration: 1000, // Duración de la animación en milisegundos
          easing: 'easeInOutQuad' // Tipo de animación (puedes elegir entre varios, como 'linear', 'easeOutBounce', etc.)
        }
      }
    });
  }
}
