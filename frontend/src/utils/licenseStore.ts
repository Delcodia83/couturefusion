import { create } from 'zustand';
import { collection, doc, addDoc, updateDoc, getDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firebaseApp } from 'app';
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(firebaseApp);

export enum LicenseType {
  FREE = 'free',
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export interface License {
  id: string;
  userId: string;
  type: LicenseType;
  features: string[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  paymentId?: string;
  amount: number;
  currency: string;
}

interface LicenseInput {
  userId: string;
  type: LicenseType;
  features: string[];
  startDate: Date;
  endDate: Date;
  amount: number;
  currency: string;
  paymentId?: string;
}

interface LicenseStoreState {
  licenses: License[];
  currentLicense: License | null;
  isLoading: boolean;
  error: Error | null;
  
  fetchLicenses: (userId: string) => Promise<void>;
  fetchActiveLicense: (userId: string) => Promise<License | null>;
  createLicense: (licenseData: LicenseInput) => Promise<string>;
  updateLicenseStatus: (licenseId: string, isActive: boolean) => Promise<void>;
}

const useLicenseStore = create<LicenseStoreState>((set, get) => ({
  licenses: [],
  currentLicense: null,
  isLoading: false,
  error: null,
  
  fetchLicenses: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const licensesQuery = query(
        collection(db, 'licenses'),
        where('userId', '==', userId),
        orderBy('startDate', 'desc')
      );
      
      const querySnapshot = await getDocs(licensesQuery);
      const licensesData: License[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        licensesData.push({
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
        } as License);
      });
      
      set({ licenses: licensesData, isLoading: false });
    } catch (err) {
      set({ error: err as Error, isLoading: false });
      console.error('Error fetching licenses:', err);
    }
  },
  
  fetchActiveLicense: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date();
      
      const licensesQuery = query(
        collection(db, 'licenses'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        where('endDate', '>=', now)
      );
      
      const querySnapshot = await getDocs(licensesQuery);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        const license: License = {
          id: doc.id,
          ...data,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
        } as License;
        
        set({ currentLicense: license, isLoading: false });
        return license;
      } else {
        // Par défaut, assigner une licence gratuite
        const freeLicense: License = {
          id: 'free',
          userId,
          type: LicenseType.FREE,
          features: ['basic_orders', 'profile_management'],
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 10)),
          isActive: true,
          amount: 0,
          currency: 'EUR'
        };
        
        set({ currentLicense: freeLicense, isLoading: false });
        return freeLicense;
      }
    } catch (err) {
      set({ error: err as Error, isLoading: false });
      console.error('Error fetching active license:', err);
      return null;
    }
  },
  
  createLicense: async (licenseData: LicenseInput) => {
    set({ isLoading: true, error: null });
    try {
      // Désactiver les licences actives existantes
      const activeLicensesQuery = query(
        collection(db, 'licenses'),
        where('userId', '==', licenseData.userId),
        where('isActive', '==', true)
      );
      
      const activeSnapshot = await getDocs(activeLicensesQuery);
      const updatePromises = activeSnapshot.docs.map(doc => 
        updateDoc(doc.ref, { isActive: false })
      );
      
      await Promise.all(updatePromises);
      
      // Créer la nouvelle licence
      const newLicense = {
        ...licenseData,
        isActive: true,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'licenses'), newLicense);
      const licenseId = docRef.id;
      
      // Rafraîchir la liste des licences
      await get().fetchLicenses(licenseData.userId);
      
      set({ isLoading: false });
      return licenseId;
    } catch (err) {
      set({ error: err as Error, isLoading: false });
      console.error('Error creating license:', err);
      throw err;
    }
  },
  
  updateLicenseStatus: async (licenseId: string, isActive: boolean) => {
    set({ isLoading: true, error: null });
    try {
      const licenseRef = doc(db, 'licenses', licenseId);
      await updateDoc(licenseRef, { isActive });
      
      // Mettre à jour l'état local
      if (get().currentLicense && get().currentLicense.id === licenseId) {
        const updatedLicense = {
          ...get().currentLicense,
          isActive
        };
        set({ currentLicense: updatedLicense });
      }
      
      // Mettre à jour la liste des licences
      const updatedLicenses = get().licenses.map(license => {
        if (license.id === licenseId) {
          return { ...license, isActive };
        }
        return license;
      });
      
      set({ licenses: updatedLicenses, isLoading: false });
    } catch (err) {
      set({ error: err as Error, isLoading: false });
      console.error('Error updating license status:', err);
    }
  }
}));

export default useLicenseStore;