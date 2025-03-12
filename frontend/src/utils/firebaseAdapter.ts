import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut, type User } from 'firebase/auth';
import { firebaseApp, firebaseAuth } from 'app';

// User roles - gardé de l'ancienne implémentation pour compatibilité
export enum UserRole {
  CLIENT = 'client',
  TAILOR = 'tailor',
  ADMIN = 'admin'
}

// User profile interface - gardé de l'ancienne implémentation pour compatibilité
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt: number;
  updatedAt: number;
}

// Utiliser l'instance Firestore de l'extension Firebase
export const db = getFirestore(firebaseApp);
// Utiliser l'authentification de l'extension Firebase
export const auth = firebaseAuth;

// Create a new user with email and password
export const registerUser = async (email: string, password: string, role: UserRole, displayName?: string): Promise<UserProfile> => {
  try {
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Create user profile in Firestore
    const timestamp = Date.now();
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      displayName: displayName || user.displayName || undefined,
      role,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    await setDoc(doc(db, 'users', user.uid), userProfile);
    
    return userProfile;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Login user with email and password
export const loginUser = async (email: string, password: string): Promise<UserProfile> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Get user profile from Firestore
    let userProfile = await getUserProfile(user.uid);
    
    // If profile doesn't exist, create a basic one
    if (!userProfile) {
      console.log('User profile not found, creating a new one');
      // Demander à l'utilisateur son rôle
      const roleChoice = window.confirm(
        'Your profile is incomplete. Are you a tailor? Click OK for tailor, Cancel for client.'
      );
      
      const role = roleChoice ? UserRole.TAILOR : UserRole.CLIENT;
      
      // Create a basic profile
      const timestamp = Date.now();
      userProfile = {
        uid: user.uid,
        email: user.email || email,
        displayName: user.displayName || email.split('@')[0],
        role,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Save the profile to Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      // Alert the user
      alert(`A basic profile has been created for you as a ${role}. Please complete your profile in the dashboard.`);
    }
    
    return userProfile;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Logout current user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};

// Get current user profile
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Get user profile from Firestore
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};