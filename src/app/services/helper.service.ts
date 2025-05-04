import { Injectable } from '@angular/core';
import { GastoModel } from '../models/expense.model';

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

    try {
      let fecha: Date;

      // Si la fecha viene en formato ISO (yyyy-MM-dd)
      if (/^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
        fecha = new Date(fechaStr + 'T00:00'); // Evita problemas con huso horario
      }

      // Si la fecha viene en formato "dd/MM/yy, HH:mm"
      else if (/^\d{2}\/\d{2}\/\d{2},\s*\d{2}:\d{2}$/.test(fechaStr)) {
        const [fechaParte] = fechaStr.split(',');
        const [dia, mes, anioCorto] = fechaParte.trim().split('/');
        const anio = Number(anioCorto) < 50 ? '20' + anioCorto : '19' + anioCorto;
        fecha = new Date(`${anio}-${mes}-${dia}T00:00`);
      }

      else {
        return 'Formato de fecha no reconocido';
      }

      if (isNaN(fecha.getTime())) return 'Fecha inválida';

      const diaF = String(fecha.getDate()).padStart(2, '0');
      const mesF = String(fecha.getMonth() + 1).padStart(2, '0');
      const anioF = String(fecha.getFullYear()).slice(-2);

      return `${diaF}/${mesF}/${anioF}`;
    } catch {
      return 'Fecha inválida';
    }
  }

  sortDate(arr: GastoModel[]){
    return arr.sort((a, b) => {
      const fechaA = new Date(a.date);
      const fechaB = new Date(b.date);
      return fechaB.getTime() - fechaA.getTime(); // 🔽 más reciente primero
    });
  }

  toInputDatetimeFormat(fechaStr: string): string {
    // Acepta formato con coma o con espacio
    const partes = fechaStr.includes(', ')
      ? fechaStr.split(', ')
      : fechaStr.split(' ');

    const [fechaParte, horaParte] = partes;

    if (!fechaParte || !horaParte) {
      console.warn('Formato inválido:', fechaStr);
      return '';
    }

    // Detectar si la fecha ya está en formato yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(fechaParte)) {
      return `${fechaParte}T${horaParte}`;
    }

    // Si viene en dd/mm/yyyy
    const [dia, mes, anio] = fechaParte.split('/');
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${horaParte}`;
  }

  fromInputDatetimeFormat(isoStr: string): string {
    const [fecha, hora] = isoStr.split('T'); // fecha = '2025-05-03'
    if (!fecha || !hora) {
      console.warn('Formato inválido:', isoStr);
      return '';
    }

    const [anio, mes, dia] = fecha.split('-'); // <-- descompón directamente
    return `${dia}/${mes}/${anio.slice(-2)}, ${hora}`;
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
