import React, { createContext, useContext, useState, ReactNode } from 'react'
import { defaultReferenceBudgets } from '../data/referenceBudgets'

interface Expense {
  id: string
  description: string
  amount: number
  date: Date
  category: string
  userName: string
  userEmail: string
}

interface MonthlyBudget {
  id: string
  name: string
  referenceValue: number
  spent: number
  remaining: number
  category: string
  percentage: number
}

interface BudgetContextType {
  currentMonth: number
  currentYear: number
  setCurrentMonth: (month: number) => void
  setCurrentYear: (year: number) => void
  // Nouvelles fonctions pour les actions globales
  openAddExpenseDialog: (budgetName?: string) => void
  openAddBudgetDialog: () => void
  openAddCategoryDialog: () => void
  // États pour les modales globales
  globalAddExpenseOpen: boolean
  globalAddBudgetOpen: boolean
  globalAddCategoryOpen: boolean
  selectedBudgetForExpense: string | null
  closeGlobalDialogs: () => void
  // Données et fonctions pour la gestion des budgets et dépenses
  monthlyBudgets: MonthlyBudget[]
  budgetExpenses: Record<string, Expense[]>
  addExpense: (budgetName: string, expense: Omit<Expense, 'id'>) => void
  deleteExpense: (budgetName: string, expenseId: string) => void
  resetBudget: (budgetName: string) => void
  resetAllBudgets: () => void
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export const useBudget = () => {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider')
  }
  return context
}

interface BudgetProviderProps {
  children: ReactNode
}

export const BudgetProvider: React.FC<BudgetProviderProps> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear())
  
  // États pour les modales globales
  const [globalAddExpenseOpen, setGlobalAddExpenseOpen] = useState(false)
  const [globalAddBudgetOpen, setGlobalAddBudgetOpen] = useState(false)
  const [globalAddCategoryOpen, setGlobalAddCategoryOpen] = useState(false)
  const [selectedBudgetForExpense, setSelectedBudgetForExpense] = useState<string | null>(null)

  // Données des budgets mensuels
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>(() => 
    defaultReferenceBudgets
      .filter(budget => budget.category !== 'Épargne')
      .map((budget, index) => {
        return {
          id: `budget-${index}`,
          name: budget.name,
          referenceValue: budget.value,
          spent: 0,
          remaining: budget.value,
          category: budget.category,
          percentage: 0
        }
      })
  )

  // Données des dépenses - complètement vides
  const [budgetExpenses, setBudgetExpenses] = useState<Record<string, Expense[]>>({})

  const openAddExpenseDialog = (budgetName?: string) => {
    setSelectedBudgetForExpense(budgetName || null)
    setGlobalAddExpenseOpen(true)
  }

  const openAddBudgetDialog = () => {
    setGlobalAddBudgetOpen(true)
  }

  const openAddCategoryDialog = () => {
    setGlobalAddCategoryOpen(true)
  }

  const closeGlobalDialogs = () => {
    setGlobalAddExpenseOpen(false)
    setGlobalAddBudgetOpen(false)
    setGlobalAddCategoryOpen(false)
    setSelectedBudgetForExpense(null)
  }

  const addExpense = (budgetName: string, expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString()
    }

    // Ajouter la dépense à la liste
    setBudgetExpenses(prev => ({
      ...prev,
      [budgetName]: [...(prev[budgetName] || []), newExpense]
    }))

    // Mettre à jour le budget correspondant
    setMonthlyBudgets(prev => 
      prev.map(budget => {
        if (budget.name === budgetName) {
          const newSpent = budget.spent + expense.amount
          const newRemaining = budget.referenceValue - newSpent
          const newPercentage = (newSpent / budget.referenceValue) * 100
          
          return {
            ...budget,
            spent: newSpent,
            remaining: newRemaining,
            percentage: Math.round(newPercentage * 100) / 100
          }
        }
        return budget
      })
    )
  }

  const deleteExpense = (budgetName: string, expenseId: string) => {
    const expense = budgetExpenses[budgetName]?.find(e => e.id === expenseId)
    if (!expense) return

    // Supprimer la dépense
    setBudgetExpenses(prev => ({
      ...prev,
      [budgetName]: prev[budgetName]?.filter(e => e.id !== expenseId) || []
    }))

    // Mettre à jour le budget correspondant
    setMonthlyBudgets(prev => 
      prev.map(budget => {
        if (budget.name === budgetName) {
          const newSpent = budget.spent - expense.amount
          const newRemaining = budget.referenceValue - newSpent
          const newPercentage = (newSpent / budget.referenceValue) * 100
          
          return {
            ...budget,
            spent: Math.max(0, newSpent), // Éviter les valeurs négatives
            remaining: newRemaining,
            percentage: Math.max(0, Math.round(newPercentage * 100) / 100)
          }
        }
        return budget
      })
    )

    return expense
  }

  const resetBudget = (budgetName: string) => {
    // Supprimer toutes les dépenses du budget
    setBudgetExpenses(prev => ({
      ...prev,
      [budgetName]: []
    }))

    // Remettre le budget à sa valeur de référence
    setMonthlyBudgets(prev => 
      prev.map(budget => {
        if (budget.name === budgetName) {
          return {
            ...budget,
            spent: 0,
            remaining: budget.referenceValue,
            percentage: 0
          }
        }
        return budget
      })
    )
  }

  const resetAllBudgets = () => {
    // Supprimer toutes les dépenses de tous les budgets
    setBudgetExpenses({})

    // Remettre tous les budgets à leurs valeurs de référence
    setMonthlyBudgets(prev => 
      prev.map(budget => ({
        ...budget,
        spent: 0,
        remaining: budget.referenceValue,
        percentage: 0
      }))
    )
  }

  const value: BudgetContextType = {
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    openAddExpenseDialog,
    openAddBudgetDialog,
    openAddCategoryDialog,
    globalAddExpenseOpen,
    globalAddBudgetOpen,
    globalAddCategoryOpen,
    selectedBudgetForExpense,
    closeGlobalDialogs,
    monthlyBudgets,
    budgetExpenses,
    addExpense,
    deleteExpense,
    resetBudget,
    resetAllBudgets
  }

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  )
} 