import { ModalService } from './services/modal.service';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { LoaderComponent } from './loader/loader.component';
import { ModalPrimaryComponent } from './modal-primary/modal-primary.component';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, LoaderComponent, CommonModule, ModalPrimaryComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  title = 'mysav';
  modalVisible: boolean = false;

  constructor(private modalService: ModalService) {}

  ngOnInit() {
    // Nos suscribimos al observable del servicio para saber cuando abrir o cerrar el modal
    this.modalService.modalVisibility$.subscribe((isVisible) => {
      this.modalVisible = isVisible;
    });
  }

  closeModal() {
    this.modalService.closeModal(); // Llamamos al servicio para cerrar el modal
  }
}
