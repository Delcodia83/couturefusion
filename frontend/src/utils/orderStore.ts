import { create } from 'zustand';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { UserRole } from './firebase';

// Statuts possibles pour une commande
export enum OrderStatus {
  PENDING = 'pending',           // En attente de révision par le tailleur
  CONFIRMED = 'confirmed',       // Acceptée par le tailleur, en attente de paiement
  PAID = 'paid',                 // Payée par le client, en attente de début de travail
  IN_PROGRESS = 'in_progress',   // En cours de confection
  READY = 'ready',               // Prête pour livraison/collecte
  DELIVERED = 'delivered',       // Livrée au client
  COMPLETED = 'completed',       // Commande terminée et confirmée par le client
  CANCELLED = 'cancelled',       // Annulée
  REFUNDED = 'refunded'          // Remboursée
}

// Interface pour les mensurations nécessaires à la commande
export interface OrderMeasurements {
  chest?: number;
  waist?: number;
  hips?: number;
  shoulder?: number;
  sleeve?: number;
  inseam?: number;
  neck?: number;
  thigh?: number;
  height?: number;
  weight?: number;
  // Autres mensurations spécifiques peuvent être ajoutées
  [key: string]: number | undefined;
}

// Interface pour une commande
export interface Order {
  id: string;
  clientId: string;
  tailorId: string;
  designId?: string;     // Optionnel si la commande est basée sur un design existant
  status: OrderStatus;
  description: string;    // Description des besoins du client
  measurements: OrderMeasurements;
  price: number;
  downPayment?: number;   // Acompte versé
  estimatedCompletionDate?: Date;
  attachments?: string[]; // URLs des images/documents attachés
  notes?: string;         // Notes internes pour le tailleur
  clientNotes?: string;   // Communications client
  createdAt: Date;
  updatedAt: Date;
}

// Interface pour les données de création d'une commande
export interface CreateOrderData {
  clientId: string;
  tailorId: string;
  designId?: string;
  description: string;
  measurements: OrderMeasurements;
  attachments?: string[];
}

// Interface pour la mise à jour d'une commande
export interface UpdateOrderData {
  status?: OrderStatus;
  description?: string;
  measurements?: Partial<OrderMeasurements>;
  price?: number;
  downPayment?: number;
  estimatedCompletionDate?: Date;
  attachments?: string[];
  notes?: string;
  clientNotes?: string;
}

// Interface pour le state du store
interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  
  // Fonctions pour les clients
  fetchClientOrders: (clientId: string) => Promise<Order[]>;
  createOrder: (orderData: CreateOrderData) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateClientOrder: (orderId: string, updateData: UpdateOrderData) => Promise<Order>;
  
  // Fonctions pour les tailleurs
  fetchTailorOrders: (tailorId: string) => Promise<Order[]>;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => Promise<Order>;
  updateOrderDetails: (orderId: string, updateData: UpdateOrderData) => Promise<Order>;
  
  // Fonctions communes
  fetchOrderById: (orderId: string) => Promise<Order | null>;
  addAttachmentToOrder: (orderId: string, attachmentUrl: string) => Promise<Order>;
  removeAttachmentFromOrder: (orderId: string, attachmentUrl: string) => Promise<Order>;
}

// Convertir les champs Date en Timestamp pour Firestore
const orderToFirestore = (order: Order) => {
  return {
    ...order,
    createdAt: Timestamp.fromDate(order.createdAt),
    updatedAt: Timestamp.fromDate(order.updatedAt),
    estimatedCompletionDate: order.estimatedCompletionDate 
      ? Timestamp.fromDate(order.estimatedCompletionDate) 
      : null
  };
};

// Convertir les Timestamp de Firestore en Date
const firestoreToOrder = (data: any): Order => {
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
    estimatedCompletionDate: data.estimatedCompletionDate?.toDate() || undefined
  };
};

// Création du store Zustand
const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  
  // Fonctions pour les clients
  fetchClientOrders: async (clientId: string) => {
    set({ isLoading: true, error: null });
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('clientId', '==', clientId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = querySnapshot.docs.map(doc => firestoreToOrder(doc.data()));
      
      set({ orders: ordersData, isLoading: false });
      return ordersData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching client orders:', error);
      return [];
    }
  },
  
  createOrder: async (orderData: CreateOrderData) => {
    set({ isLoading: true, error: null });
    try {
      const timestamp = new Date();
      const orderId = `order_${timestamp.getTime()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newOrder: Order = {
        id: orderId,
        clientId: orderData.clientId,
        tailorId: orderData.tailorId,
        designId: orderData.designId,
        status: OrderStatus.PENDING,
        description: orderData.description,
        measurements: orderData.measurements,
        price: 0, // Sera défini par le tailleur
        attachments: orderData.attachments || [],
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      await setDoc(doc(db, 'orders', orderId), orderToFirestore(newOrder));
      
      set(state => ({
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder,
        isLoading: false
      }));
      
      return newOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create order';
      set({ error: errorMessage, isLoading: false });
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  cancelOrder: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = firestoreToOrder(orderDoc.data());
      
      // Vérifier que la commande est dans un état annulable
      const cancelableStatuses = [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED
      ];
      
      if (!cancelableStatuses.includes(orderData.status)) {
        throw new Error('Cette commande ne peut plus être annulée');
      }
      
      const updatedOrder = {
        ...orderData,
        status: OrderStatus.CANCELLED,
        updatedAt: new Date()
      };
      
      await updateDoc(orderRef, orderToFirestore(updatedOrder));
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to cancel order';
      set({ error: errorMessage, isLoading: false });
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
  
  updateClientOrder: async (orderId: string, updateData: UpdateOrderData) => {
    set({ isLoading: true, error: null });
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = firestoreToOrder(orderDoc.data());
      
      // Pour les clients, limiter les champs qu'ils peuvent mettre à jour
      const updatedOrder = {
        ...orderData,
        description: updateData.description || orderData.description,
        measurements: updateData.measurements ? 
          { ...orderData.measurements, ...updateData.measurements } : 
          orderData.measurements,
        clientNotes: updateData.clientNotes || orderData.clientNotes,
        updatedAt: new Date()
      };
      
      await updateDoc(orderRef, orderToFirestore(updatedOrder));
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
        isLoading: false
      }));
      
      return updatedOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating client order:', error);
      throw error;
    }
  },
  
  // Fonctions pour les tailleurs
  fetchTailorOrders: async (tailorId: string) => {
    set({ isLoading: true, error: null });
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('tailorId', '==', tailorId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(ordersQuery);
      const ordersData = querySnapshot.docs.map(doc => firestoreToOrder(doc.data()));
      
      set({ orders: ordersData, isLoading: false });
      return ordersData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch orders';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching tailor orders:', error);
      return [];
    }
  },
  
  updateOrderStatus: async (orderId: string, status: OrderStatus, notes?: string) => {
    set({ isLoading: true, error: null });
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = firestoreToOrder(orderDoc.data());
      
      const updatedOrder = {
        ...orderData,
        status,
        notes: notes ? (orderData.notes ? `${orderData.notes}\n${notes}` : notes) : orderData.notes,
        updatedAt: new Date()
      };
      
      await updateDoc(orderRef, orderToFirestore(updatedOrder));
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
        isLoading: false
      }));
      
      return updatedOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order status';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating order status:', error);
      throw error;
    }
  },
  
  updateOrderDetails: async (orderId: string, updateData: UpdateOrderData) => {
    set({ isLoading: true, error: null });
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = firestoreToOrder(orderDoc.data());
      
      const updatedOrder = {
        ...orderData,
        status: updateData.status || orderData.status,
        description: updateData.description || orderData.description,
        measurements: updateData.measurements ? 
          { ...orderData.measurements, ...updateData.measurements } : 
          orderData.measurements,
        price: updateData.price !== undefined ? updateData.price : orderData.price,
        downPayment: updateData.downPayment !== undefined ? updateData.downPayment : orderData.downPayment,
        estimatedCompletionDate: updateData.estimatedCompletionDate || orderData.estimatedCompletionDate,
        attachments: updateData.attachments || orderData.attachments,
        notes: updateData.notes || orderData.notes,
        clientNotes: updateData.clientNotes || orderData.clientNotes,
        updatedAt: new Date()
      };
      
      await updateDoc(orderRef, orderToFirestore(updatedOrder));
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
        isLoading: false
      }));
      
      return updatedOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update order details';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating order details:', error);
      throw error;
    }
  },
  
  // Fonctions communes
  fetchOrderById: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        set({ isLoading: false, error: 'Order not found' });
        return null;
      }
      
      const orderData = firestoreToOrder(orderDoc.data());
      
      set({ currentOrder: orderData, isLoading: false });
      return orderData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch order';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching order by ID:', error);
      return null;
    }
  },
  
  addAttachmentToOrder: async (orderId: string, attachmentUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = firestoreToOrder(orderDoc.data());
      
      const updatedAttachments = [...(orderData.attachments || []), attachmentUrl];
      
      const updatedOrder = {
        ...orderData,
        attachments: updatedAttachments,
        updatedAt: new Date()
      };
      
      await updateDoc(orderRef, orderToFirestore(updatedOrder));
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
        isLoading: false
      }));
      
      return updatedOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add attachment';
      set({ error: errorMessage, isLoading: false });
      console.error('Error adding attachment to order:', error);
      throw error;
    }
  },
  
  removeAttachmentFromOrder: async (orderId: string, attachmentUrl: string) => {
    set({ isLoading: true, error: null });
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const orderData = firestoreToOrder(orderDoc.data());
      
      const updatedAttachments = (orderData.attachments || []).filter(url => url !== attachmentUrl);
      
      const updatedOrder = {
        ...orderData,
        attachments: updatedAttachments,
        updatedAt: new Date()
      };
      
      await updateDoc(orderRef, orderToFirestore(updatedOrder));
      
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ),
        currentOrder: state.currentOrder?.id === orderId ? updatedOrder : state.currentOrder,
        isLoading: false
      }));
      
      return updatedOrder;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove attachment';
      set({ error: errorMessage, isLoading: false });
      console.error('Error removing attachment from order:', error);
      throw error;
    }
  }
}));

export default useOrderStore;