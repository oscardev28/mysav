import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { GastoModel } from '../models/expense.model';

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  private obtenerMesActual(): string {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    return `${año}-${mes}`; // Formato "YYYY-MM"
  }

  async guardarPlan(ingresos: number, ahorro: number, gastos: GastoModel[], gastosVariables: GastoModel[]) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fechaActual = this.obtenerMesActual();
    const planRef = doc(this.firestore, `users/${user.uid}/planes/${fechaActual}`);

    const planData = {
      ingresos,
      ahorro,
      gastos,
      gastosVariables
    };

    await setDoc(planRef, {
      ingresos,
      ahorro,
      gastos: gastos.map(g => ({ ...g })), // convierte a objeto plano
      gastosVariables: gastosVariables.map(g => ({ ...g }))
    }, { merge: true });

  }

  async obtenerPlanActual(): Promise<{ ingresos: number; ahorro: number; gastos: GastoModel[]; gastosVariables: GastoModel[] } | null> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fechaActual = this.obtenerMesActual();
    const planRef = doc(this.firestore, `users/${user.uid}/planes/${fechaActual}`);
    const planSnap = await getDoc(planRef);

    return planSnap.exists() ? (planSnap.data() as any) : null;
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

  async eliminarGasto(gasto: GastoModel, tipo: 'fijo' | 'variable') {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fechaActual = this.obtenerMesActual();
    const planRef = doc(this.firestore, `users/${user.uid}/planes/${fechaActual}`);

    await updateDoc(planRef, {
      [tipo === 'fijo' ? 'gastos' : 'gastosVariables']: arrayRemove(gasto)
    });
  }

  async cargarPlan(mes: number, año: number): Promise<{ ingresos: number; ahorro: number; gastos: GastoModel[]; gastosVariables: GastoModel[] } | null> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fecha = `${año}-${String(mes + 1).padStart(2, '0')}`;
    const planRef = doc(this.firestore, `users/${user.uid}/planes/${fecha}`);
    const planSnap = await getDoc(planRef);

    return planSnap.exists() ? (planSnap.data() as { ingresos: number; ahorro: number; gastos: GastoModel[]; gastosVariables: GastoModel[] }) : null;
  }
}
