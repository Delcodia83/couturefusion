import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile, UserRole, getCurrentUser, getUserProfile, loginUser, logoutUser, registerUser } from './firebaseAdapter';

interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, role: UserRole, displayName?: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      initialized: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const userProfile = await loginUser(email, password);
          set({ user: userProfile, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to login';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          await logoutUser();
          set({ user: null, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, role: UserRole, displayName) => {
        set({ isLoading: true, error: null });
        try {
          const userProfile = await registerUser(email, password, role, displayName);
          set({ user: userProfile, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to register';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      initializeAuth: async () => {
        if (get().initialized) return;
        
        set({ isLoading: true });
        try {
          const firebaseUser = await getCurrentUser();
          if (firebaseUser) {
            const userProfile = await getUserProfile(firebaseUser.uid);
            set({ user: userProfile, isLoading: false, initialized: true });
          } else {
            set({ user: null, isLoading: false, initialized: true });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: null, isLoading: false, initialized: true });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // Only persist the user
    }
  )
);

export default useAuthStore;