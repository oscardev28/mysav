export class SavingsModel {
  constructor(
    public userId: string,
    public month: string, // Formato 'YYYY-MM'
    public amount: number
  ) {}
}