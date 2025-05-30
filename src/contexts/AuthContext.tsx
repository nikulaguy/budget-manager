import React, { createContext, useContext, useState } from 'react'
import { toast } from 'react-hot-toast'
import { toastWithClose } from '../utils/toast'

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

// Interface pour les invitations d'utilisateurs
interface UserInvitation {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'master' | 'simple'
  invitedBy: string
  invitedAt: Date
  status: 'pending' | 'accepted' | 'expired'
}

// État global des invitations (simulé)
let userInvitations: UserInvitation[] = []

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const signIn = async (email: string) => {
    try {
      setIsLoading(true)
      
      // Vérifier si l'utilisateur est autorisé
      if (!predefinedUsers[email]) {
        toastWithClose.error('Utilisateur non autorisé')
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
      toastWithClose.success(`Bienvenue ${mockUser.firstName} ! (Mode démo)`)
      setIsLoading(false)
    } catch (err: any) {
      console.error('Erreur de connexion:', err)
      toastWithClose.error('Erreur de connexion')
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setUser(null)
      toastWithClose.success('Déconnexion réussie')
    } catch (err) {
      console.error('Erreur de déconnexion:', err)
      toastWithClose.error('Erreur lors de la déconnexion')
    }
  }

  // Fonction pour vérifier les permissions d'invitation
  const canInviteUsers = (userRole: string): boolean => {
    return userRole === 'masterMaitre' || userRole === 'master'
  }

  const canInviteMasters = (userRole: string): boolean => {
    return userRole === 'masterMaitre'
  }

  // Fonction pour inviter un utilisateur
  const inviteUser = async (invitation: {
    email: string
    firstName: string
    lastName: string
    role: 'master' | 'simple'
  }): Promise<boolean> => {
    try {
      if (!user) {
        toastWithClose.error('Vous devez être connecté pour inviter des utilisateurs')
        return false
      }

      // Vérifier les permissions
      if (!canInviteUsers(user.role)) {
        toastWithClose.error('Vous n\'avez pas les permissions pour inviter des utilisateurs')
        return false
      }

      if (invitation.role === 'master' && !canInviteMasters(user.role)) {
        toastWithClose.error('Seul le Master Maître peut inviter des comptes Master')
        return false
      }

      // Vérifier si l'utilisateur existe déjà
      if (predefinedUsers[invitation.email]) {
        toastWithClose.error('Cet utilisateur existe déjà dans l\'application')
        return false
      }

      // Vérifier si une invitation existe déjà
      const existingInvitation = userInvitations.find(
        inv => inv.email === invitation.email && inv.status === 'pending'
      )
      if (existingInvitation) {
        toastWithClose.error('Une invitation est déjà en cours pour cet email')
        return false
      }

      // Créer l'invitation
      const newInvitation: UserInvitation = {
        id: `inv-${Date.now()}`,
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        role: invitation.role,
        invitedBy: user.email,
        invitedAt: new Date(),
        status: 'pending'
      }

      userInvitations.push(newInvitation)

      // Simuler l'envoi d'email
      await new Promise(resolve => setTimeout(resolve, 1000))

      toastWithClose.success(`Invitation envoyée à ${invitation.email}`)
      return true
    } catch (err) {
      console.error('Erreur lors de l\'invitation:', err)
      toastWithClose.error('Erreur lors de l\'envoi de l\'invitation')
      return false
    }
  }

  // Fonction pour obtenir les invitations en cours (pour les admins)
  const getPendingInvitations = (): UserInvitation[] => {
    if (!user || !canInviteUsers(user.role)) {
      return []
    }
    return userInvitations.filter(inv => inv.status === 'pending')
  }

  // Fonction pour annuler une invitation
  const cancelInvitation = async (invitationId: string): Promise<boolean> => {
    try {
      if (!user || !canInviteUsers(user.role)) {
        toastWithClose.error('Permissions insuffisantes')
        return false
      }

      const invitationIndex = userInvitations.findIndex(inv => inv.id === invitationId)
      if (invitationIndex === -1) {
        toastWithClose.error('Invitation non trouvée')
        return false
      }

      userInvitations.splice(invitationIndex, 1)
      toastWithClose.success('Invitation annulée')
      return true
    } catch (err) {
      console.error('Erreur lors de l\'annulation:', err)
      toastWithClose.error('Erreur lors de l\'annulation de l\'invitation')
      return false
    }
  }

  const value: AuthContextType = {
    user,
    loading: isLoading,
    signIn,
    signOut,
    isAuthenticated: !!user,
    // Nouvelles fonctions d'invitation
    canInviteUsers: () => user ? canInviteUsers(user.role) : false,
    canInviteMasters: () => user ? canInviteMasters(user.role) : false,
    inviteUser,
    getPendingInvitations,
    cancelInvitation
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