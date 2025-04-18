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

  // 2) guardarPlan: lees el plan existente, concatenas + haces un solo setDoc
  async guardarPlan(
    ingresos: number,
    ahorro: number,
    nuevosGastos: GastoModel[],
    nuevosGastosVariables: GastoModel[]
  ) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fechaActual = this.obtenerMesActual();
    const planRef     = doc(this.firestore, `users/${user.uid}/planes/${fechaActual}`);

    // 1) Cargo los arrays existentes (o vacío)
    const snap = await getDoc(planRef);
    const existente = snap.exists() ? (snap.data() as any) : {};
    const oldGastos = existente.gastos          || [];
    const oldVars   = existente.gastosVariables || [];

    // 2) Concateno
    const mergedGastos = [
      ...oldGastos,
      ...nuevosGastos.map(g => ({ ...g, id: g.id ?? crypto.randomUUID() }))
    ];
    const mergedVars = [
      ...oldVars,
      ...nuevosGastosVariables.map(g => ({ ...g, id: g.id ?? crypto.randomUUID() }))
    ];

    // 3) setDoc con merge:true para no sobreescribir otros campos
    await setDoc(planRef, {
      ingresos,
      ahorro,
      gastos: mergedGastos,
      gastosVariables: mergedVars
    }, { merge: true });
  }

  async obtenerPlanActual(): Promise<{ ingresos: number; ahorro: number; gastos: GastoModel[]; gastosVariables: GastoModel[] } | null> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fechaActual = this.obtenerMesActual(); // Formato YYYY-MM
    const planRef = doc(this.firestore, `users/${user.uid}/planes/${fechaActual}`);
    const planSnap = await getDoc(planRef);

    if (planSnap.exists()) {
      return planSnap.data() as any;
    }

    // Buscar el plan del mes anterior
    const fechaAnterior = this.obtenerMesAnterior();
    const planAnteriorRef = doc(this.firestore, `users/${user.uid}/planes/${fechaAnterior}`);
    const planAnteriorSnap = await getDoc(planAnteriorRef);

    if (!planAnteriorSnap.exists()) {
      return null; // No hay plan anterior, no se puede crear
    }

    const planAnterior = planAnteriorSnap.data() as any;

    // Generar fecha con día 01 del mes actual
    const fechaPrimerDiaMes = `${fechaActual}-01`;

    // Copiar gastos fijos ajustando fecha y generando nuevo ID
    const gastosFijos = (planAnterior.gastos || [])
      .filter((g: GastoModel) => g.type === 'fijo')
      .map((g: GastoModel) => ({
        ...g,
        id: crypto.randomUUID(),
        date: fechaPrimerDiaMes
      }));

    const nuevoPlan = {
      ingresos: planAnterior.ingresos,
      ahorro: planAnterior.ahorro,
      gastos: gastosFijos,
      gastosVariables: []
    };

    // Guardar el nuevo plan en Firestore
    await setDoc(planRef, nuevoPlan);

    return nuevoPlan;
  }


  private obtenerMesAnterior(): string {
    const ahora = new Date();
    ahora.setMonth(ahora.getMonth() - 1); // 🔙 Resta un mes
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    return `${año}-${mes}`;
  }

  // 1) añadirGasto: un único updateDoc con todos los elementos
  async añadirGasto(
    nuevosGastos: GastoModel[],
    tipo: 'fijo' | 'variable' = 'variable'
  ) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fechaActual = this.obtenerMesActual();
    const planRef    = doc(this.firestore, `users/${user.uid}/planes/${fechaActual}`);

    if (nuevosGastos.length === 0) return;

    // Genera un ID si no lo llevan y pásalos todos de golpe
    const paraUnion = nuevosGastos.map(g => ({
      ...g,
      id: g.id ?? crypto.randomUUID()
    }));

    await updateDoc(planRef, {
      [tipo === 'fijo' ? 'gastos' : 'gastosVariables']:
        arrayUnion(...paraUnion)
    });
  }

  async addSingleGasto(gasto: GastoModel) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const fechaActual = this.obtenerMesActual();
    const planRef = doc(this.firestore, `users/${user.uid}/planes/${fechaActual}`);

    if (!gasto) return;

    const gastoConID = {
      ...gasto,
      id: gasto.id ?? crypto.randomUUID()
    };

    await updateDoc(planRef, {
      [gasto.type === 'fijo' ? 'gastos' : 'gastosVariables']: arrayUnion(gastoConID)
    });
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
