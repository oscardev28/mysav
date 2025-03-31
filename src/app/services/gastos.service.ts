import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { GastoModel } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class GastosService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  private obtenerMesActual(): string {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    return `${año}-${mes}`; // Formato "YYYY-MM"
  }

  async generarGastosAleatorios() {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const ahora = new Date();

    const tiposDeGasto = [
      "Alquiler/Hipoteca", "Supermercado", "Internet", "Teléfono", "Gasolina", "Coche", "Suscripciones", "Seguro", "Luz", "Agua", "Gimnasio",
      "Transporte público", "Vacaciones"
    ];

    const tiposDeGastoVariable = [
      "Comer fuera", "Compras", "Ocio", "Salud", "Transporte", "Tecnología", "Viajes"
    ];

    for (let i = 0; i < 3; i++) {
      const fecha = new Date(ahora.getFullYear(), ahora.getMonth() + i);
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const fechaClave = `${año}-${mes}`;
      const fechaInicioMes = `${fechaClave}-01`;

      const ingresos = Math.floor(Math.random() * 2000) + 1000;
      const ahorro = Math.floor(Math.random() * 500);

      const gastos: GastoModel[] = Array.from({ length: 5 }).map(() => ({
        id: crypto.randomUUID(),
        name: tiposDeGasto[Math.floor(Math.random() * tiposDeGasto.length)],
        category: 'General',
        type: 'fijo',
        value: Math.floor(Math.random() * 500) + 100,
        date: fechaInicioMes
      }));

      const gastosVariables: GastoModel[] = Array.from({ length: 8 }).map(() => ({
        id: crypto.randomUUID(),
        name: tiposDeGastoVariable[Math.floor(Math.random() * tiposDeGastoVariable.length)],
        category: 'Extra',
        type: 'variable',
        value: Math.floor(Math.random() * 300) + 20,
        date: `${fechaClave}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`
      }));

      const planRef = doc(this.firestore, `users/${user.uid}/planes/${fechaClave}`);

      await setDoc(planRef, {
        ingresos,
        ahorro,
        gastos,
        gastosVariables
      }, { merge: true });
    }
  }

  async añadirGasto(nuevosGastos: GastoModel[], tipo: 'fijo' | 'variable' = 'variable') {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fechaActual = this.obtenerMesActual();
    const planRef = doc(this.firestore, `users/${user.uid}/planes/${fechaActual}`);

    const gastosConID = nuevosGastos.map(gasto => ({ ...gasto, id: crypto.randomUUID() }));

    for (const gasto of gastosConID) {
      await updateDoc(planRef, {
        [tipo === 'fijo' ? 'gastos' : 'gastosVariables']: arrayUnion(gasto)
      });
    }
  }

  private generarNombreAleatorio(): string {
    const nombres = ['Comida', 'Transporte', 'Ropa', 'Entretenimiento', 'Salud', 'Educación'];
    return nombres[Math.floor(Math.random() * nombres.length)];
  }

  private generarTipoAleatorio(): string {
    return Math.random() > 0.5 ? 'Fijo' : 'Variable';
  }

  private generarValorAleatorio(): number {
    return Math.floor(Math.random() * 200) + 50; // Valores entre 50 y 250
  }

  private obtenerFechaActualConDia(año: number, mes: number, dia: number): string {
    const fecha = new Date(año, mes - 1, dia); // Mes es 0-indexed, por eso restamos 1
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    const segundos = String(fecha.getSeconds()).padStart(2, '0');
    const diaFormateado = String(fecha.getDate()).padStart(2, '0');
    const mesFormateado = String(fecha.getMonth() + 1).padStart(2, '0');
    const añoFormateado = fecha.getFullYear();

    return `${añoFormateado}-${mesFormateado}-${diaFormateado} ${horas}:${minutos}:${segundos}`;
  }
}
