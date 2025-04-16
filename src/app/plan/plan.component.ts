import { Helper } from './../services/helper.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlanService } from '../services/plan.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackBtnComponent } from '../buttons/back-btn/back-btn.component';
import { NextBtnComponent } from '../buttons/next-btn/next-btn.component';
import { GastoModel } from '../models/expense.model';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '../modal/modal.component';
import { firstValueFrom } from 'rxjs';
import { LoaderService } from '../services/loader.service';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackBtnComponent, NextBtnComponent]
})

export class PlanComponent implements OnInit {
  existingPlan: boolean = false;
  planForm: FormGroup;
  step: number = 1;
  title: string = 'Mi plan de gasto mensual';
  ingresos: number = 0;
  ahorro: number = 0;
  gastos: GastoModel[] = [];
  gastosVariables: GastoModel[] = [];
  newGastos: GastoModel[] = [];
  newGastosVariables: GastoModel[] = [];

  // Categorías de gastos fijos
  tiposDeGasto: string[] = [
    "Agua",
    "Alquiler/Hipoteca",
    "Colegiaturas",
    "Condominio",
    "Electricidad",
    "Gas",
    "Gasolina",
    "Impuestos (IBI)",
    "Internet",
    "Mantenimiento del hogar",
    "Pagos de coche",
    "Préstamos y deudas",
    "Seguros (auto, hogar, salud, vida)",
    "Teléfono fijo",
    "Transporte público",
    "Gimnasio",
    "Streaming y suscripciones",
    "Otros"
  ];

  // Categorías de gastos variables
  tiposDeGastoVariable: string[] = [
    "Consultas médicas",
    "Delivery y comida rápida",
    "Estética y peluquería",
    "Gimnasio",
    "Medicinas y farmacia",
    "Ocio y entretenimiento",
    "Productos de higiene",
    "Ropa y calzado",
    "Averías y reparaciones",
    "Viajes y escapadas",
    "Supermercado",
    "Imprevistos",
    "Otros"
  ];

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private router: Router,
    public helper: Helper,
    private dialog: MatDialog,
    private loader: LoaderService
  ) {
    this.planForm = this.fb.group({
      ingresos: ['', [Validators.required, Validators.min(1)]],
      ahorro: ['', [Validators.required, Validators.min(0)]],
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      valor: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.obtenerPlan();
  }

  openModal(title: string, message: string, showActions: boolean = false) {
    const dialogRef = this.dialog.open(ModalDialogComponent, {
      data: {
        title: title,
        message: message,
        showActions: showActions
      }
    });
  }

  async obtenerPlan() {
    try {
      this.loader.show();
      const plan = await this.planService.obtenerPlanActual();
      if (plan) {
        this.existingPlan = true;
        this.ingresos = plan.ingresos;
        this.ahorro = plan.ahorro;
        this.planForm.controls['ingresos'].setValue(this.ingresos);
        this.planForm.controls['ahorro'].setValue(this.ahorro);
        this.gastos = plan.gastos;
        this.gastosVariables = plan.gastosVariables;
        this.step = 3;
        this.title = 'Añade tus gastos adicionales';
      }
    } catch (error) {
      console.error("Error al obtener plan:", error);
    }
    this.loader.hide();
  }

  changeStep(step: number) {
    this.step = step;
    switch (step) {
      case 1:
        this.title = 'Mi plan de gasto mensual';
        break;
      case 2:
        this.title = 'Añade tus gastos fijos mensuales';
        break;
      case 3:
        this.title = 'Añade tus gastos adicionales';
        break;
    }
  }

  continuar() {
    if (this.planForm.controls['ingresos'].valid && this.planForm.controls['ahorro'].valid) {
      this.ingresos = this.planForm.value.ingresos;
      this.ahorro = this.planForm.value.ahorro;
      this.step = 2;
      this.title = 'Añade tus gastos fijos mensuales';
    }
  }

  agregarGasto() {
    const nuevoGasto = new GastoModel(
      crypto.randomUUID(),
      this.planForm.value.nombre,
      this.planForm.value.tipo,
      'fijo',
      this.planForm.value.valor,
      this.helper.getDate()
    );
    this.gastos.push(nuevoGasto);
    this.newGastos.push(nuevoGasto);
    this.planForm.reset();
  }

  agregarGastoVariable() {
    const nuevoGasto = new GastoModel(
      crypto.randomUUID(),
      this.planForm.value.nombre,
      this.planForm.value.tipo,
      'variable',
      this.planForm.value.valor,
      this.helper.getDate()
    );
    this.gastosVariables.push(nuevoGasto);
    this.newGastosVariables.push(nuevoGasto);
    this.planForm.reset();
  }

  async deleteGasto(gasto: GastoModel, tipo: 'fijo' | 'variable') {
    // Si el gasto está en los arrays temporales (sin guardar aún)
    if (tipo === 'fijo' && this.newGastos.some(g => g.id === gasto.id)) {
      this.newGastos = this.newGastos.filter(g => g.id !== gasto.id);
      this.gastos = this.gastos.filter(g => g.id !== gasto.id);
      return;
    }

    if (tipo === 'variable' && this.newGastosVariables.some(g => g.id === gasto.id)) {
      this.newGastosVariables = this.newGastosVariables.filter(g => g.id !== gasto.id);
      this.gastosVariables = this.gastosVariables.filter(g => g.id !== gasto.id);
      return;
    }

    // Si ya está guardado en Firebase, mostrar confirmación y eliminar
    const dialogRef = this.dialog.open(ModalDialogComponent, {
      data: {
        title: '¿Eliminar gasto?',
        message: '¿Seguro que quieres eliminar este gasto?',
        showActions: true
      }
    });

    const result = await firstValueFrom(dialogRef.afterClosed());

    if (result) {
      try {
        this.loader.show();
        await this.planService.eliminarGasto(gasto, tipo);
        await this.obtenerPlan();
      } catch (error) {
        console.error('Error al eliminar el gasto:', error);
      }
      this.loader.hide();
    }
  }

  async guardarPlan(btn: HTMLButtonElement) {
    if(this.newGastos.length === 0) {
      this.openModal('No hay gastos', 'No has añadido ningún gasto fijo.');
      return;
    }
    btn.disabled = true;
    try {
      this.loader.show();
      await this.planService.guardarPlan(this.ingresos, this.ahorro, this.newGastos, this.newGastosVariables);
      this.newGastos = [];
      this.newGastosVariables = [];
      this.openModal('Plan guardado', 'Tu plan ha sido guardado correctamente.');
      this.step = 3;
      this.title = 'Añade tus gastos adicionales';
    } catch (error) {
      console.error("Error al guardar el plan:", error);
    }
    this.loader.hide();
    btn.disabled = false;
  }

  async guardarGastos(btn: HTMLButtonElement) {
    if(this.newGastosVariables.length === 0) {
      this.openModal('No hay gastos', 'No has añadido ningún gasto adicional.');
      return;
    }
    btn.disabled = true;
    try {
      this.loader.show();
      await this.planService.añadirGasto(this.newGastosVariables);
      this.newGastosVariables = [];
      this.openModal('Gastos guardados', 'Tus gastos adicionales han sido guardados correctamente.');
      this.router.navigate(['/inicio']);
    } catch (error) {
      console.error("Error al guardar los gastos adicionales:", error);
    }
    this.loader.hide();
    btn.disabled = false;
  }
}
