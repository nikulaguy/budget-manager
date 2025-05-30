import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth, handleNetworkReconnection } from './firebase';

const CURRENT_USER_KEY = 'budget_manager_current_user';

export const AUTHORIZED_EMAILS = [
  'romain.troalen@gmail.com',
  'guillaume.marion.perso@gmail.com',
  'remi.roux@gmail.com',
  'alix.troalen@gmail.com',
  'nikuland@gmail.com',
];

// Les utilisateurs qui partagent la même base de données
export const SHARED_EMAILS = ['nikuland@gmail.com', 'alix.troalen@gmail.com'];

let currentUser: User | null = null;

// Configuration
const AUTH_TIMEOUT = 10000; // 10 seconds timeout
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed in auth.ts:', user ? `User ${user.email} logged in` : 'No user');
  currentUser = user;
});

export const setCurrentUser = async (email: string): Promise<void> => {
  if (AUTHORIZED_EMAILS.includes(email)) {
    // Mot de passe temporaire pour la démo
    const password = 'password123';
    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem(CURRENT_USER_KEY, email);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw new Error('Erreur de connexion');
    }
  } else {
    throw new Error('Email non autorisé');
  }
};

export const getCurrentUser = (): string | null => {
  return currentUser?.email || null;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const loginWithRetry = async (email: string, password: string, retryCount = 0): Promise<any> => {
  try {
    // Try to reconnect before login attempt
    if (retryCount > 0) {
      console.log('Attempting network reconnection before retry...');
      await handleNetworkReconnection();
    }

    const loginPromise = signInWithEmailAndPassword(auth, email, password);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), AUTH_TIMEOUT);
    });

    return await Promise.race([loginPromise, timeoutPromise]);
  } catch (error: any) {
    console.error(`Login attempt ${retryCount + 1} failed:`, error);

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying login (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
      await delay(RETRY_DELAY * (retryCount + 1));
      return loginWithRetry(email, password, retryCount + 1);
    }

    throw error;
  }
};

export const login = async (email: string): Promise<void> => {
  if (!AUTHORIZED_EMAILS.includes(email)) {
    throw new Error('Email non autorisé');
  }

  console.log('Starting login process for:', email);
  
  try {
    // Try network reconnection before first login attempt
    await handleNetworkReconnection();
    
    const userCredential = await loginWithRetry(email, 'password123');
    console.log('Login successful:', userCredential.user.email);
    currentUser = userCredential.user;
  } catch (error: any) {
    console.error('Final login error:', error);
    
    if (error.message === 'TIMEOUT') {
      throw new Error('La connexion prend trop de temps. Veuillez réessayer.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Problème de connexion réseau. Vérifiez votre connexion internet.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Trop de tentatives de connexion. Veuillez réessayer plus tard.');
    } else {
      throw new Error(`Erreur de connexion: ${error.message}`);
    }
  }
};

export const logout = async (): Promise<void> => {
  console.log('Starting logout process');
  try {
    const logoutPromise = signOut(auth);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), AUTH_TIMEOUT);
    });

    await Promise.race([logoutPromise, timeoutPromise]);
    console.log('Logout successful');
    currentUser = null;
  } catch (error: any) {
    console.error('Logout error:', error);
    if (error.message === 'TIMEOUT') {
      throw new Error('La déconnexion prend trop de temps. Veuillez réessayer.');
    } else {
      throw new Error('Erreur lors de la déconnexion: ' + error.message);
    }
  }
}; 