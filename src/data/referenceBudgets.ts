import { BudgetCategory } from '../types'

// Fonction utilitaire pour arrondir les nombres et éviter les problèmes de précision
const roundToTwo = (num: number): number => {
  return Math.round(num * 100) / 100
}

// Catégories de budget par défaut avec propriété cumulative
export const defaultCategories: Array<Omit<BudgetCategory, 'id' | 'createdAt' | 'updatedAt'> & { cumulative: boolean }> = [
  { name: 'Courant', type: 'Courant', cumulative: false }, // Courant : remet à zéro
  { name: 'Mensuel', type: 'Mensuel', cumulative: true }, // Mensuel : cumule les restes
  { name: 'Annuel', type: 'Annuel', cumulative: true }, // Annuel : cumule les restes
  { name: 'Épargne', type: 'Épargne', cumulative: false } // Épargne : remet à zéro
]

// Interface temporaire pour les budgets de référence avec catégorie en string
interface ReferenceBudgetWithCategory {
  name: string
  value: number
  category: 'Courant' | 'Mensuel' | 'Annuel' | 'Épargne'
  isDefault: boolean
}

// Fonction pour vérifier si une catégorie est cumulative
export const isCategoryCumulative = (categoryName: string): boolean => {
  const category = defaultCategories.find(cat => cat.name === categoryName)
  return category?.cumulative ?? false
}

// Budgets de référence par défaut
export const defaultReferenceBudgets: ReferenceBudgetWithCategory[] = [
  // Courant - Non cumulatif (remet à la valeur de référence)
  { name: 'Alimentation Entretien', value: 950, category: 'Courant', isDefault: true },
  { name: 'Anna', value: 308.01, category: 'Courant', isDefault: true },
  { name: 'Clope', value: 300, category: 'Courant', isDefault: true },
  { name: 'Argent de poche couple', value: 100, category: 'Courant', isDefault: true },
  { name: 'Transport', value: 100, category: 'Courant', isDefault: true },

  // Mensuel - Cumulatif (ajoute les restes du mois précédent)
  { name: 'Ecole Cantine Centre', value: 100, category: 'Mensuel', isDefault: true },
  { name: 'Cantine Alix', value: 40, category: 'Mensuel', isDefault: true },
  { name: 'Electricité/Péage VOITURE', value: 80, category: 'Mensuel', isDefault: true },
  { name: 'École / Education', value: 250, category: 'Mensuel', isDefault: true },
  { name: 'Sport Accessoires', value: 30, category: 'Mensuel', isDefault: true },
  { name: 'Entretien Maison', value: 120, category: 'Mensuel', isDefault: true },
  { name: 'Cadeaux', value: 100, category: 'Mensuel', isDefault: true },
  { name: 'Vétérinaire', value: 25, category: 'Mensuel', isDefault: true },
  { name: 'Santé', value: 50, category: 'Mensuel', isDefault: true },
  { name: 'Spectacles', value: 50, category: 'Mensuel', isDefault: true },
  { name: 'Vetements', value: 100, category: 'Mensuel', isDefault: true },
  { name: 'Coiffeur, Esthetique', value: 80, category: 'Mensuel', isDefault: true },
  { name: 'Enfants (loisirs, cadeaux, etc)', value: 50, category: 'Mensuel', isDefault: true },

  // Annuel - Cumulatif (ajoute les restes du mois précédent)
  { name: 'Vacances', value: 550, category: 'Annuel', isDefault: true },
  { name: 'Golf + Tennis Licence', value: 215, category: 'Annuel', isDefault: true },
  { name: 'Activités Ninon (Modelage et Badminton)', value: 50, category: 'Annuel', isDefault: true },
  { name: 'Dropbox', value: 10, category: 'Annuel', isDefault: true },
  { name: 'Amazon', value: 5.83, category: 'Annuel', isDefault: true },
  { name: 'Chaudiere', value: 14.57, category: 'Annuel', isDefault: true },

  // Épargne - Non cumulatif (remet à la valeur de référence)
  { name: 'Mensuel', value: 1075, category: 'Épargne', isDefault: true },
  { name: 'Annuel', value: 845.40, category: 'Épargne', isDefault: true }
]

// Calculs des totaux par catégorie
export const calculateTotalsByCategory = () => {
  const totals = {
    Courant: 0,
    Mensuel: 0,
    Annuel: 0,
    Épargne: 0
  }

  defaultReferenceBudgets.forEach(budget => {
    if (budget.category && totals.hasOwnProperty(budget.category)) {
      totals[budget.category as keyof typeof totals] = roundToTwo(totals[budget.category as keyof typeof totals] + budget.value)
    }
  })

  return totals
}

// Total général des budgets (hors épargne)
export const getTotalBudgetAmount = () => {
  const totals = calculateTotalsByCategory()
  return roundToTwo(totals.Courant + totals.Mensuel + (totals.Annuel / 12)) // Annuel divisé par 12 pour avoir le montant mensuel
}

// Total de l'épargne
export const getTotalSavingsAmount = () => {
  const totals = calculateTotalsByCategory()
  return roundToTwo(totals.Épargne)
} 