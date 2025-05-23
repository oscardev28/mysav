import { ModalService } from './../services/modal.service';
import { Component, OnInit, ViewChild, HostListener, ElementRef } from '@angular/core';
import { PlanService } from '../services/plan.service';
import { CommonModule } from '@angular/common';
import { GraficoGastosComponent } from '../grafico-gastos/grafico-gastos.component';
import { GastosService } from '../services/gastos.service';
import { EstadisticasComponent } from '../estadisticas/estadisticas.component';
import { Helper } from '../services/helper.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { ModalPrimaryComponent } from '../modal-primary/modal-primary.component';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule, GraficoGastosComponent, EstadisticasComponent, ModalPrimaryComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  animations: [
    trigger('slideAnimation', [
      state('next', style({ transform: 'translateX(0)', opacity: 1 })),
      state('prev', style({ transform: 'translateX(0)', opacity: 1 })),

      transition('* => next', [
        style({ transform: 'translateX(100vw)', opacity: 0 }),  /* Cambia aquí */
        animate('0.5s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),

      transition('* => prev', [
        style({ transform: 'translateX(-100vw)', opacity: 0 }), /* Cambia aquí */
        animate('0.5s ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ])
    ])
  ]

})
export class InicioComponent implements OnInit {
  modalVisible: boolean = false;
  ingresos: number = 0;
  ahorro: number = 0;
  fijos: number = 0;
  variables: number = 0;
  plan: any;
  totalGasto: number = 0;
  view: string = 'table';
  porcentajeFijos: number = 0;
  porcentajeVariables: number = 0;
  porcentajeAhorro: number = 0;
  porcentajeTotalGasto: number = 0;
  remainingMoney: number = 0;
  currentMonth: number = new Date().getMonth(); // Inicializa con el mes actual
  currentYear: number = new Date().getFullYear(); // Inicializa con el año actual,
  title: string = '';
  animating = false;
  animationDirection: 'next' | 'prev' = 'next'; // Dirección de la animación

  constructor(private modalService: ModalService, private planService: PlanService, private gastosService: GastosService, public helper: Helper, public router: Router) {}

  async ngOnInit() {
    try {
      //this.generarDatos()
      await this.cargarPlan();
      this.getRemainingMoney();
      this.modalService.modalVisibility$.subscribe((isVisible) => {
        this.modalVisible = isVisible;
      });
      this.title = `${this.helper.getMonthName().toUpperCase()} -  ${this.helper.getYear()}`
    } catch (error) {
      console.error("Error al obtener plan:", error);
    }
  }

  stickySection: 'fijos' | 'variables' | null = null;

  @ViewChild('fijosRow') fijosRow!: ElementRef;
  @ViewChild('variablesRow') variablesRow!: ElementRef;
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.scrollContainer && this.fijosRow && this.variablesRow) {
        this.scrollContainer.nativeElement.addEventListener('scroll', () => this.onScroll());
        this.onScroll(); // inicializa estado al renderizar
      }
    }, 0);
  }

  async addGasto() {
    await this.cargarPlan();
    this.getRemainingMoney();
  }

  closeModal() {
    this.modalService.closeModal(); // Llamamos al servicio para cerrar el modal
  }

  onScroll() {
    if (!this.fijosRow?.nativeElement || !this.variablesRow?.nativeElement || !this.scrollContainer?.nativeElement) {
      return;
    }

    const fijosTop = this.fijosRow.nativeElement.getBoundingClientRect().top;
    const variablesTop = this.variablesRow.nativeElement.getBoundingClientRect().top;
    const containerTop = this.scrollContainer.nativeElement.getBoundingClientRect().top;

    if (variablesTop <= containerTop + 42) {
      this.stickySection = 'variables';
    } else if (fijosTop <= containerTop + 42) {
      this.stickySection = 'fijos';
    } else {
      this.stickySection = null;
    }

    if (!this.scrollContainer?.nativeElement) return;

    const scrollEl = this.scrollContainer.nativeElement;

    const isAtTop = scrollEl.scrollTop === 0;

    if (isAtTop) {
      this.stickySection = null;
    }
  }

  showModal() {
    this.modalService.openModal();
  }

  async changeMonth(next: boolean) {
    if (this.animating) return;
    this.animating = true;

    this.animationDirection = next ? 'next' : 'prev';

    setTimeout(async () => {
      if (next) {
        this.currentMonth++;
        if (this.currentMonth > 11) {
          this.currentMonth = 0;
          this.currentYear++;
        }
      } else {
        this.currentMonth--;
        if (this.currentMonth < 0) {
          this.currentMonth = 11;
          this.currentYear--;
        }
      }

      await this.cargarPlan();
      this.getRemainingMoney()
      this.title = `${this.helper.getMonthName(this.currentMonth).toUpperCase()} - ${this.currentYear}`;
      this.animating = false;
    }, 200);
  }

  async cargarPlan() {
    this.plan = await this.planService.cargarPlan(this.currentMonth, this.currentYear);

    console.log('Plan:', this.plan);

    if (!this.plan) {
      this.router.navigate(['/plan']);
    } else {
      this.plan.gastos = this.helper.sortDate(this.plan.gastos)
      this.plan.gastosVariables = this.helper.sortDate(this.plan.gastosVariables)
      console.log(`Plan actualizado para ${this.currentMonth + 1}/${this.currentYear}`, this.plan);
      this.getGastos()
    }
  }

  getRemainingMoney() {
    this.remainingMoney = this.ingresos - this.totalGasto - this.ahorro;
  }

  changeView(view: string) {
    this.view = view;
  }

  generarDatos() {
    this.gastosService.generarGastosAleatorios();
  }

  getGastos() {
    this.ingresos = this.plan.ingresos || 0;
    this.ahorro = this.plan.ahorro || 0;

    this.fijos = this.plan.gastos.reduce((acc: number, gasto: any) => acc + Number(gasto.value), 0);
    this.variables = this.plan.gastosVariables.reduce((acc: number, gasto: any) => acc + Number(gasto.value), 0);
    this.totalGasto = this.fijos + this.variables;
    this.porcentajeTotalGasto = (this.totalGasto / this.ingresos) * 100;


    console.log('Ingresos:', this.ingresos, 'Ahorro:', this.ahorro, 'Fijos:', this.fijos, 'Variables:', this.variables);

    if (this.ingresos > 0) {
      this.porcentajeFijos = (this.fijos / this.ingresos) * 100;
      this.porcentajeVariables = (this.variables / this.ingresos) * 100;
      this.porcentajeAhorro = (this.ahorro / this.ingresos) * 100;
    }
  }
}
