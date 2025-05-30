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
      // D'abord, essayer de récupérer le fichier existant pour obtenir le SHA
      let sha: string | undefined
      
      try {
        const response = await this.makeRequest(
          `/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`
        )
        const existingData = await response.json()
        sha = existingData.sha
      } catch (error) {
        // Le fichier n'existe pas encore, on peut le créer
        console.log('Fichier de données non trouvé, création d\'un nouveau fichier')
      }

      const content = btoa(JSON.stringify(data, null, 2))
      
      const payload: any = {
        message: `Mise à jour des données - ${new Date().toISOString()}`,
        content,
      }

      if (sha) {
        payload.sha = sha
      }

      await this.makeRequest(
        `/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.dataPath}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload),
        }
      )

      return true
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données:', error)
      return false
    }
  }
}

// Configuration par défaut (à ajuster selon vos besoins)
const defaultConfig: GitHubConfig = {
  owner: 'nikulaguy', // Votre nom d'utilisateur GitHub
  repo: 'budget', // Nom du repository
  token: '', // À configurer via les variables d'environnement
  dataPath: 'data/app-data.json' // Chemin du fichier de données
}

// Instance singleton du service
export const githubStorage = new GitHubStorageService(defaultConfig)

// Fonction pour configurer le token (à appeler au démarrage de l'app)
export const configureGitHubToken = (token: string) => {
  defaultConfig.token = token
}

export type { AppData, GitHubConfig } 