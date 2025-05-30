import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

// Configuration Firebase
// En production, ces valeurs devraient être dans des variables d'environnement
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "budget-manager-app.firebaseapp.com",
  projectId: "budget-manager-app",
  storageBucket: "budget-manager-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
}

// Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Initialiser l'authentification
export const auth = getAuth(app)

// Initialiser Firestore
export const db = getFirestore(app)

// Configuration pour le développement local
if (import.meta.env.DEV) {
  // Utiliser les émulateurs Firebase en développement
  try {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, 'localhost', 8080)
  } catch (error) {
    // Les émulateurs sont déjà connectés
    console.log('Firebase emulators already connected')
  }
}

export default app 