import { MonthlyBudget, Expense } from '../contexts/BudgetContext'
import { offlineStorage } from './offlineStorage'
import { githubStorage, AppData } from './githubStorage'
import { toastWithClose } from '../utils/toast'

interface SyncStatus {
  isOnline: boolean
  lastSynced: string | null
  pendingActions: number
}

class HybridSyncService {
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    lastSynced: null,
    pendingActions: 0
  }
  
  private syncTimeout: NodeJS.Timeout | null = null

  async init(): Promise<void> {
    await offlineStorage.init()
    
    // Écouter les changements de connectivité
    offlineStorage.onConnectivityChange(async (isOnline) => {
      this.syncStatus.isOnline = isOnline
      
      if (isOnline) {
        console.log('🌐 Connexion rétablie - synchronisation automatique...')
        // Attendre un peu puis synchroniser
        setTimeout(() => this.syncWithCloud(), 1000)
      }
    })

    console.log('🔄 Service de synchronisation hybride initialisé')
  }

  async saveData(budgets: MonthlyBudget[], expenses: Record<string, Expense[]>): Promise<void> {
    // Toujours sauvegarder localement en premier
    await offlineStorage.saveData({
      budgets,
      expenses,
      lastSynced: this.syncStatus.lastSynced || new Date().toISOString()
    })

    // Si en ligne, essayer de synchroniser avec GitHub (avec délai pour éviter les spam)
    if (this.syncStatus.isOnline) {
      this.debouncedSyncToCloud(budgets, expenses)
    } else {
      console.log('📱 Données sauvegardées localement (mode hors ligne)')
    }
  }

  private debouncedSyncToCloud(budgets: MonthlyBudget[], expenses: Record<string, Expense[]>): void {
    // Annuler le sync précédent si en attente
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout)
    }

    // Programmer un nouveau sync dans 2 secondes
    this.syncTimeout = setTimeout(async () => {
      try {
        await this.syncToGitHub(budgets, expenses)
        console.log('✅ Synchronisation automatique réussie')
      } catch (error) {
        console.warn('⚠️ Synchronisation automatique échouée:', error)
        // Ne pas afficher de toast d'erreur pour la sync automatique
      }
    }, 2000)
  }

  async loadData(): Promise<{ budgets: MonthlyBudget[], expenses: Record<string, Expense[]> } | null> {
    // Charger depuis le stockage local
    const localData = await offlineStorage.loadData()
    
    if (!localData) {
      return null
    }

    this.syncStatus.pendingActions = localData.pendingActions.length
    this.syncStatus.lastSynced = localData.lastSynced

    // Si en ligne, essayer de récupérer les données GitHub plus récentes
    if (this.syncStatus.isOnline) {
      try {
        const cloudData = await this.loadFromGitHub()
        
        if (cloudData && this.isCloudDataNewer(cloudData, localData)) {
          console.log('☁️ Données cloud plus récentes détectées - fusion automatique')
          
          // Sauvegarder les données cloud localement
          await offlineStorage.saveData({
            budgets: cloudData.budgets,
            expenses: cloudData.expenses,
            lastSynced: cloudData.lastUpdated
          })

          this.syncStatus.lastSynced = cloudData.lastUpdated
          
          return {
            budgets: cloudData.budgets,
            expenses: cloudData.expenses
          }
        }
      } catch (error) {
        console.warn('⚠️ Vérification cloud impossible, utilisation des données locales', error)
      }
    }

    return {
      budgets: localData.budgets,
      expenses: localData.expenses
    }
  }

  async addAction(type: string, data: any): Promise<void> {
    if (!this.syncStatus.isOnline) {
      // Mode hors ligne : ajouter à la queue
      await offlineStorage.addPendingAction({ type: type as any, data })
      this.syncStatus.pendingActions++
      
      console.log(`📝 Action ${type} ajoutée à la queue offline`)
    }
  }

  async syncWithCloud(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      console.log('📱 Pas de connexion - synchronisation reportée')
      return
    }

    try {
      const localData = await offlineStorage.loadData()
      if (!localData) return

      // Exécuter les actions en attente
      if (localData.pendingActions.length > 0) {
        console.log(`🔄 Synchronisation de ${localData.pendingActions.length} actions en attente...`)
        
        // Sauvegarder l'état actuel vers GitHub
        await this.syncToGitHub(localData.budgets, localData.expenses)
        
        // Vider la queue après synchronisation réussie
        await offlineStorage.clearPendingActions()
        this.syncStatus.pendingActions = 0
        
        console.log('✅ Synchronisation terminée')
      }
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error)
    }
  }

  private async syncToGitHub(budgets: MonthlyBudget[], expenses: Record<string, Expense[]>): Promise<void> {
    const data: AppData = {
      budgets,
      expenses,
      users: {},
      lastUpdated: new Date().toISOString()
    }

    const success = await githubStorage.saveData(data)
    if (success) {
      this.syncStatus.lastSynced = data.lastUpdated
    } else {
      throw new Error('Échec de la synchronisation GitHub')
    }
  }

  private async loadFromGitHub(): Promise<AppData | null> {
    return await githubStorage.loadData()
  }

  private isCloudDataNewer(cloudData: AppData, localData: any): boolean {
    if (!localData.lastSynced || !cloudData.lastUpdated) {
      return true // Si pas de timestamp, prendre les données cloud
    }

    const cloudTime = new Date(cloudData.lastUpdated).getTime()
    const localTime = new Date(localData.lastSynced).getTime()

    return cloudTime > localTime
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus }
  }

  async forceSyncFromCloud(): Promise<boolean> {
    if (!this.syncStatus.isOnline) {
      return false
    }

    try {
      const cloudData = await this.loadFromGitHub()
      if (cloudData) {
        await offlineStorage.saveData({
          budgets: cloudData.budgets,
          expenses: cloudData.expenses,
          lastSynced: cloudData.lastUpdated
        })

        this.syncStatus.lastSynced = cloudData.lastUpdated
        return true
      }
      return false
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error)
      return false
    }
  }

  async forceSyncToCloud(budgets: MonthlyBudget[], expenses: Record<string, Expense[]>): Promise<boolean> {
    if (!this.syncStatus.isOnline) {
      return false
    }

    try {
      await this.syncToGitHub(budgets, expenses)
      return true
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation forcée:', error)
      return false
    }
  }
}

export const hybridSync = new HybridSyncService() 