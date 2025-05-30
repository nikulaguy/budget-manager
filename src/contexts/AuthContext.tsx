import React, { createContext, useContext, useState } from 'react'
import { toast } from 'react-hot-toast'

import { User, AuthContextType } from '../types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Données des utilisateurs prédéfinis selon les spécifications
const predefinedUsers: Record<string, Omit<User, 'id' | 'createdAt' | 'updatedAt'>> = {
  'nikuland@gmail.com': {
    email: 'nikuland@gmail.com',
    firstName: 'Nicolas',
    lastName: 'Guy',
    role: 'masterMaitre'
  },
  'romain.troalen@gmail.com': {
    email: 'romain.troalen@gmail.com',
    firstName: 'Romain',
    lastName: 'Troalen',
    role: 'master'
  },
  'guillaume.marion.perso@gmail.com': {
    email: 'guillaume.marion.perso@gmail.com',
    firstName: 'Guillaume',
    lastName: 'Marion',
    role: 'master'
  },
  'remi.roux@gmail.com': {
    email: 'remi.roux@gmail.com',
    firstName: 'Rémi',
    lastName: 'Roux',
    role: 'master'
  },
  'alix.troalen@gmail.com': {
    email: 'alix.troalen@gmail.com',
    firstName: 'Alix',
    lastName: 'Guy',
    role: 'simple'
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async (email: string) => {
    try {
      setIsLoading(true)
      
      // Vérifier si l'utilisateur est autorisé
      if (!predefinedUsers[email]) {
        toast.error('Utilisateur non autorisé')
        setIsLoading(false)
        return
      }

      // Simuler une authentification en mode démo
      const predefinedUser = predefinedUsers[email]
      const mockUser: User = {
        id: 'demo-' + email,
        ...predefinedUser,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // Simuler un délai d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUser(mockUser)
      toast.success(`Bienvenue ${mockUser.firstName} ! (Mode démo)`)
      setIsLoading(false)
    } catch (err: any) {
      console.error('Erreur de connexion:', err)
      toast.error('Erreur de connexion')
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      toast.success('Déconnexion réussie')
    } catch (err) {
      console.error('Erreur de déconnexion:', err)
      toast.error('Erreur lors de la déconnexion')
    }
  }

  const value: AuthContextType = {
    user,
    loading: isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 