import { create } from 'zustand';
import { collection, doc, addDoc, updateDoc, getDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firebaseApp } from 'app';
import { getFirestore } from 'firebase/firestore';

const db = getFirestore(firebaseApp);

export interface CustomerConnection {
  id: string;
  clientId: string;
  tailorId: string;
  clientName: string;
  tailorName: string;
  clientEmail: string;
  tailorEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerConnectionInput {
  clientId: string;
  tailorId: string;
  clientName: string;
  tailorName: string;
  clientEmail: string;
  tailorEmail: string;
}

interface CustomerIdStoreState {
  connections: CustomerConnection[];
  pending: CustomerConnection[];
  accepted: CustomerConnection[];
  isLoading: boolean;
  error: Error | null;
  
  fetchConnections: (userId: string) => Promise<void>;
  createConnection: (data: CustomerConnectionInput) => Promise<string>;
  updateConnectionStatus: (connectionId: string, status: 'accepted' | 'rejected') => Promise<void>;
  checkConnectionExists: (clientId: string, tailorId: string) => Promise<boolean>;
}

const useCustomerIdStore = create<CustomerIdStoreState>((set, get) => ({
  connections: [],
  pending: [],
  accepted: [],
  isLoading: false,
  error: null,
  
  fetchConnections: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      // Récupérer les connexions où l'utilisateur est client ou tailleur
      const clientQuery = query(
        collection(db, 'customer_connections'),
        where('clientId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const tailorQuery = query(
        collection(db, 'customer_connections'),
        where('tailorId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const [clientSnapshot, tailorSnapshot] = await Promise.all([
        getDocs(clientQuery),
        getDocs(tailorQuery)
      ]);
      
      // Fusionner les résultats en évitant les doublons
      const connectionsMap = new Map<string, CustomerConnection>();
      
      const processSnapshot = (snapshot: any) => {
        snapshot.forEach((doc: any) => {
          const data = doc.data();
          connectionsMap.set(doc.id, {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as CustomerConnection);
        });
      };
      
      processSnapshot(clientSnapshot);
      processSnapshot(tailorSnapshot);
      
      const connections = Array.from(connectionsMap.values());
      const pending = connections.filter(c => c.status === 'pending');
      const accepted = connections.filter(c => c.status === 'accepted');
      
      set({ 
        connections,
        pending,
        accepted,
        isLoading: false 
      });
    } catch (err) {
      set({ error: err as Error, isLoading: false });
      console.error('Error fetching connections:', err);
    }
  },
  
  createConnection: async (data: CustomerConnectionInput) => {
    set({ isLoading: true, error: null });
    try {
      // Vérifier si la connexion existe déjà
      const existingConnection = await get().checkConnectionExists(data.clientId, data.tailorId);
      
      if (existingConnection) {
        throw new Error('Connection already exists between these users');
      }
      
      // Créer une nouvelle connexion avec le statut initial "en attente"
      const newConnection = {
        ...data,
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'customer_connections'), newConnection);
      const connectionId = docRef.id;
      
      // Rafraîchir la liste des connexions
      await get().fetchConnections(data.clientId);
      
      set({ isLoading: false });
      return connectionId;
    } catch (err) {
      set({ error: err as Error, isLoading: false });
      console.error('Error creating connection:', err);
      throw err;
    }
  },
  
  updateConnectionStatus: async (connectionId: string, status: 'accepted' | 'rejected') => {
    set({ isLoading: true, error: null });
    try {
      const connectionRef = doc(db, 'customer_connections', connectionId);
      
      await updateDoc(connectionRef, { 
        status, 
        updatedAt: new Date() 
      });
      
      // Mettre à jour la liste locale
      const updatedConnections = get().connections.map(connection => {
        if (connection.id === connectionId) {
          return { 
            ...connection, 
            status, 
            updatedAt: new Date() 
          };
        }
        return connection;
      });
      
      const pending = updatedConnections.filter(c => c.status === 'pending');
      const accepted = updatedConnections.filter(c => c.status === 'accepted');
      
      set({ 
        connections: updatedConnections,
        pending,
        accepted,
        isLoading: false 
      });
    } catch (err) {
      set({ error: err as Error, isLoading: false });
      console.error('Error updating connection status:', err);
    }
  },
  
  checkConnectionExists: async (clientId: string, tailorId: string) => {
    try {
      const connectionQuery = query(
        collection(db, 'customer_connections'),
        where('clientId', '==', clientId),
        where('tailorId', '==', tailorId)
      );
      
      const querySnapshot = await getDocs(connectionQuery);
      return !querySnapshot.empty;
    } catch (err) {
      console.error('Error checking connection existence:', err);
      return false;
    }
  }
}));

export default useCustomerIdStore;