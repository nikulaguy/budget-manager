import { Budget, BankAccount, BudgetCategory, MonthlyBudgetHistory, AppData, Expense } from '../types/types';
import { getCurrentUser, SHARED_EMAILS } from './auth';
import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

const STORAGE_KEY = 'budgetManagerData';
const REFERENCE_BUDGETS_KEY = 'referenceBudgets';

const getStorageKeyForUser = (email: string): string => {
  // Les utilisateurs qui partagent les données utilisent la même clé
  if (SHARED_EMAILS.includes(email)) {
    return `${STORAGE_KEY}_shared`;
  }
  return `${STORAGE_KEY}_${email}`;
};

const getReferenceStorageKey = (email: string): string => {
  // Les utilisateurs qui partagent les données utilisent la même clé
  if (SHARED_EMAILS.includes(email)) {
    return `${REFERENCE_BUDGETS_KEY}_shared`;
  }
  return `${REFERENCE_BUDGETS_KEY}_${email}`;
};

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  {
    id: 'vie-courante',
    name: 'Courant',
    description: 'Dépenses quotidiennes et régulières',
  },
  {
    id: 'mensuel',
    name: 'Mensuel',
    description: 'Dépenses mensuelles fixes et récurrentes',
  },
  {
    id: 'annuel',
    name: 'Annuel',
    description: 'Dépenses annuelles et abonnements',
  },
  {
    id: 'livret',
    name: 'Livret',
    description: 'Épargne mensuelle et annuelle',
  },
];

const DEFAULT_BUDGETS: Omit<Budget, 'id' | 'spent' | 'remaining'>[] = [
  // Courant
  { title: 'Alimentation Entretien', amount: 950, categoryId: 'vie-courante', bankAccountId: 'default' },
  { title: 'Anna', amount: 308.01, categoryId: 'vie-courante', bankAccountId: 'default' },
  { title: 'Clope', amount: 300, categoryId: 'vie-courante', bankAccountId: 'default' },
  { title: 'Argent de poche couple', amount: 100, categoryId: 'vie-courante', bankAccountId: 'default' },
  { title: 'Transport', amount: 100, categoryId: 'vie-courante', bankAccountId: 'default' },

  // Mensuel
  { title: 'Ecole Cantine Centre', amount: 100, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Cantine Alix', amount: 40, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Electricité/Péage VOITURE', amount: 80, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'École / Education', amount: 250, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Sport Accessoires', amount: 30, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Entretien Maison', amount: 120, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Cadeaux', amount: 100, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Vétérinaire', amount: 25, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Santé', amount: 50, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Spectacles', amount: 50, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Vetements', amount: 100, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Coiffeur, Esthetique', amount: 80, categoryId: 'mensuel', bankAccountId: 'default' },
  { title: 'Enfants (loisirs, cadeaux, etc)', amount: 50, categoryId: 'mensuel', bankAccountId: 'default' },

  // Annuel
  { title: 'Vacances', amount: 550, categoryId: 'annuel', bankAccountId: 'default' },
  { title: 'Golf + Tennis Licence', amount: 215, categoryId: 'annuel', bankAccountId: 'default' },
  { title: 'Activités Ninon (Modelage et Badminton)', amount: 50, categoryId: 'annuel', bankAccountId: 'default' },
  { title: 'Dropbox', amount: 10, categoryId: 'annuel', bankAccountId: 'default' },
  { title: 'Amazon', amount: 5.83, categoryId: 'annuel', bankAccountId: 'default' },
  { title: 'Chaudiere', amount: 14.57, categoryId: 'annuel', bankAccountId: 'default' },

  // Livret
  { title: 'Mensuel', amount: 1075, categoryId: 'livret', bankAccountId: 'default' },
  { title: 'Annuel', amount: 845.40, categoryId: 'livret', bankAccountId: 'default' },
];

const DEFAULT_BANK_ACCOUNT: BankAccount = {
  id: 'default',
  name: 'Compte principal',
  isDefault: true,
};

const getInitialData = (): AppData => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  // Créer les budgets avec les IDs et les valeurs initiales
  const budgets = DEFAULT_BUDGETS.map(budget => ({
    ...budget,
    id: crypto.randomUUID(),
    spent: 0,
    remaining: budget.amount,
  }));

  // Vérifier si des budgets de référence existent déjà
  const existingReferenceBudgets = getReferenceBudgets();
  if (!existingReferenceBudgets) {
    // Sauvegarder les budgets comme références seulement s'il n'y en a pas déjà
    saveReferenceBudgets(budgets);
  }

  return {
    currentPeriod: getCurrentPeriod(),
    budgets,
    bankAccounts: [DEFAULT_BANK_ACCOUNT],
    categories: DEFAULT_CATEGORIES,
    history: [],
  };
};

export const loadData = async (): Promise<AppData> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const storageKey = getStorageKeyForUser(currentUser);
  const docRef = doc(db, 'budgets', storageKey);
  
  try {
    // Force a server refresh
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      const initialData = getInitialData();
      await saveData(initialData);
      return initialData;
    }

    const data = docSnap.data() as AppData;
    
    // Ensure history array exists
    if (!data.history) {
      data.history = [];
    }
    
    // Ensure current period is set
    if (!data.currentPeriod) {
      const now = new Date();
      data.currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    throw error;
  }
};

export const saveData = async (data: AppData): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const storageKey = getStorageKeyForUser(currentUser);
  const docRef = doc(db, 'budgets', storageKey);
  await setDoc(docRef, data);
};

export const getCurrentPeriod = (): string => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export const getNextPeriod = (currentPeriod: string): string => {
  const [year, month] = currentPeriod.split('-').map(Number);
  if (month === 12) {
    return `${year + 1}-01`;
  }
  return `${year}-${String(month + 1).padStart(2, '0')}`;
};

export const addBankAccount = async (name: string): Promise<AppData> => {
  const data = await loadData();
  const newAccount: BankAccount = {
    id: crypto.randomUUID(),
    name,
    isDefault: data.bankAccounts.length === 0,
  };
  data.bankAccounts.push(newAccount);
  await saveData(data);
  return data;
};

export const setDefaultBankAccount = async (accountId: string): Promise<AppData> => {
  const data = await loadData();
  data.bankAccounts = data.bankAccounts.map((account: BankAccount) => ({
    ...account,
    isDefault: account.id === accountId,
  }));
  await saveData(data);
  return data;
};

export const addBudget = async (newBudget: Omit<Budget, 'id' | 'spent' | 'remaining'>): Promise<void> => {
  const data = await loadData();
  const budget: Budget = {
    ...newBudget,
    id: crypto.randomUUID(),
    spent: 0,
    remaining: Number(newBudget.amount),
  };
  data.budgets.push(budget);
  await saveData(data);
};

export const updateBudget = async (updatedBudget: Budget): Promise<void> => {
  const data = await loadData();
  console.log('updateBudget - avant:', {
    budgets: data.budgets,
    updatedBudget
  });

  const index = data.budgets.findIndex((b: Budget) => b.id === updatedBudget.id);
  if (index !== -1) {
    data.budgets[index] = updatedBudget;
    await saveData(data);
    console.log('updateBudget - après:', {
      budgets: data.budgets,
      updatedBudget
    });
  } else {
    console.error('updateBudget - budget non trouvé:', updatedBudget);
  }
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  const data = await loadData();
  data.budgets = data.budgets.filter((b: Budget) => b.id !== budgetId);
  await saveData(data);
};

export const addCategory = async (newCategory: Omit<BudgetCategory, 'id'>): Promise<void> => {
  const data = await loadData();
  const category: BudgetCategory = {
    ...newCategory,
    id: crypto.randomUUID(),
  };
  data.categories.push(category);
  await saveData(data);
};

export const addExpense = async (newExpense: Omit<Expense, 'id'>): Promise<AppData> => {
  const data = await loadData();
  const currentUser = getCurrentUser();
  const expense: Expense = {
    ...newExpense,
    id: crypto.randomUUID(),
    user: currentUser || undefined
  };
  
  // Trouver le budget correspondant
  const budget = data.budgets.find(b => b.id === expense.budgetId);
  if (!budget) {
    throw new Error('Budget not found');
  }

  // Mettre à jour le budget
  budget.spent += expense.amount;
  budget.remaining = budget.amount - budget.spent;

  // Ajouter la dépense à l'historique
  const currentPeriod = data.currentPeriod;
  const historyEntry = data.history.find(h => h.period === currentPeriod);
  if (historyEntry) {
    historyEntry.expenses.push(expense);
  } else {
    data.history.push({
      period: currentPeriod,
      budgets: JSON.parse(JSON.stringify(data.budgets)),
      expenses: [expense],
    });
  }

  await saveData(data);
  return data;
};

export const getHistoryForBudget = async (budgetId: string): Promise<Expense[]> => {
  const data = await loadData();
  const currentPeriod = data.currentPeriod;
  const periodHistory = data.history.find((h: MonthlyBudgetHistory) => h.period === currentPeriod);
  
  if (!periodHistory) return [];
  
  return periodHistory.expenses.filter((e: Expense) => e.budgetId === budgetId);
};

export const getReferenceBudgets = async (): Promise<Budget[]> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('getReferenceBudgets: Pas d\'utilisateur connecté');
    return [];
  }
  const storageKey = getReferenceStorageKey(currentUser);
  const docRef = doc(db, 'budgets', storageKey);
  const docSnap = await getDoc(docRef);
  console.log('getReferenceBudgets:', {
    currentUser,
    storageKey,
    budgets: docSnap.exists() ? docSnap.data() : []
  });
  return docSnap.exists() ? docSnap.data() as Budget[] : [];
};

export const saveReferenceBudgets = async (budgets: Budget[]): Promise<void> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    console.error('saveReferenceBudgets: Pas d\'utilisateur connecté');
    return;
  }
  const storageKey = getReferenceStorageKey(currentUser);
  console.log('saveReferenceBudgets:', {
    currentUser,
    storageKey,
    budgets
  });
  const docRef = doc(db, 'budgets', storageKey);
  await setDoc(docRef, budgets);
};

export const deleteHistory = async (period: string): Promise<AppData> => {
  const data = await loadData();
  data.history = data.history.filter((h: MonthlyBudgetHistory) => h.period !== period);
  await saveData(data);
  return data;
};

export const deleteAllHistory = async (): Promise<AppData> => {
  const data = await loadData();
  data.history = [];
  await saveData(data);
  return data;
};

export const advanceToNextPeriod = async (): Promise<AppData> => {
  const data = await loadData();
  const referenceBudgets = await getReferenceBudgets();
  
  // Mettre à jour la période
  data.currentPeriod = getNextPeriod(data.currentPeriod);
  
  // Pour chaque budget
  data.budgets.forEach((budget: Budget) => {
    // Trouver le budget de référence correspondant
    const reference = referenceBudgets.find(ref => ref.title === budget.title);
    
    if (reference) {
      // Si le budget a un solde positif, l'ajouter au nouveau montant
      const remainingPositive = Math.max(0, budget.remaining);
      budget.amount = reference.amount + remainingPositive;
      
      // Si le budget a un solde négatif, le soustraire du nouveau montant
      const remainingNegative = Math.min(0, budget.remaining);
      budget.amount += remainingNegative;
    }
    
    // Réinitialiser les dépenses
    budget.spent = 0;
    budget.remaining = budget.amount;
  });
  
  await saveData(data);
  return data;
};

export const getCurrentPeriodData = async (): Promise<{ currentPeriod: string; daysRemaining: number }> => {
  const data = await loadData();
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysRemaining = lastDayOfMonth - now.getDate();
  
  return {
    currentPeriod: data.currentPeriod,
    daysRemaining,
  };
};

export const resetData = async (): Promise<AppData> => {
  const initialData = getInitialData();
  await saveData(initialData);
  return initialData;
};

export const updateCategory = async (category: BudgetCategory): Promise<AppData> => {
  const data = await loadData();
  const index = data.categories.findIndex((c: BudgetCategory) => c.id === category.id);
  if (index !== -1) {
    data.categories[index] = category;
    await saveData(data);
  }
  return data;
};

export const deleteCategory = async (categoryId: string): Promise<AppData> => {
  const data = await loadData();
  const index = data.categories.findIndex((c: BudgetCategory) => c.id === categoryId);
  if (index !== -1 && categoryId !== 'general') {
    // Mettre à jour les budgets de cette catégorie vers la catégorie générale
    data.budgets.forEach((budget: Budget) => {
      if (budget.categoryId === categoryId) {
        budget.categoryId = 'general';
      }
    });
    data.categories.splice(index, 1);
    await saveData(data);
  }
  return data;
};

export const resetBudgetExpenses = async (budgetId: string): Promise<AppData> => {
  const data = await loadData();
  const currentPeriod = data.currentPeriod;
  console.log('resetBudgetExpenses - avant:', {
    budgetId,
    currentPeriod,
    history: data.history
  });

  // Trouver l'entrée d'historique pour la période actuelle
  const historyEntry = data.history.find((h: MonthlyBudgetHistory) => h.period === currentPeriod);
  if (historyEntry) {
    // Supprimer toutes les dépenses pour ce budget
    historyEntry.expenses = historyEntry.expenses.filter((e: Expense) => e.budgetId !== budgetId);
  }

  console.log('resetBudgetExpenses - après:', {
    budgetId,
    currentPeriod,
    history: data.history
  });

  await saveData(data);
  return data;
};

export const deleteExpense = async (expenseId: string, period: string): Promise<AppData> => {
  const data = await loadData();

  // Trouver l'entrée d'historique pour la période spécifiée
  const historyEntry = data.history.find(h => h.period === period);
  if (historyEntry) {
    // Trouver la dépense
    const expense = historyEntry.expenses.find(e => e.id === expenseId);
    if (expense) {
      // Mettre à jour le budget correspondant
      const budget = data.budgets.find(b => b.id === expense.budgetId);
      if (budget) {
        budget.spent -= expense.amount;
        budget.remaining = budget.amount - budget.spent;
      }

      // Supprimer la dépense de l'historique
      historyEntry.expenses = historyEntry.expenses.filter(e => e.id !== expenseId);
    }
  }

  await saveData(data);
  return data;
};

export const forceDataRefresh = async (): Promise<AppData> => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    throw new Error('No user logged in');
  }

  const storageKey = getStorageKeyForUser(currentUser);
  const docRef = doc(db, 'budgets', storageKey);
  
  try {
    // Get fresh data from server with cache-busting
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('No data found');
    }
    
    const data = docSnap.data() as AppData;
    
    // Ensure history array exists
    if (!data.history) {
      data.history = [];
    }
    
    // Ensure current period is set
    if (!data.currentPeriod) {
      const now = new Date();
      data.currentPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    return data;
  } catch (error) {
    console.error('Error forcing data refresh:', error);
    throw error;
  }
}; 