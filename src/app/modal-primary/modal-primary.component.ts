import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AddGastoComponent } from '../forms/add-gasto/add-gasto.component';

@Component({
  imports: [CommonModule, AddGastoComponent],
  selector: 'app-modal-primary',
  templateUrl: './modal-primary.component.html',
  styleUrls: ['./modal-primary.component.css']
})
export class ModalPrimaryComponent {
  // EventEmitter para cerrar el modal desde el componente padre
  @Output() closeModal = new EventEmitter<void>();
  @Output() gastoAñadido = new EventEmitter<void>();

  isVisible: boolean = false;

  // Método para abrir el modal
  open() {
    this.isVisible = true;
  }

  handleGasto() {
    this.gastoAñadido.emit(); // 🔁 Vuelve a emitir al componente padre
    this.close(); // También cerramos el modal
  }

  // Método para cerrar el modal
  close() {
    this.isVisible = false;
    this.closeModal.emit(); // Emitimos el evento para que el componente padre pueda manejar el cierre
  }
}
