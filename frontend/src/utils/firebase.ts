// Ce fichier est maintenant un alias vers l'extension Firebase Auth
import { firebaseApp, firebaseAuth } from 'app';
import { getFirestore } from 'firebase/firestore';

// User roles
export enum UserRole {
  CLIENT = 'client',
  TAILOR = 'tailor',
  ADMIN = 'admin'
}

// Export les instances Firebase de l'extension
export const app = firebaseApp;
export const auth = firebaseAuth;
export const db = getFirestore(firebaseApp);

// Re-exporter toutes les fonctions de l'adaptateur pour la compatibilité
export * from './firebaseAdapter';
