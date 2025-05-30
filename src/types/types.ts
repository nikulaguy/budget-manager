export interface BankAccount {
  id: string;
  name: string;
  isDefault: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  description: string;
}

export interface Budget {
  id: string;
  title: string;
  amount: number;
  spent: number;
  remaining: number;
  categoryId: string;
  bankAccountId?: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  date: string;
  budgetId: string;
  bankAccountId?: string;
  user?: string;
}

export interface MonthlyBudgetHistory {
  period: string;
  budgets: Budget[];
  expenses: Expense[];
}

export interface AppData {
  budgets: Budget[];
  bankAccounts: BankAccount[];
  categories: BudgetCategory[];
  history: MonthlyBudgetHistory[];
  currentPeriod: string;
}

export type ActionType = 'ADD_BUDGET' | 'ADD_EXPENSE' | 'ADD_CATEGORY';

export type SortField = 'title' | 'amount' | 'spent' | 'remaining';

export interface SortConfig {
  field: SortField;
  order: 'asc' | 'desc';
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgets: Budget[];
}

export interface YearlyReport {
  year: number;
  monthlyReports: MonthlyReport[];
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
} 