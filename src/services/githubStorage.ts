interface GitHubConfig {
  owner: string
  repo: string
  token: string
  dataPath: string
}

interface AppData {
  budgets: any[]
  expenses: Record<string, any[]>
  users: Record<string, any>
  lastUpdated: string
}

class GitHubStorageService {
  private config: GitHubConfig
  private apiBase = 'https://api.github.com'

  constructor(config: GitHubConfig) {
    this.config = config
  }

  private async makeRequest(url: string, options: RequestInit = {}) {
    const response = await fetch(`${this.apiBase}${url}`, {
      ...options,
      headers: {
        'Authorization': `token ${this.config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    return response
  }

  async loadData(): Promise<AppData | null> {
    try {
      const response = await this.makeRequest(
        `/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`
      )
      
      const data = await response.json()
      
      if (data.content) {
        const decodedContent = atob(data.content.replace(/\n/g, ''))
        return JSON.parse(decodedContent)
      }
      
      return null
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      return null
    }
  }

  async saveData(data: AppData): Promise<boolean> {
    try {
      console.log('🔄 Début de la sauvegarde GitHub...')
      
      // D'abord, essayer de récupérer le fichier existant pour obtenir le SHA
      let sha: string | undefined
      
      try {
        console.log('📖 Récupération du SHA existant...')
        const response = await this.makeRequest(
          `/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`
        )
        const existingData = await response.json()
        sha = existingData.sha
        console.log('✅ SHA récupéré:', sha)
      } catch (error) {
        // Le fichier n'existe pas encore, on peut le créer
        console.log('📝 Fichier de données non trouvé, création d\'un nouveau fichier')
      }

      console.log('📦 Préparation des données...')
      const content = btoa(JSON.stringify(data, null, 2))
      
      const payload: any = {
        message: `Mise à jour des données - ${new Date().toISOString()}`,
        content,
      }

      if (sha) {
        payload.sha = sha
      }

      console.log('📤 Envoi vers GitHub...')
      const saveResponse = await this.makeRequest(
        `/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      )

      console.log('✅ Sauvegarde GitHub réussie!')
      return true
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des données:', error)
      console.error('📊 Détails de l\'erreur:', {
        owner: this.config.owner,
        repo: this.config.repo,
        dataPath: this.config.dataPath,
        hasToken: !!this.config.token,
        tokenLength: this.config.token?.length
      })
      return false
    }
  }
}

// Configuration par défaut (à ajuster selon vos besoins)
const defaultConfig: GitHubConfig = {
  owner: 'nikulaguy', // Votre nom d'utilisateur GitHub
  repo: 'budget-data', // Nom du repository (modifiez si vous l'avez nommé différemment)
  token: '', // À configurer via les variables d'environnement ou directement dans BudgetContext
  dataPath: 'data/app-data.json' // Chemin du fichier de données
}

// Instance singleton du service
export const githubStorage = new GitHubStorageService(defaultConfig)

// Fonction pour configurer le token (à appeler au démarrage de l'app)
export const configureGitHubToken = (token: string) => {
  defaultConfig.token = token
}

export type { AppData, GitHubConfig } 