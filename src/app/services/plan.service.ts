import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, addDoc, updateDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

interface Gasto {
  nombre: string;
  tipo: string;
  valor: number;
  fecha: string; // Se guarda como "YYYY-MM-DD"
}

interface Plan {
  userId: string;
  ingresos: number;
  ahorro: number;
  gastos: Gasto[];
  gastosVariables: Gasto[];
}

@Injectable({
  providedIn: 'root'
})
export class PlanService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  private obtenerFechaActual(): string {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}`; // Formato "YYYY-MM-DD HH:mm:ss"
  }

  // Guardar o actualizar el plan del usuario
  async guardarPlan(ingresos: number, ahorro: number, gastos: Gasto[], gastosVariables: Gasto[]) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    // Agregar fecha a cada gasto
    const fechaActual = this.obtenerFechaActual();
    const gastosConFecha = gastos.map(gasto => ({ ...gasto, fecha: fechaActual }));
    const gastosVariablesConFecha = gastosVariables.map(gasto => ({ ...gasto, fecha: fechaActual }));

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data() as { planId?: string };
    const planId = userData?.planId;

    if (planId) {
      // Si el plan ya existe, actualizarlo
      const planDocRef = doc(this.firestore, 'plans', planId);
      const planSnap = await getDoc(planDocRef);

      if (planSnap.exists()) {
        const planData = planSnap.data() as Plan;

        await updateDoc(planDocRef, {
          ingresos,
          ahorro,
          gastos: [...planData.gastos, ...gastosConFecha], // Agrega los nuevos gastos
          gastosVariables: [...planData.gastosVariables, ...gastosVariablesConFecha]
        });

        return planId;
      }
    }

    // Si no existe el plan, crearlo
    const plansCollection = collection(this.firestore, 'plans');
    const newPlanRef = await addDoc(plansCollection, {
      userId: user.uid,
      ingresos,
      ahorro,
      gastos: gastosConFecha,
      gastosVariables: gastosVariablesConFecha
    });

    await setDoc(userDocRef, { planId: newPlanRef.id }, { merge: true });

    return newPlanRef.id;
  }

  async añadirGastos(gastosVariables: Gasto[]) {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    // Agregar fecha a cada gasto
    const fechaActual = this.obtenerFechaActual();
    const gastosVariablesConFecha = gastosVariables.map(gasto => ({ ...gasto, fecha: fechaActual }));

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data() as { planId?: string };
    const planId = userData?.planId;

    if (planId) {
      // Si el plan ya existe, actualizarlo
      const planDocRef = doc(this.firestore, 'plans', planId);
      const planSnap = await getDoc(planDocRef);

      if (planSnap.exists()) {
        const planData = planSnap.data() as Plan;

        await updateDoc(planDocRef, {
          gastosVariables: [...planData.gastosVariables, ...gastosVariablesConFecha]
        });

        return planId;
      }
    }

    // Si no existe el plan, crearlo
    const plansCollection = collection(this.firestore, 'plans');
    const newPlanRef = await addDoc(plansCollection, {
      userId: user.uid,
      gastosVariables: gastosVariablesConFecha
    });

    await setDoc(userDocRef, { planId: newPlanRef.id }, { merge: true });

    return newPlanRef.id;
  }

  // Obtener el plan del usuario
  async obtenerPlanActual(): Promise<Plan | null> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data() as { planId?: string };

    if (!userData?.planId) {
      return null; // No hay plan asociado
    }

    const planDocRef = doc(this.firestore, 'plans', userData.planId);
    const planSnap = await getDoc(planDocRef);

    if (!planSnap.exists()) {
      return null;
    }

    const plan = planSnap.data() as Plan;

    // Obtener fecha actual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Enero = 0, Febrero = 1, etc.
    const currentYear = currentDate.getFullYear();

    // Filtrar los gastos que correspondan al mes actual
    const gastosDelMes = plan.gastos.filter((gasto: any) => {
      const gastoFecha = new Date(gasto.fecha); // Asegúrate de que el formato de fecha sea correcto
      return gastoFecha.getMonth() === currentMonth && gastoFecha.getFullYear() === currentYear;
    });

    const gastosVariablesDelMes = plan.gastosVariables.filter((gasto: any) => {
      const gastoFecha = new Date(gasto.fecha); // Asegúrate de que el formato de fecha sea correcto
      return gastoFecha.getMonth() === currentMonth && gastoFecha.getFullYear() === currentYear;
    });

    // Actualizar el plan con solo los gastos del mes actual
    plan.gastos = gastosDelMes;
    plan.gastosVariables = gastosVariablesDelMes;

    return plan;
  }

  async getUser(): Promise<any | null> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data() as { planId?: string };

    if (!userData?.planId) {
      return null; // No hay plan asociado
    }

    const planDocRef = doc(this.firestore, 'plans', userData.planId);
    const planSnap = await getDoc(planDocRef);

    if (!planSnap.exists()) {
      return null;
    }

    const plan = planSnap.data() as Plan;

    // Obtener fecha actual
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Enero = 0, Febrero = 1, etc.
    const currentYear = currentDate.getFullYear();

    // Filtrar los gastos que correspondan al mes actual
    const gastosDelMes = plan.gastos.filter((gasto: any) => {
      const gastoFecha = new Date(gasto.fecha); // Asegúrate de que el formato de fecha sea correcto
      return gastoFecha.getMonth() === currentMonth && gastoFecha.getFullYear() === currentYear;
    });

    const gastosVariablesDelMes = plan.gastosVariables.filter((gasto: any) => {
      const gastoFecha = new Date(gasto.fecha); // Asegúrate de que el formato de fecha sea correcto
      return gastoFecha.getMonth() === currentMonth && gastoFecha.getFullYear() === currentYear;
    });

    // Actualizar el plan con solo los gastos del mes actual
    plan.gastos = gastosDelMes;
    plan.gastosVariables = gastosVariablesDelMes;

    return plan;
  }

  async cargarPlan(mes: number, año: number): Promise<Plan | null> {
    const user = this.auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data() as { planId?: string };

    if (!userData?.planId) {
      return null;
    }

    const planDocRef = doc(this.firestore, 'plans', userData.planId);
    const planSnap = await getDoc(planDocRef);

    if (!planSnap.exists()) {
      return null;
    }

    const plan = planSnap.data() as Plan;

    // Filtrar los gastos que correspondan al mes y año dados
    plan.gastos = plan.gastos.filter((gasto: any) => {
      const gastoFecha = new Date(gasto.fecha);
      return gastoFecha.getMonth() === mes && gastoFecha.getFullYear() === año;
    });

    plan.gastosVariables = plan.gastosVariables.filter((gasto: any) => {
      const gastoFecha = new Date(gasto.fecha);
      return gastoFecha.getMonth() === mes && gastoFecha.getFullYear() === año;
    });

    return plan;
  }

}
