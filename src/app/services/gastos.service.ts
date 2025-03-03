import { Injectable } from '@angular/core';
import { Firestore, doc, updateDoc, getDoc } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class GastosService {
  constructor(private firestore: Firestore, private auth: Auth) {}

  async generarGastosAleatorios() {
    const user = this.auth.currentUser;
    if (!user) {
      console.error('⚠️ No hay usuario autenticado');
      return;
    }

    const userDocRef = doc(this.firestore, 'users', user.uid);
    const userSnap = await getDoc(userDocRef);
    const userData = userSnap.data() as { planId?: string };

    if (!userData?.planId) {
      throw new Error("No se encontró un plan asociado a este usuario");
    }

    const planRef = doc(this.firestore, 'plans', userData.planId);

    console.log(planRef);
    const planSnap = await getDoc(planRef);

    if (!planSnap.exists()) {
      console.error('⚠️ No se encontró el plan del usuario');
      return;
    }

    let planData = planSnap.data();
    let gastosVariables = planData['gastosVariables'] || [];

    const diasDelMes = Array.from({ length: 30 }, (_, i) => i + 1); // Días 1-30
    const diasSinGasto = this.obtenerDiasSinGasto(5, 30); // 5 días sin gasto

    for (let dia of diasDelMes) {
      if (diasSinGasto.includes(dia)) continue; // Saltar estos días

      // Aquí usamos la función obtenerFechaActualConDia para generar la fecha
      const fecha = this.obtenerFechaActualConDia(2024, 2, dia); // Generamos la fecha con el formato adecuado

      const gasto = {
        nombre: this.generarNombreAleatorio(),
        tipo: this.generarTipoAleatorio(),
        valor: this.generarValorAleatorio(),
        fecha: fecha // La fecha con formato "YYYY-MM-DD HH:mm:ss"
      };

      gastosVariables.push(gasto);
    }

    await updateDoc(planRef, { gastosVariables }); // Guardar en Firestore
    console.log('📤 Gastos aleatorios añadidos en gastosVariables del plan');
  }

  private obtenerDiasSinGasto(cantidad: number, maxDia: number): number[] {
    const dias: number[] = [];
    while (dias.length < cantidad) {
      const randomDia = Math.floor(Math.random() * maxDia) + 1;
      if (!dias.includes(randomDia)) dias.push(randomDia);
    }
    return dias;
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
