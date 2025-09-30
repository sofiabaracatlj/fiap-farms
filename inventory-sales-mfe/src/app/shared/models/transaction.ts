export interface Transaction {
  id: string;
  accountId: string;
  type: 'deposit' | 'withdrawal' | 'transfer';
  value: number;
  description: string;
  date: string; // ISO date string
}
