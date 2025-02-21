import { Injectable } from '@angular/core';

export interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: Date;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transactions: Transaction[] = [];
  private transactionId = 0;

  constructor() {
    this.loadFromLocalStorage();
  }

  getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  addTransaction(transaction: Omit<Transaction, 'id'>): void {
    const newTransaction: Transaction = {
      ...transaction,
      id: ++this.transactionId,
    };
    this.transactions.push(newTransaction);
    this.saveToLocalStorage();
    console.log('Transaction Added:', newTransaction);
  }

  updateTransaction(updatedTransaction: Transaction): void {
    const index = this.transactions.findIndex((t) => t.id === updatedTransaction.id);
    if (index !== -1) {
      this.transactions[index] = updatedTransaction;
      this.saveToLocalStorage();
      console.log('Transaction Updated:', updatedTransaction);
    }
  }

  deleteTransaction(id: number): void {
    const transaction = this.transactions.find((t) => t.id === id);
    this.transactions = this.transactions.filter((t) => t.id !== id);
    this.saveToLocalStorage();
    console.log('Transaction Deleted:', transaction);
  }

  getTotalIncome(): number {
    return this.transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getTotalExpense(): number {
    return this.transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getBalance(): number {
    return this.getTotalIncome() - this.getTotalExpense();
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('transactions', JSON.stringify(this.transactions));
    console.log('Transactions Saved to LocalStorage.');
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('transactions');
    if (data) {
      this.transactions = JSON.parse(data);
      this.transactionId = this.transactions.length
        ? Math.max(...this.transactions.map((t) => t.id))
        : 0;
      console.log('Transactions Loaded from LocalStorage:', this.transactions);
    }
  }
}
