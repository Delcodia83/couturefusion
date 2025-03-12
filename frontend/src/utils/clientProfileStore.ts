import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseAdapter';

export interface MeasurementProfile {
  // Basic measurements
  chest: number | null;
  waist: number | null;
  hips: number | null;
  inseam: number | null;
  shoulder: number | null;
  sleeve: number | null;
  neck: number | null;
  
  // Additional measurements
  thigh: number | null;
  calf: number | null;
  ankle: number | null;
  frontWaistLength: number | null;
  backWaistLength: number | null;
  acrossFront: number | null;
  acrossBack: number | null;
  bustPoint: number | null;
  armhole: number | null;
  wrist: number | null;
  riseHeight: number | null;
}

export interface ClientProfile {
  uid: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  notes: string;
  preferredStyles: string[];
  measurements: MeasurementProfile;
  updatedAt: number;
}

const initialMeasurements: MeasurementProfile = {
  chest: null,
  waist: null,
  hips: null,
  inseam: null,
  shoulder: null,
  sleeve: null,
  neck: null,
  thigh: null,
  calf: null,
  ankle: null,
  frontWaistLength: null,
  backWaistLength: null,
  acrossFront: null,
  acrossBack: null,
  bustPoint: null,
  armhole: null,
  wrist: null,
  riseHeight: null,
};

interface ClientProfileState {
  profile: ClientProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  createProfile: (userId: string, profileData: Partial<ClientProfile>) => Promise<void>;
  updateProfile: (userId: string, profileData: Partial<ClientProfile>) => Promise<void>;
  updateMeasurements: (userId: string, measurements: Partial<MeasurementProfile>) => Promise<void>;
}

const useClientProfileStore = create<ClientProfileState>((set) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const docRef = doc(db, 'clientProfiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ profile: docSnap.data() as ClientProfile, isLoading: false });
      } else {
        // Profile doesn't exist yet
        set({ profile: null, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching client profile:', error);
    }
  },

  createProfile: async (userId: string, profileData: Partial<ClientProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const timestamp = Date.now();
      const newProfile: ClientProfile = {
        uid: userId,
        fullName: profileData.fullName || '',
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || '',
        notes: profileData.notes || '',
        preferredStyles: profileData.preferredStyles || [],
        measurements: profileData.measurements || initialMeasurements,
        updatedAt: timestamp,
      };

      await setDoc(doc(db, 'clientProfiles', userId), newProfile);
      set({ profile: newProfile, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      set({ error: errorMessage, isLoading: false });
      console.error('Error creating client profile:', error);
    }
  },

  updateProfile: async (userId: string, profileData: Partial<ClientProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const timestamp = Date.now();
      const updates = {
        ...profileData,
        updatedAt: timestamp,
      };

      await updateDoc(doc(db, 'clientProfiles', userId), updates);
      
      // Update local state
      const currentProfile = await getDoc(doc(db, 'clientProfiles', userId));
      if (currentProfile.exists()) {
        set({ profile: currentProfile.data() as ClientProfile, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating client profile:', error);
    }
  },

  updateMeasurements: async (userId: string, measurements: Partial<MeasurementProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const timestamp = Date.now();
      const profileRef = doc(db, 'clientProfiles', userId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        // Update existing profile
        const currentProfile = profileSnap.data() as ClientProfile;
        const updatedMeasurements = {
          ...currentProfile.measurements,
          ...measurements
        };
        
        await updateDoc(profileRef, {
          measurements: updatedMeasurements,
          updatedAt: timestamp
        });
        
        // Update local state
        set({
          profile: {
            ...currentProfile,
            measurements: updatedMeasurements,
            updatedAt: timestamp
          },
          isLoading: false
        });
      } else {
        // Create new profile with measurements
        const newProfile: ClientProfile = {
          uid: userId,
          fullName: '',
          phoneNumber: '',
          address: '',
          notes: '',
          preferredStyles: [],
          measurements: {
            ...initialMeasurements,
            ...measurements
          },
          updatedAt: timestamp
        };
        
        await setDoc(profileRef, newProfile);
        set({ profile: newProfile, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update measurements';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating measurements:', error);
    }
  },
}));

export default useClientProfileStore;