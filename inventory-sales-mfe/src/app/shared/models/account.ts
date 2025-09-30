import { Transaction } from "./transaction";

export interface Account {
  id: string;
  userId: string;
  type: string;
  cards: Card[];
  transactions: Transaction[];
}

export interface Card {
  id: string;
  accountId: string;
  name: string;
  number: string;
  type: string; // e.g., "Debit", "Credit"
  cvc: string;
  dueDate: string; // ISO date string
  paymentDate: string | null; // ISO date string or null
  functions: string; // e.g., "Debit"
  is_blocked: boolean;
}