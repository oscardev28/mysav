import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class Helper {
  constructor() {}

  formatearFecha(fechaStr: string): string {
    const fecha = new Date(fechaStr);
    const opciones: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    };
    return new Intl.DateTimeFormat('es-ES', opciones).format(fecha);
  }

  getMonthName(month:number = 12) {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();

    if(month != 12) {
      return meses[month];
    }

    return meses[currentMonth];
  }

  getYear() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    return currentYear;
  }
}
