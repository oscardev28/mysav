import { CommonModule } from '@angular/common';
import { Component, AfterViewInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Helper } from '../services/helper.service';
import { Chart } from 'chart.js'; // Importar Chart.js
import chartjsPluginDatalabels from 'chartjs-plugin-datalabels'; // Importar el plugin para mostrar las etiquetas (porcentajes)

@Component({
  selector: 'app-calculate-interest',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './calculate-interest.component.html',
  styleUrl: './calculate-interest.component.css'
})
export class CalculateInterestComponent {
  period: Array<string> = ['Mensual', 'Bimestral', 'Trimestral', 'Semestral', 'Anual'];
  interestForm: FormGroup;
  result: any;

  constructor(
    private fb: FormBuilder,
    public helper: Helper
  ) {
    this.interestForm = this.fb.group({
      capital: ['', [Validators.required, Validators.min(0)]],
      period: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(1)]],
      interest: ['', [Validators.required, Validators.min(0)]],
      duration: ['', [Validators.required, Validators.min(1)]],
    });
  }

  ngAfterViewInit() {
    // Este método se usa para asegurarse de que el gráfico se renderiza después de que el componente haya sido inicializado
  }

  calculate() {
    // Obtener los valores del formulario
    const capital = this.interestForm.get('capital')?.value;
    const period = this.interestForm.get('period')?.value;
    const amount = this.interestForm.get('amount')?.value;
    const interest = this.interestForm.get('interest')?.value;
    const duration = this.interestForm.get('duration')?.value;

    // Convertir el interés a un formato decimal
    const annualInterestRate = interest / 100;

    // Determinar el número de períodos por año según el tipo de periodo
    let periodsPerYear;
    switch (period) {
      case 'monthly':
        periodsPerYear = 12;
        break;
      case 'bimonthly':
        periodsPerYear = 6;
        break;
      case 'quarterly':
        periodsPerYear = 4;
        break;
      case 'semiannual':
        periodsPerYear = 2;
        break;
      case 'annual':
        periodsPerYear = 1;
        break;
      default:
        periodsPerYear = 12; // Suponemos mensual por defecto
    }

    // Calcular el número total de períodos
    const totalPeriods = periodsPerYear * duration;

    // Calcular el interés compuesto con depósitos periódicos
    const finalAmount = capital * Math.pow(1 + annualInterestRate / periodsPerYear, totalPeriods) +
                        amount * ((Math.pow(1 + annualInterestRate / periodsPerYear, totalPeriods) - 1) / (annualInterestRate / periodsPerYear));

    // Calcular cuánto metiste tú (capital inicial + todos los depósitos periódicos)
    const totalDeposited = capital + amount * totalPeriods;

    // Calcular las ganancias por intereses
    const interestEarned = finalAmount - totalDeposited;

    // Mostrar los resultados
    console.log(`Total Ahorrado: ${finalAmount.toFixed(2)}`);
    console.log(`De eso, tu aportación fue: ${totalDeposited.toFixed(2)}`);
    console.log(`Ganancia por intereses: ${interestEarned.toFixed(2)}`);

    // Puedes mostrar estos valores en tu interfaz de usuario si lo deseas:
    this.result = {
      totalSaved: finalAmount.toFixed(2),
      totalDeposited: totalDeposited.toFixed(2),
      interestEarned: interestEarned.toFixed(2)
    };

    let porcentajeInvertido = (100 * totalDeposited) / finalAmount;
    let porcentajeGanado = 100 - porcentajeInvertido;

    setTimeout(() => {
      this.drawDonutChart(totalDeposited, interestEarned, porcentajeGanado, porcentajeInvertido);
    }, 500);
  }

  drawDonutChart(totalDeposited: number, interestEarned: number, porcentajeGanado: number, porcentajeInvertido: number) {
    const ctx = document.getElementById('donutChart') as HTMLCanvasElement;
    const context = ctx?.getContext('2d');    const totalAmount = totalDeposited + interestEarned;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Lo invertido '+ porcentajeInvertido.toFixed(2)+'%', 'Lo ganado (Intereses) '+porcentajeGanado.toFixed(2)+'%'],
        datasets: [{
          data: [totalDeposited, interestEarned],
          backgroundColor: ['#36A2EB', '#FF6384'], // Colores para invertido y ganado
          hoverBackgroundColor: ['#63A2FF', '#FF8D99']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 16, // Tamaño de fuente para los labels de la leyenda
                weight: 'bold'
              },
              color: 'white' // Color blanco para los labels de la leyenda
            }
          },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => {
                // Asegurarnos de que 'value' es tratado como un número
                let value = tooltipItem.raw as number;  // Aserción de tipo a 'number'
                let percentage = ((value / totalAmount) * 100).toFixed(2);
                return `${tooltipItem.label}: ${value.toFixed(2)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
}


