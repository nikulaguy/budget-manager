import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { defaultReferenceBudgets, isCategoryCumulative } from '../data/referenceBudgets'
import { githubStorage, configureGitHubToken, AppData } from '../services/githubStorage'
import { toastWithClose } from '../utils/toast'

// Fonction utilitaire pour arrondir les nombres et éviter les problèmes de précision
const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100
}

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
  // Nouvelle fonction pour passer au mois suivant avec logique cumulative
  moveToNextMonth: () => void
  // Fonctions pour la synchronisation GitHub
  loadFromGitHub: () => Promise<void>
  saveToGitHub: () => Promise<void>
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState(false)
  
  // États pour les modales globales
  const [globalAddExpenseOpen, setGlobalAddExpenseOpen] = useState(false)
  const [globalAddBudgetOpen, setGlobalAddBudgetOpen] = useState(false)
  const [globalAddCategoryOpen, setGlobalAddCategoryOpen] = useState(false)
  const [selectedBudgetForExpense, setSelectedBudgetForExpense] = useState<string | null>(null)

  // Données des budgets mensuels - TOUTES les catégories incluses
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>(() => 
    defaultReferenceBudgets
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

  // Données des dépenses - complètement vides (aucun historique)
  const [budgetExpenses, setBudgetExpenses] = useState<Record<string, Expense[]>>({})

  // Configuration du token GitHub au démarrage
  useEffect(() => {
    // Pour la démo, on utilise un token GitHub personnalisé
    // IMPORTANT: En production, ce token devrait être configuré via des variables d'environnement
    const token = import.meta.env.VITE_GITHUB_TOKEN || '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'
    configureGitHubToken(token)
  }, [])

  // Chargement automatique des données au démarrage
  useEffect(() => {
    loadFromGitHub()
  }, [])

  const loadFromGitHub = async () => {
    setIsLoading(true)
    try {
      const data = await githubStorage.loadData()
      if (data) {
        // Reconstruire les budgets avec les données sauvegardées
        if (data.budgets) {
          setMonthlyBudgets(data.budgets)
        }
        
        // Reconstruire les dépenses avec les bonnes dates
        if (data.expenses) {
          const reconstructedExpenses: Record<string, Expense[]> = {}
          for (const [budgetName, expenses] of Object.entries(data.expenses)) {
            reconstructedExpenses[budgetName] = expenses.map(expense => ({
              ...expense,
              date: new Date(expense.date) // Reconvertir les dates
            }))
          }
          setBudgetExpenses(reconstructedExpenses)
        }
        
        toastWithClose.success('Données chargées depuis GitHub')
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toastWithClose.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const saveToGitHub = async () => {
    setIsLoading(true)
    try {
      const data: AppData = {
        budgets: monthlyBudgets,
        expenses: budgetExpenses,
        users: {}, // Pour l'instant, on ne sauvegarde pas les utilisateurs
        lastUpdated: new Date().toISOString()
      }
      
      const success = await githubStorage.saveData(data)
      if (success) {
        toastWithClose.success('Données sauvegardées sur GitHub')
      } else {
        toastWithClose.error('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toastWithClose.error('Erreur lors de la sauvegarde des données')
    } finally {
      setIsLoading(false)
    }
  }

  // Sauvegarde automatique après chaque modification
  const autoSave = async () => {
    // Attendre un peu pour grouper les modifications
    setTimeout(() => {
      saveToGitHub()
    }, 1000)
  }

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
          const newSpent = roundToTwo(budget.spent + expense.amount)
          const newRemaining = roundToTwo(budget.referenceValue - newSpent)
          const newPercentage = roundToTwo((newSpent / budget.referenceValue) * 100)
          
          return {
            ...budget,
            spent: newSpent,
            remaining: newRemaining,
            percentage: newPercentage
          }
        }
        return budget
      })
    )

    // Sauvegarde automatique
    autoSave()
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
          const newSpent = roundToTwo(Math.max(0, budget.spent - expense.amount))
          const newRemaining = roundToTwo(budget.referenceValue - newSpent)
          const newPercentage = roundToTwo(Math.max(0, (newSpent / budget.referenceValue) * 100))
          
          return {
            ...budget,
            spent: newSpent,
            remaining: newRemaining,
            percentage: newPercentage
          }
        }
        return budget
      })
    )

    // Sauvegarde automatique
    autoSave()

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

    // Sauvegarde automatique
    autoSave()
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

    // Sauvegarde automatique
    autoSave()
  }

  const moveToNextMonth = () => {
    // Calculer les nouveaux budgets pour le mois suivant
    const newBudgets = monthlyBudgets.map(budget => {
      const isCumulative = isCategoryCumulative(budget.category)
      
      if (isCumulative) {
        // Pour les catégories cumulatives (Mensuel, Annuel) : 
        // Nouveau budget = valeur de référence + reste du mois précédent
        const newReferenceValue = roundToTwo(budget.referenceValue + Math.max(0, budget.remaining))
        return {
          ...budget,
          referenceValue: newReferenceValue,
          spent: 0,
          remaining: newReferenceValue,
          percentage: 0
        }
      } else {
        // Pour les catégories non cumulatives (Courant, Épargne) :
        // Nouveau budget = valeur de référence (reset complet)
        return {
          ...budget,
          spent: 0,
          remaining: budget.referenceValue,
          percentage: 0
        }
      }
    })

    // Naviguer vers le mois suivant
    const currentDate = new Date(currentYear, currentMonth - 1) // currentMonth est 1-based
    const nextDate = new Date(currentDate)
    nextDate.setMonth(nextDate.getMonth() + 1)

    // Mettre à jour les budgets
    setMonthlyBudgets(newBudgets)

    // Supprimer toutes les dépenses du mois précédent
    setBudgetExpenses({})

    // Mettre à jour la date
    setCurrentMonth(nextDate.getMonth() + 1) // Reconvertir en 1-based
    setCurrentYear(nextDate.getFullYear())

    // Sauvegarde automatique
    autoSave()

    toastWithClose.success('Passage au mois suivant effectué avec report des budgets cumulatifs')
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
    resetAllBudgets,
    moveToNextMonth,
    loadFromGitHub,
    saveToGitHub,
    isLoading
  }

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  )
} 