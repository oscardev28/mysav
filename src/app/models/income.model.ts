export class IncomeModel {
  constructor(
    public userId: string,
    public month: string, // Formato 'YYYY-MM'
    public amount: number
  ) {}
}
