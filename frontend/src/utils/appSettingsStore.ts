import { create } from 'zustand';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface AppSettings {
  id: string;
  currency: {
    code: string;
    symbol: string;
    position: 'before' | 'after';
  };
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
  updatedAt: number;
  updatedBy: string;
}

const DEFAULT_SETTINGS: Omit<AppSettings, 'id' | 'updatedAt' | 'updatedBy'> = {
  currency: {
    code: 'EUR',
    symbol: '€',
    position: 'before',
  },
  companyName: 'CoutureFusion',
  contactEmail: 'contact@couturefusion.com',
  contactPhone: '+33 1 23 45 67 89',
  theme: {
    primaryColor: '#3b82f6',
    secondaryColor: '#6b7280',
  },
};

interface AppSettingsState {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (userId: string, settingsData: Partial<AppSettings>) => Promise<void>;
  formatCurrency: (amount: number) => string;
}

// Helper function to format currency according to settings
export const formatCurrency = (amount: number, settings?: AppSettings | null): string => {
  if (!settings) {
    // Default formatting if settings not available
    return `€${amount.toFixed(2)}`;
  }
  
  const { currency } = settings;
  const formattedAmount = amount.toFixed(2);
  
  return currency.position === 'before'
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount} ${currency.symbol}`;
};

const useAppSettingsStore = create<AppSettingsState>((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      // The settings document has a fixed ID 'app_settings'
      const docRef = doc(db, 'appSettings', 'app_settings');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ settings: docSnap.data() as AppSettings, isLoading: false });
      } else {
        // Settings don't exist yet, create them with defaults
        const timestamp = Date.now();
        let adminId = 'system'; // Valeur par défaut
        
        // Try to find an admin user
        try {
          const usersQuery = query(
            collection(db, 'users'),
            where('role', '==', 'admin'),
            limit(1)
          );
          const usersSnapshot = await getDocs(usersQuery);
          if (!usersSnapshot.empty) {
            const adminUser = usersSnapshot.docs[0].data();
            adminId = adminUser.uid;
          }
        } catch (err) {
          console.error('Error finding admin user:', err);
        }
        
        const newSettings: AppSettings = {
          id: 'app_settings',
          ...DEFAULT_SETTINGS,
          updatedAt: timestamp,
          updatedBy: adminId,
        };
        
        try {
          await setDoc(docRef, newSettings);
          set({ settings: newSettings, isLoading: false });
        } catch (err) {
          console.error('Error creating default settings:', err);
          set({ settings: null, isLoading: false });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch settings';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching app settings:', error);
    }
  },

  updateSettings: async (userId: string, settingsData: Partial<AppSettings>) => {
    set({ isLoading: true, error: null });
    try {
      const timestamp = Date.now();
      const settingsRef = doc(db, 'appSettings', 'app_settings');
      const docSnap = await getDoc(settingsRef);
      
      if (docSnap.exists()) {
        // Update existing settings
        const updates = {
          ...settingsData,
          updatedAt: timestamp,
          updatedBy: userId,
        };
        
        await updateDoc(settingsRef, updates);
      } else {
        // Create new settings document
        const newSettings: AppSettings = {
          id: 'app_settings',
          ...DEFAULT_SETTINGS,
          ...settingsData,
          updatedAt: timestamp,
          updatedBy: userId,
        };
        
        await setDoc(settingsRef, newSettings);
        set({ settings: newSettings, isLoading: false });
        return;
      }
      
      // Fetch updated settings
      const updatedDoc = await getDoc(settingsRef);
      if (updatedDoc.exists()) {
        set({ settings: updatedDoc.data() as AppSettings, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating app settings:', error);
    }
  },
  
  formatCurrency: (amount: number) => formatCurrency(amount, get().settings),
}));

export default useAppSettingsStore;
