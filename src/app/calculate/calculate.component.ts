import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalculateInterestComponent } from "../calculate-interest/calculate-interest.component";

@Component({
  selector: 'app-calculate',
  imports: [CommonModule, CalculateInterestComponent],
  templateUrl: './calculate.component.html',
  styleUrl: './calculate.component.css'
})
export class CalculateComponent {
  title: string = 'Calculadora de ahorro';
}
