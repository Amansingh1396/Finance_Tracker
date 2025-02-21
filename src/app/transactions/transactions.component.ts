import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TransactionService, Transaction } from '../transaction.service';
import { Chart, registerables } from 'chart.js';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
  ],
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss'],
})
export class TransactionsComponent implements OnInit {
  transactionForm!: FormGroup;
  transactions: Transaction[] = [];
  chart!: Chart<'doughnut', number[], string>;
  isEditMode = false;
  editTransactionId: number | null = null;
  categories = ['Groceries', 'Rent', 'Salary', 'Entertainment', 'Utilities'];

  constructor(
    public transactionService: TransactionService,
    private fb: FormBuilder
  ) {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.transactions = this.transactionService.getTransactions();
    this.transactionForm = this.fb.group({
      description: [''],
      amount: [0],
      type: ['income'],
      category: [''],
      date: [new Date()],
    });

    this.renderChart();
  }

  addTransaction(): void {
    if (this.transactionForm.valid) {
      const newTransaction = {
        ...this.transactionForm.value,
        date: new Date(),
      };

      if (this.isEditMode && this.editTransactionId !== null) {
        newTransaction.id = this.editTransactionId;
        this.transactionService.updateTransaction(newTransaction);
        this.isEditMode = false;
        this.editTransactionId = null;
      } else {
        this.transactionService.addTransaction(newTransaction);
      }

      this.transactions = this.transactionService.getTransactions();
      this.transactionForm.reset({ type: 'income', date: new Date() });

      this.renderChart();
    }
  }

  editTransaction(transaction: Transaction): void {
    this.isEditMode = true;
    this.editTransactionId = transaction.id;
    this.transactionForm.setValue({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    });
  }

  deleteTransaction(id: number): void {
    this.transactionService.deleteTransaction(id);
    this.transactions = this.transactionService.getTransactions();
    this.renderChart();
  }

  renderChart(): void {
    if (this.chart) {
      this.chart.destroy();
    }

    const income = this.transactionService.getTotalIncome();
    const expense = this.transactionService.getTotalExpense();
    const balance = this.transactionService.getBalance();

    const ctx = document.getElementById('transactionChart') as HTMLCanvasElement;

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expenses', 'Balance'],
        datasets: [
          {
            data: [income, expense, balance],
            backgroundColor: ['#4caf50', '#f44336', '#2196f3'],
            hoverBackgroundColor: ['#66bb6a', '#e57373', '#64b5f6'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
        },
      },
    });
  }
}
