import { MonthlyBudget, Expense } from '../contexts/BudgetContext'

interface QueuedAction {
  id: string
  type: 'ADD_EXPENSE' | 'DELETE_EXPENSE' | 'UPDATE_BUDGET' | 'RESET_BUDGET'
  data: any
  timestamp: number
}

interface AppDataOffline {
  budgets: MonthlyBudget[]
  expenses: Record<string, Expense[]>
  lastSynced: string
  pendingActions: QueuedAction[]
}

class OfflineStorage {
  private dbName = 'BudgetManagerDB'
  private dbVersion = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Store pour les données principales
        if (!db.objectStoreNames.contains('appData')) {
          db.createObjectStore('appData', { keyPath: 'id' })
        }
        
        // Store pour la queue d'actions hors ligne
        if (!db.objectStoreNames.contains('pendingActions')) {
          const store = db.createObjectStore('pendingActions', { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async saveData(data: Omit<AppDataOffline, 'pendingActions'>): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['appData'], 'readwrite')
    const store = transaction.objectStore('appData')
    
    await store.put({
      id: 'main',
      ...data,
      lastUpdated: new Date().toISOString()
    })
  }

  async loadData(): Promise<AppDataOffline | null> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['appData', 'pendingActions'], 'readonly')
    
    // Charger les données principales
    const appDataStore = transaction.objectStore('appData')
    const appDataRequest = appDataStore.get('main')
    
    // Charger les actions en attente
    const actionsStore = transaction.objectStore('pendingActions')
    const actionsRequest = actionsStore.getAll()
    
    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        const appData = appDataRequest.result
        const pendingActions = actionsRequest.result || []
        
        if (appData) {
          resolve({
            ...appData,
            pendingActions
          })
        } else {
          resolve(null)
        }
      }
    })
  }

  async addPendingAction(action: Omit<QueuedAction, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) await this.init()
    
    const queuedAction: QueuedAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now()
    }
    
    const transaction = this.db!.transaction(['pendingActions'], 'readwrite')
    const store = transaction.objectStore('pendingActions')
    
    await store.add(queuedAction)
    
    console.log('📝 Action ajoutée à la queue offline:', queuedAction.type)
  }

  async clearPendingActions(): Promise<void> {
    if (!this.db) await this.init()
    
    const transaction = this.db!.transaction(['pendingActions'], 'readwrite')
    const store = transaction.objectStore('pendingActions')
    
    await store.clear()
    console.log('✅ Queue d\'actions vidée')
  }

  async isOnline(): Promise<boolean> {
    return navigator.onLine
  }

  // Détecter les changements de connectivité
  onConnectivityChange(callback: (isOnline: boolean) => void): void {
    window.addEventListener('online', () => {
      console.log('🌐 Connexion rétablie')
      callback(true)
    })
    
    window.addEventListener('offline', () => {
      console.log('📱 Mode hors ligne activé')
      callback(false)
    })
  }
}

export const offlineStorage = new OfflineStorage() 