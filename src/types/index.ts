import React from 'react'

// Types pour l'utilisateur et l'authentification
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'master' | 'masterMaitre' | 'simple'
  createdAt: Date
  updatedAt: Date
}

// Types pour les catégories de budget
export interface BudgetCategory {
  id: string
  name: string
  type: 'Courant' | 'Mensuel' | 'Annuel' | 'Épargne'
  createdAt: Date
  updatedAt: Date
}

// Types pour les budgets de référence
export interface ReferenceBudget {
  id: string
  name: string
  value: number
  categoryId: string
  category?: BudgetCategory
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Types pour les comptes bancaires
export interface BankAccount {
  id: string
  name: string
  isDefault: boolean
  canDelete: boolean
  createdAt: Date
  updatedAt: Date
}

// Types pour les dépenses
export interface Expense {
  id: string
  description: string
  amount: number
  date: Date
  authorId: string
  author?: User
  budgetId: string
  budget?: MonthlyBudget
  bankAccountId?: string
  bankAccount?: BankAccount
  createdAt: Date
  updatedAt: Date
}

// Types pour les budgets mensuels
export interface MonthlyBudget {
  id: string
  name: string
  referenceValue: number
  currentValue: number
  spent: number
  remaining: number
  month: number
  year: number
  categoryId: string
  category?: BudgetCategory
  referenceBudgetId: string
  referenceBudget?: ReferenceBudget
  expenses?: Expense[]
  createdAt: Date
  updatedAt: Date
}

// Types pour les jauges et statistiques
export interface BudgetGauge {
  percentage: number
  status: 'good' | 'warning' | 'danger'
  color: string
}

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  totalRemaining: number
  totalSavings: number
  savingsSpent: number
  savingsRemaining: number
  monthlyBudgets: MonthlyBudget[]
}

// Types pour les filtres et recherche
export interface ExpenseFilters {
  dateFrom?: Date
  dateTo?: Date
  categoryId?: string
  authorId?: string
  budgetId?: string
  minAmount?: number
  maxAmount?: number
  description?: string
}

export interface BudgetFilters {
  month?: number
  year?: number
  categoryType?: string
  status?: 'all' | 'overBudget' | 'underBudget'
}

// Types pour l'export
export interface ExportOptions {
  format: 'pdf' | 'csv'
  dateRange: {
    from: Date
    to: Date
  }
  includeCategories?: string[]
  includeAuthors?: string[]
}

// Types pour les notifications
export interface NotificationSettings {
  id: string
  userId: string
  budgetOverflow: boolean
  monthlyReminder: boolean
  weeklyReport: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

// Types pour les invitations
export interface Invitation {
  id: string
  email: string
  role: 'master' | 'simple'
  invitedBy: string
  invitedByUser?: User
  status: 'pending' | 'accepted' | 'rejected' | 'expired'
  createdAt: Date
  expiresAt: Date
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Types pour les formulaires
export interface LoginForm {
  email: string
}

export interface ExpenseForm {
  description: string
  amount: number
  date: Date
  budgetId: string
  bankAccountId?: string
}

export interface BudgetForm {
  name: string
  value: number
  categoryId: string
}

export interface CategoryForm {
  name: string
  type: 'Courant' | 'Mensuel' | 'Annuel' | 'Épargne'
}

export interface BankAccountForm {
  name: string
}

// Types pour les modals et composants UI
export interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export interface FloatingActionButtonItem {
  label: string
  icon: React.ReactNode
  onClick: () => void
  'aria-label': string
}

// Types pour les erreurs
export interface AppError {
  code: string
  message: string
  details?: any
}

// Types pour les contextes
export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string) => Promise<void>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

export interface BudgetContextType {
  currentMonth: number
  currentYear: number
  setCurrentMonth: (month: number) => void
  setCurrentYear: (year: number) => void
  refreshBudgets: () => void
} 