import React, { createContext, useContext, useState, useCallback } from 'react'
import { BudgetContextType } from '../types'

const BudgetContext = createContext<BudgetContextType | undefined>(undefined)

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const refreshBudgets = useCallback(() => {
    // Cette fonction sera utilisée pour rafraîchir les données de budget
    // Elle sera implémentée avec React Query dans les hooks
    console.log('Rafraîchissement des budgets')
  }, [])

  const value: BudgetContextType = {
    currentMonth,
    currentYear,
    setCurrentMonth,
    setCurrentYear,
    refreshBudgets
  }

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  )
}

export const useBudget = () => {
  const context = useContext(BudgetContext)
  if (context === undefined) {
    throw new Error('useBudget must be used within a BudgetProvider')
  }
  return context
} 