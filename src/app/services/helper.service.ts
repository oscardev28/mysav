import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class Helper {
  constructor() {}

  getDate(): string {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    return `${año}-${mes}-${dia} ${horas}:${minutos}`;
  }

  formatearFecha(fechaStr: string): string {
    if (!fechaStr) return 'Fecha no disponible';

    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return 'Fecha inválida';

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

  devLog(...args: any[]) {
    if (window.location.hostname === 'localhost') {
      console.log(...args);
    }
  }

  getYear() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    return currentYear;
  }
}
