import { create } from 'zustand';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from './firebaseAdapter';

// Types for tailor profile
export interface TailorProfile {
  uid: string;
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  address: string;
  bio: string;
  specialties: string[];
  yearsOfExperience: number;
  profilePictureUrl?: string;
  licenseType: 'free' | 'basic' | 'premium';
  businessHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  updatedAt: number;
}

// Types for orders
export interface OrderItem {
  itemName: string;
  description: string;
  fabricType?: string;
  fabricColor?: string;
  quantity: number;
  price: number;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  READY_FOR_FITTING = 'ready_for_fitting',
  ALTERATIONS = 'alterations',
  COMPLETED = 'completed',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: string;
  tailorId: string;
  clientId: string;
  clientName: string;
  clientPhoneNumber?: string;
  items: OrderItem[];
  measurements?: Record<string, any>;
  status: OrderStatus;
  totalAmount: number;
  deposit?: number;
  balance?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  timeline: {
    status: OrderStatus;
    timestamp: number;
    note?: string;
  }[];
}

export interface Stats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
}

const initialBusinessHours = {
  monday: { open: '09:00', close: '17:00', closed: false },
  tuesday: { open: '09:00', close: '17:00', closed: false },
  wednesday: { open: '09:00', close: '17:00', closed: false },
  thursday: { open: '09:00', close: '17:00', closed: false },
  friday: { open: '09:00', close: '17:00', closed: false },
  saturday: { open: '09:00', close: '13:00', closed: false },
  sunday: { open: '09:00', close: '13:00', closed: true },
};

interface TailorProfileState {
  profile: TailorProfile | null;
  orders: Order[];
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  createProfile: (userId: string, profileData: Partial<TailorProfile>) => Promise<void>;
  updateProfile: (userId: string, profileData: Partial<TailorProfile>) => Promise<void>;
  fetchOrders: (userId: string, status?: OrderStatus) => Promise<void>;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => Promise<void>;
  fetchStats: (userId: string) => Promise<void>;
}

const useTailorProfileStore = create<TailorProfileState>((set, get) => ({
  profile: null,
  orders: [],
  stats: null,
  isLoading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const docRef = doc(db, 'tailorProfiles', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        set({ profile: docSnap.data() as TailorProfile, isLoading: false });
      } else {
        // Profile doesn't exist yet
        set({ profile: null, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching tailor profile:', error);
    }
  },

  createProfile: async (userId: string, profileData: Partial<TailorProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const timestamp = Date.now();
      const newProfile: TailorProfile = {
        uid: userId,
        businessName: profileData.businessName || '',
        ownerName: profileData.ownerName || '',
        phoneNumber: profileData.phoneNumber || '',
        address: profileData.address || '',
        bio: profileData.bio || '',
        specialties: profileData.specialties || [],
        yearsOfExperience: profileData.yearsOfExperience || 0,
        profilePictureUrl: profileData.profilePictureUrl,
        licenseType: profileData.licenseType || 'free',
        businessHours: profileData.businessHours || initialBusinessHours,
        updatedAt: timestamp,
      };

      await setDoc(doc(db, 'tailorProfiles', userId), newProfile);
      set({ profile: newProfile, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      set({ error: errorMessage, isLoading: false });
      console.error('Error creating tailor profile:', error);
    }
  },

  updateProfile: async (userId: string, profileData: Partial<TailorProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const timestamp = Date.now();
      const updates = {
        ...profileData,
        updatedAt: timestamp,
      };

      await updateDoc(doc(db, 'tailorProfiles', userId), updates);
      
      // Update local state
      const currentProfile = await getDoc(doc(db, 'tailorProfiles', userId));
      if (currentProfile.exists()) {
        set({ profile: currentProfile.data() as TailorProfile, isLoading: false });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating tailor profile:', error);
    }
  },

  fetchOrders: async (userId: string, status?: OrderStatus) => {
    set({ isLoading: true, error: null });
    try {
      // Simplifier la requête pour éviter les problèmes d'index composites
      const ordersQuery = query(
        collection(db, 'orders'),
        where('tailorId', '==', userId)
      );
      
      // Message d'information
      console.log('Récupération des commandes pour le tailleur:', userId);
      

      const querySnapshot = await getDocs(ordersQuery);
      const orders: Order[] = [];
      
      querySnapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as Order);
      });
      
      set({ orders, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching orders:', error);
    }
  },

  updateOrderStatus: async (orderId: string, newStatus: OrderStatus, note?: string) => {
    set({ isLoading: true, error: null });
    try {
      const timestamp = Date.now();
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (!orderSnap.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = orderSnap.data() as Order;
      
      // Add new status to timeline
      const timeline = [...orderData.timeline, {
        status: newStatus,
        timestamp,
        note
      }];
      
      await updateDoc(orderRef, {
        status: newStatus,
        timeline,
        updatedAt: timestamp
      });
      
      // Update local state
      const orders = get().orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus, timeline, updatedAt: timestamp }
          : order
      );
      
      set({ orders, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating order status:', error);
    }
  },

  fetchStats: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Get all orders for the tailor
      const ordersQuery = query(
        collection(db, 'orders'),
        where('tailorId', '==', userId)
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      let totalOrders = 0;
      let completedOrders = 0;
      let pendingOrders = 0;
      let totalRevenue = 0;
      let thisMonthRevenue = 0;
      
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      
      querySnapshot.forEach((doc) => {
        const orderData = doc.data() as Order;
        totalOrders++;
        
        if (orderData.status === OrderStatus.COMPLETED || orderData.status === OrderStatus.DELIVERED) {
          completedOrders++;
          totalRevenue += orderData.totalAmount;
          
          // Check if completed this month
          if (orderData.updatedAt >= startOfMonth) {
            thisMonthRevenue += orderData.totalAmount;
          }
        } else if (orderData.status !== OrderStatus.CANCELLED) {
          pendingOrders++;
        }
      });
      
      const stats: Stats = {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalRevenue,
        thisMonthRevenue
      };
      
      set({ stats, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching stats:', error);
    }
  },
}));

export default useTailorProfileStore;