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

  tiposDeGasto: string[] = [
    "Alquiler/Hipoteca", "Supermercado", "Internet", "Teléfono", "Gasolina", "Coche", "Suscripciones", "Seguro", "Luz", "Agua", "Gimnasio",
    "Transporte público", "Vacaciones"
  ];

  tiposDeGastoVariable: string[] = [
    "Comer fuera", "Compras", "Ocio", "Salud", "Transporte", "Tecnología", "Viajes"
  ];

  constructor(
    private fb: FormBuilder,
    private planService: PlanService,
    private router: Router,
    public helper: Helper
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

  async obtenerPlan() {
    try {
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
    if (confirm('¿Seguro que quieres eliminar este gasto?')) {
      try {
        await this.planService.eliminarGasto(gasto!, tipo);
        this.obtenerPlan();
      } catch (error) {
        console.error('Error al eliminar el gasto:', error);
      }
    }
  }

  async guardarPlan(btn: HTMLButtonElement) {
    btn.disabled = true;
    try {
      await this.planService.guardarPlan(this.ingresos, this.ahorro, this.newGastos, this.newGastosVariables);
      this.newGastos = [];
      this.newGastosVariables = [];
      alert('Plan de gastos guardado con éxito');
      this.step = 3;
      this.title = 'Añade tus gastos adicionales';
    } catch (error) {
      console.error("Error al guardar el plan:", error);
    }
    btn.disabled = false;
  }

  async guardarGastos(btn: HTMLButtonElement) {
    btn.disabled = true;
    try {
      await this.planService.añadirGasto(this.newGastosVariables);
      this.newGastosVariables = [];
      alert('Guardado correctamente');
    } catch (error) {
      console.error("Error al guardar los gastos adicionales:", error);
    }
    btn.disabled = false;
  }
}
