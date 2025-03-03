import { Component, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import Typed from 'typed.js';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('typedText', { static: false }) typedText!: ElementRef;

  ngAfterViewInit() {
    if (this.typedText) {
      new Typed(this.typedText.nativeElement, {
        strings: [
          "Toma el control de tus finanzas 💰",
          "Registra tus gastos fácilmente",
          "Establece límites y ahorra más",
          "Haz que cada euro cuente! 💡"
        ],
        typeSpeed: 50,
        backSpeed: 25,
        loop: true,
        cursorChar: "👾",
        onBegin: () => {
          this.typedText.nativeElement.classList.add("fade-in"); // Aplica la animación
        }
      });
    } else {
      console.error("El elemento typedText no fue encontrado");
    }
  }
}
