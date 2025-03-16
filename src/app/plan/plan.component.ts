import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PlanService } from '../services/plan.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BackBtnComponent } from '../buttons/back-btn/back-btn.component';
import { NextBtnComponent } from '../buttons/next-btn/next-btn.component';

interface Gasto {
  id?: string;
  nombre: string;
  tipo: string;
  valor: number;
  fecha: string;
}

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
  gastos: Gasto[] = [];
  gastosVariables: Gasto[] = [];
  newGastos: Gasto[] = [];
  newGastosVariables: Gasto[] = [];

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
    private router: Router
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
        this.step = 3; // Ir directo a edición si ya existe un plan
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
    if (this.planForm.controls['nombre'].valid && this.planForm.controls['tipo'].valid) {
      this.gastos.push({
        nombre: this.planForm.value.nombre,
        tipo: this.planForm.value.tipo,
        valor: this.planForm.value.valor,
        fecha: ''
      });
      this.newGastos.push({
        nombre: this.planForm.value.nombre,
        tipo: this.planForm.value.tipo,
        valor: this.planForm.value.valor,
        fecha: ''
      });
      this.planForm.reset();
    }
  }

  agregarGastoVariable() {
    if (this.planForm.controls['nombre'].valid && this.planForm.controls['tipo'].valid) {
      this.gastosVariables.push({
        nombre: this.planForm.value.nombre,
        tipo: this.planForm.value.tipo,
        valor: this.planForm.value.valor,
        fecha: ''
      });
      this.newGastosVariables.push({
        nombre: this.planForm.value.nombre,
        tipo: this.planForm.value.tipo,
        valor: this.planForm.value.valor,
        fecha: ''
      });
      this.planForm.reset();
    }
  }

  deleteGasto(gasto: Gasto, tipo: 'fijo' | 'variable') {
    if (confirm('¿Seguro que quieres eliminar este gasto?')) {
      if(tipo === 'fijo' && this.newGastos.includes(gasto)) {
        this.gastos = this.newGastos.filter(g => g !== gasto);
      } else if(tipo === 'variable' && this.newGastosVariables.includes(gasto)) {
        this.gastosVariables = this.newGastosVariables.filter(g => g !== gasto);
      }else {
        this.planService.eliminarGasto(gasto, tipo)
          .then(() => {
            console.log('Gasto eliminado en la UI');
            this.obtenerPlan();
            // 🔹 Aquí puedes actualizar la lista de gastos en la UI si es necesario
          })
          .catch(error => console.error('Error al eliminar el gasto:', error));
      }
    }
  }

  async guardarPlan(btn: HTMLButtonElement) {
    btn.disabled = true;
    try {
      const planId = await this.planService.guardarPlan(this.ingresos, this.ahorro, this.newGastos, this.newGastosVariables);
      this.newGastos = [];
      this.newGastosVariables = [];
      alert('Plan de gastos guardado con éxito');
      this.step = 3;
      this.title = 'Añade tus gastos adicionales';
      btn.disabled = false;
    } catch (error) {
      btn.disabled = false;
      console.error("Error al guardar el plan:", error);
    }
  }

  async guardarGastos(btn: HTMLButtonElement) {
    btn.disabled = true;
    try {
      const planId = await this.planService.añadirGastos(this.newGastosVariables);
      this.newGastosVariables = [];
      alert('Guardado correctamente');
      btn.disabled = false;
    } catch (error) {
      btn.disabled = false;
      console.error("Error al guardar el plan:", error);
    }
  }
}
