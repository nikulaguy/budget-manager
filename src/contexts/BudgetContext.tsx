import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { defaultReferenceBudgets, isCategoryCumulative } from '../data/referenceBudgets'
import { githubStorage, configureGitHubToken, AppData } from '../services/githubStorage'
import { toastWithClose } from '../utils/toast'
import { useAuth } from './AuthContext'

// Fonction utilitaire pour arrondir les nombres et éviter les problèmes de précision
const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100
}

export interface Expense {
  id: string
  description: string
  amount: number
  date: Date
  category: string
  userName: string
  userEmail: string
}

export interface MonthlyBudget {
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
  resetToDefaults: () => void
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
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // États pour les modales globales
  const [globalAddExpenseOpen, setGlobalAddExpenseOpen] = useState(false)
  const [globalAddBudgetOpen, setGlobalAddBudgetOpen] = useState(false)
  const [globalAddCategoryOpen, setGlobalAddCategoryOpen] = useState(false)
  const [selectedBudgetForExpense, setSelectedBudgetForExpense] = useState<string | null>(null)

  // Fonction pour créer les budgets par défaut
  const createDefaultBudgets = (): MonthlyBudget[] => {
    return defaultReferenceBudgets.map((budget, index) => ({
      id: `budget-${index}`,
      name: budget.name,
      referenceValue: budget.value,
      spent: 0,
      remaining: budget.value,
      category: budget.category,
      percentage: 0
    }))
  }

  // Données des budgets mensuels - initialisées vides, chargées au démarrage
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([])

  // Données des dépenses - initialisées vides, chargées au démarrage
  const [budgetExpenses, setBudgetExpenses] = useState<Record<string, Expense[]>>({})

  // Configuration et initialisation au démarrage
  useEffect(() => {
    console.log('🔍 Chargement initial des données...')
    loadFromLocalStorage()
  }, [])

  // Sauvegarde automatique après chaque modification (seulement si les données sont chargées)
  useEffect(() => {
    if (dataLoaded && monthlyBudgets.length > 0) {
      saveToLocalStorage(monthlyBudgets, budgetExpenses)
    }
  }, [monthlyBudgets, budgetExpenses, dataLoaded])

  // Fonction de sauvegarde dans localStorage
  const saveToLocalStorage = (budgets: MonthlyBudget[], expenses: Record<string, Expense[]>) => {
    try {
      const dataToSave = {
        budgets,
        expenses,
        currentMonth,
        currentYear,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem('budget-manager-data', JSON.stringify(dataToSave))
      console.log('💾 Données sauvegardées en localStorage')
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde localStorage:', error)
    }
  }

  // Fonction de chargement depuis localStorage
  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('budget-manager-data')
      if (saved) {
        const data = JSON.parse(saved)
        console.log('📋 Données trouvées dans localStorage:', data)
        
        if (data.budgets && data.budgets.length > 0) {
          setMonthlyBudgets(data.budgets)
          console.log(`📋 ${data.budgets.length} budgets chargés depuis localStorage`)
        } else {
          console.log('📋 Aucun budget trouvé, création des budgets par défaut')
          setMonthlyBudgets(createDefaultBudgets())
        }
        
        if (data.expenses && Object.keys(data.expenses).length > 0) {
          const reconstructedExpenses: Record<string, Expense[]> = {}
          for (const [budgetName, expenses] of Object.entries(data.expenses)) {
            if (Array.isArray(expenses) && expenses.length > 0) {
              reconstructedExpenses[budgetName] = (expenses as any[]).map(expense => ({
                ...expense,
                date: new Date(expense.date)
              }))
            }
          }
          setBudgetExpenses(reconstructedExpenses)
          console.log(`💰 Dépenses chargées depuis localStorage:`, reconstructedExpenses)
        }

        // Charger la date actuelle si sauvegardée
        if (data.currentMonth && data.currentYear) {
          setCurrentMonth(data.currentMonth)
          setCurrentYear(data.currentYear)
        }
      } else {
        console.log('📋 Aucune donnée trouvée, création des budgets par défaut')
        setMonthlyBudgets(createDefaultBudgets())
      }
      
      setDataLoaded(true)
    } catch (error) {
      console.error('❌ Erreur lors du chargement localStorage:', error)
      console.log('📋 Fallback: création des budgets par défaut')
      setMonthlyBudgets(createDefaultBudgets())
      setDataLoaded(true)
    }
  }

  const loadFromGitHub = async () => {
    setIsLoading(true)
    try {
      const data = await githubStorage.loadData()
      
      if (data) {
        setMonthlyBudgets(data.budgets)
        setBudgetExpenses(data.expenses)
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
      const dataToSave: AppData = {
        budgets: monthlyBudgets,
        expenses: budgetExpenses,
        users: [], // Pas d'utilisateurs dans cette version simplifiée
        lastUpdated: new Date().toISOString()
      }
      
      await githubStorage.saveData(dataToSave)
      toastWithClose.success('Données sauvegardées sur GitHub')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toastWithClose.error('Erreur lors de la sauvegarde')
    } finally {
      setIsLoading(false)
    }
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
      id: `expense-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    // Ajouter la dépense
    const newExpenses = {
      ...budgetExpenses,
      [budgetName]: [...(budgetExpenses[budgetName] || []), newExpense]
    }
    setBudgetExpenses(newExpenses)

    // Mettre à jour le budget correspondant
    const newBudgets = monthlyBudgets.map(budget => {
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
    setMonthlyBudgets(newBudgets)
    
    console.log('💰 Dépense ajoutée:', expense.amount, '€ pour', budgetName)
  }

  const deleteExpense = (budgetName: string, expenseId: string) => {
    const expense = budgetExpenses[budgetName]?.find(e => e.id === expenseId)
    if (!expense) return

    // Supprimer la dépense
    const newExpenses = {
      ...budgetExpenses,
      [budgetName]: budgetExpenses[budgetName]?.filter(e => e.id !== expenseId) || []
    }
    setBudgetExpenses(newExpenses)

    // Mettre à jour le budget correspondant
    const newBudgets = monthlyBudgets.map(budget => {
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
    setMonthlyBudgets(newBudgets)

    return expense
  }

  const resetBudget = (budgetName: string) => {
    // Supprimer toutes les dépenses du budget
    const newExpenses = {
      ...budgetExpenses,
      [budgetName]: []
    }
    setBudgetExpenses(newExpenses)

    // Remettre le budget à sa valeur de référence
    const newBudgets = monthlyBudgets.map(budget => {
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
    setMonthlyBudgets(newBudgets)
  }

  const resetAllBudgets = () => {
    // Supprimer toutes les dépenses de tous les budgets
    setBudgetExpenses({})

    // Remettre tous les budgets à leurs valeurs de référence
    const newBudgets = monthlyBudgets.map(budget => ({
      ...budget,
      spent: 0,
      remaining: budget.referenceValue,
      percentage: 0
    }))
    setMonthlyBudgets(newBudgets)
  }

  const resetToDefaults = () => {
    console.log('🔄 Réinitialisation complète vers les budgets par défaut')
    
    // Nettoyer complètement localStorage
    localStorage.removeItem('budget-manager-data')
    
    // Créer les budgets par défaut
    const defaultBudgets = createDefaultBudgets()
    
    // Remettre à zéro les dépenses
    const emptyExpenses = {}
    
    // Mettre à jour les states
    setMonthlyBudgets(defaultBudgets)
    setBudgetExpenses(emptyExpenses)
    
    console.log('✅ Réinitialisation terminée:', {
      budgets: defaultBudgets.length,
      categories: [...new Set(defaultBudgets.map(b => b.category))],
      epargneCount: defaultBudgets.filter(b => b.category === 'Épargne').length
    })
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
    resetToDefaults,
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