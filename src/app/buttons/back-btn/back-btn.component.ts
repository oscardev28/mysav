import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'BackBtn',
  imports: [CommonModule],
  templateUrl: './back-btn.component.html',
  styleUrl: './back-btn.component.css'
})
export class BackBtnComponent {
  @Input() texto: string = ''; // Propiedad recibida del padre con un valor por defecto
  @Input() href: string = ''; // Propiedad recibida del padre con un valor por defecto
}
