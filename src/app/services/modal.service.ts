import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  // Estado del modal: true significa que está visible, false que está oculto
  private modalVisibility = new BehaviorSubject<boolean>(false);

  // Observable que los componentes pueden suscribirse para saber el estado del modal
  modalVisibility$ = this.modalVisibility.asObservable();

  constructor() {}

  // Método para abrir el modal
  openModal() {
    this.modalVisibility.next(true);
  }

  // Método para cerrar el modal
  closeModal() {
    this.modalVisibility.next(false);
  }
}
