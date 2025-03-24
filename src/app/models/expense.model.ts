export class GastoModel {
  constructor(
    public id: string,         // ID opcional, generado por Firestore
    public name: string,      // Nombre del gasto
    public category: string,
    public type: 'fijo' | 'variable', // Tipo de gasto
    public value: number,       // Monto del gasto
    public date: string        // Fecha en formato "YYYY-MM-DD"
  ) {}
}
