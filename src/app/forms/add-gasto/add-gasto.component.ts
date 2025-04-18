import { GastoModel } from './../../models/expense.model';
import { PlanService } from './../../services/plan.service';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Helper } from '../../services/helper.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalDialogComponent } from '../../modal/modal.component';
import { firstValueFrom } from 'rxjs';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-add-gasto',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-gasto.component.html',
  styleUrl: './add-gasto.component.css'
})
export class AddGastoComponent {
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
    "Inversión",
    "Otros"
  ];

  // Categorías de gastos variables
  tiposDeGastoVariable: string[] = [
    "Consultas médicas",
    "Delivery y comida rápida",
    "Inversión",
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

  categories: string[] = [];
  addGastoForm: FormGroup;

  constructor(
    private planService: PlanService,
    private fb: FormBuilder,
    private router: Router,
    public helper: Helper,
    private dialog: MatDialog,
    private loader: LoaderService,
  ) {
    this.addGastoForm = this.fb.group({
      category: [{ value: '', disabled: this.categories.length === 0 }, [Validators.required]],
      nombre: ['', Validators.required],
      tipo: ['', Validators.required],
      valor: ['', Validators.required]
    });
  }

  selectType() {
    if(this.addGastoForm.value.tipo == 'fijo') {
      this.categories = this.tiposDeGasto;
    }else if(this.addGastoForm.value.tipo == 'variable') {
      this.categories = this.tiposDeGastoVariable;
    }else {
      this.categories = [];
    }

    if (this.categories.length === 0) {
      this.addGastoForm.get('category')?.disable();
    } else {
      this.addGastoForm.get('category')?.enable();
    }
  }

  openModal(title: string, message: string = '', showActions: boolean = false) {
    const dialogRef = this.dialog.open(ModalDialogComponent, {
      data: {
        title: title,
        message: message,
        showActions: showActions
      }
    });
  }

  async addGasto(btn: HTMLButtonElement) {
    if (this.addGastoForm.valid) {
      const gasto = new GastoModel(
        crypto.randomUUID(),
        this.addGastoForm.value.nombre,
        this.addGastoForm.value.category,
        this.addGastoForm.value.tipo,
        this.addGastoForm.value.valor,
        this.helper.getDate()
      );
      this.addGastoForm.reset();

      btn.disabled = true;
      try {
        this.loader.show();
        await this.planService.addSingleGasto(gasto);
        this.openModal('Gasto añadido');
        this.router.navigate(['/inicio']);
      } catch (error) {
        this.openModal('Error al guardar, intentalo de nuevo más tarde');
        console.error("Error al guardar los gastos adicionales:", error);
      }
      this.loader.hide();
      btn.disabled = false;
      // Aquí puedes hacer lo que necesites con el gasto, como enviarlo a un servicio o guardarlo en una base de datos
      console.log('Gasto agregado:', gasto);
    } else {
      this.openModal('Tienes que agregar un gasto');
    }
  }
}
