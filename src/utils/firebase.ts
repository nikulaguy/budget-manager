import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  disableNetwork,
  enableNetwork
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDXVX1P8TV3yQoSf_YUWnYqkxZnhpHYkHE",
  authDomain: "budget-manager-f3c0f.firebaseapp.com",
  projectId: "budget-manager-f3c0f",
  storageBucket: "budget-manager-f3c0f.appspot.com",
  messagingSenderId: "897069161287",
  appId: "1:897069161287:web:9f9f9f9f9f9f9f9f9f9f9f"
};

console.log('Initializing Firebase...');

let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  throw new Error('Unable to initialize Firebase. Please check your configuration.');
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Function to handle network reconnection
const handleNetworkReconnection = async () => {
  try {
    await disableNetwork(db);
    console.log('Network disabled temporarily');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await enableNetwork(db);
    console.log('Network re-enabled');
  } catch (error) {
    console.error('Error during network reconnection:', error);
  }
};

// Enable offline persistence
enableIndexedDbPersistence(db)
  .then(() => {
    console.log('Firestore persistence enabled successfully');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    } else {
      console.error('Persistence error:', err);
      // Try to reconnect if there's a persistence error
      handleNetworkReconnection();
    }
  });

// Add auth state change listener with network handling
auth.onAuthStateChanged(
  (user) => {
    console.log('Auth state changed:', user ? `User ${user.email} logged in` : 'No user');
    if (user) {
      // Try to reconnect when user logs in
      handleNetworkReconnection();
    }
  },
  (error) => {
    console.error('Auth state change error:', error);
  }
);

export { db, auth, handleNetworkReconnection }; 