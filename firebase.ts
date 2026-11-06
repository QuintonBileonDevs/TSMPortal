
// Using compat versions to ensure named exports like initializeApp and getAuth are resolved correctly in this environment.
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Initialize Firebase with the provided configuration
const firebaseConfig = {
  apiKey: "AIzaSyAbDP0qb6wIa-hkqM4uPdMlIL1gIUgOkOI",
  authDomain: "tsm-portal-bw.firebaseapp.com",
  projectId: "tsm-portal-bw",
  storageBucket: "tsm-portal-bw.firebasestorage.app",
  messagingSenderId: "239627448265",
  appId: "1:239627448265:web:2f0bb68583e38ba4960218"
};

const app = firebase.initializeApp(firebaseConfig);
// Export compat auth and firestore instances to be used across the app
export const auth = app.auth();
export const db = app.firestore();
export { firebase };
