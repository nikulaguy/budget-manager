import React, { createContext, useContext, useEffect, useState } from 'react'
import { signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { toast } from 'react-hot-toast'

import { auth, db } from '../config/firebase'
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
  const [firebaseUser, loading, error] = useAuthState(auth)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User
            setUser(userData)
          } else {
            // Créer un utilisateur à partir des données prédéfinies
            const predefinedUser = predefinedUsers[firebaseUser.email!]
            if (predefinedUser) {
              const newUser: User = {
                id: firebaseUser.uid,
                ...predefinedUser,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              
              await setDoc(doc(db, 'users', firebaseUser.uid), newUser)
              setUser(newUser)
              toast.success(`Bienvenue ${newUser.firstName} !`)
            } else {
              toast.error('Utilisateur non autorisé')
              await firebaseSignOut(auth)
            }
          }
        } catch (err) {
          console.error('Erreur lors de la récupération des données utilisateur:', err)
          toast.error('Erreur lors de la connexion')
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    if (!loading) {
      fetchUserData()
    }
  }, [firebaseUser, loading])

  useEffect(() => {
    if (error) {
      console.error('Erreur d\'authentification:', error)
      toast.error('Erreur d\'authentification')
    }
  }, [error])

  const signIn = async (email: string) => {
    try {
      setIsLoading(true)
      
      // Vérifier si l'utilisateur est autorisé
      if (!predefinedUsers[email]) {
        toast.error('Utilisateur non autorisé')
        setIsLoading(false)
        return
      }

      // Pour la démonstration, nous utilisons un mot de passe par défaut
      // En production, il faudrait un système d'authentification plus robuste
      const password = 'defaultPassword123'
      
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: any) {
      console.error('Erreur de connexion:', err)
      
      if (err.code === 'auth/user-not-found') {
        toast.error('Utilisateur non trouvé')
      } else if (err.code === 'auth/wrong-password') {
        toast.error('Mot de passe incorrect')
      } else if (err.code === 'auth/invalid-email') {
        toast.error('Email invalide')
      } else {
        toast.error('Erreur de connexion')
      }
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
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