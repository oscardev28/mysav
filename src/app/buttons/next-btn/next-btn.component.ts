import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'NextBtn',
  imports: [CommonModule],
  templateUrl: './next-btn.component.html',
  styleUrl: './next-btn.component.css'
})
export class NextBtnComponent {
  @Input() texto: string = ''; // Propiedad recibida del padre con un valor por defecto
  @Input() href: string = ''; // Propiedad recibida del padre con un valor por defecto
}

