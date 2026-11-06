
// Using compat versions to ensure named exports like initializeApp and getAuth are resolved correctly in this environment.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Initialize Firebase configuration loaded securely from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'tsm-portal-bw.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'tsm-portal-bw',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'tsm-portal-bw.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '239627448265',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:239627448265:web:2f0bb68583e38ba4960218'
};

const app = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
// Export compat auth and firestore instances to be used across the app
export const auth = app.auth();
export const db = app.firestore();
export { firebase };
