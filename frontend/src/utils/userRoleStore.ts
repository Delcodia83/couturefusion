import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from 'app';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

interface UserRoleState {
  role: UserRole | null;
  initialized: boolean;
  isLoading: boolean;
  initializeRole: () => Promise<void>;
}

export const useUserRoleStore = create<UserRoleState>()(
  persist(
    (set, get) => ({
      role: null,
      initialized: false,
      isLoading: false,

      initializeRole: async () => {
        if (get().initialized) return;
        
        set({ isLoading: true });
        
        try {
          const user = await new Promise<any>((resolve) => {
            const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
              unsubscribe();
              resolve(currentUser);
            });
          });
          
          if (!user) {
            set({ role: null, isLoading: false, initialized: true });
            return;
          }
          
          // Get user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            set({ 
              role: userData.role as UserRole, 
              isLoading: false, 
              initialized: true 
            });
          } else {
            set({ role: null, isLoading: false, initialized: true });
          }
        } catch (error) {
          console.error('Error initializing user role:', error);
          set({ role: null, isLoading: false, initialized: true });
        }
      },
    }),
    {
      name: 'user-role-storage',
      partialize: (state) => ({ role: state.role }), // Only persist the role
    }
  )
);
