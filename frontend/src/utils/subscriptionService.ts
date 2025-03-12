import { firebaseApp } from 'app';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import brain from 'brain';

// Initialisation de Firestore
const db = getFirestore(firebaseApp);

// Types pour les abonnements
export type SubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  features: string[];
};

export type UserSubscription = {
  userId: string;
  planId: string;
  active: boolean;
  startDate: Date | null;
  expiryDate: Date | null;
  paymentId?: string;
  paymentStatus?: string;
  autoRenew?: boolean;
};

// Services pour les abonnements
export const subscriptionService = {
  // Récupérer tous les plans d'abonnement disponibles
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const response = await brain.get_subscription_plans();
      return response.json();
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      return [];
    }
  },

  // Initier un paiement pour un abonnement
  async createPayment(userId: string, planId: string, returnUrl?: string): Promise<{ paymentId: string, redirectUrl: string }> {
    try {
      const response = await brain.create_payment({
        user_id: userId,
        plan_id: planId,
        payment_method: 'paytech',
        return_url: returnUrl || window.location.origin + '/dashboard',
        cancel_url: window.location.origin + '/subscription'
      });
      
      const data = await response.json();
      
      // Enregistrer la demande de paiement dans Firestore
      await setDoc(doc(db, 'subscription_payments', data.payment_id), {
        userId,
        planId,
        status: 'pending',
        created: Timestamp.now(),
        paymentId: data.payment_id
      });
      
      return {
        paymentId: data.payment_id,
        redirectUrl: data.redirect_url
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  // Vérifier le statut d'un paiement
  async checkPaymentStatus(paymentId: string): Promise<{ status: string, planId?: string }> {
    try {
      // Vérifier dans Firestore
      const paymentRef = doc(db, 'subscription_payments', paymentId);
      const paymentDoc = await getDoc(paymentRef);
      
      if (paymentDoc.exists()) {
        const paymentData = paymentDoc.data();
        return {
          status: paymentData.status,
          planId: paymentData.planId
        };
      }
      
      return { status: 'unknown' };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return { status: 'error' };
    }
  },

  // Obtenir l'abonnement actuel d'un utilisateur
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', userId);
      const subscriptionDoc = await getDoc(subscriptionRef);
      
      if (subscriptionDoc.exists()) {
        const data = subscriptionDoc.data();
        return {
          userId,
          planId: data.planId,
          active: data.active,
          startDate: data.startDate?.toDate() || null,
          expiryDate: data.expiryDate?.toDate() || null,
          paymentId: data.paymentId,
          paymentStatus: data.paymentStatus,
          autoRenew: data.autoRenew || false
        };
      }
      
      // Si aucun abonnement trouvé, créer un abonnement gratuit par défaut
      const freeSubscription: UserSubscription = {
        userId,
        planId: 'free',
        active: true,
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
        paymentStatus: 'free'
      };
      
      await this.updateUserSubscription(freeSubscription);
      return freeSubscription;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  },

  // Mettre à jour l'abonnement d'un utilisateur
  async updateUserSubscription(subscription: UserSubscription): Promise<void> {
    try {
      const subscriptionRef = doc(db, 'subscriptions', subscription.userId);
      
      await setDoc(subscriptionRef, {
        planId: subscription.planId,
        active: subscription.active,
        startDate: subscription.startDate ? Timestamp.fromDate(subscription.startDate) : null,
        expiryDate: subscription.expiryDate ? Timestamp.fromDate(subscription.expiryDate) : null,
        paymentId: subscription.paymentId,
        paymentStatus: subscription.paymentStatus,
        autoRenew: subscription.autoRenew || false,
        updatedAt: Timestamp.now()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating user subscription:', error);
      throw error;
    }
  }
};

// Services pour la gestion des paiements des commandes (pour les tailleurs)
export type OrderPayment = {
  orderId: string;
  clientId: string;
  tailorId: string;
  paymentReceived: boolean;
  paymentAmount?: number;
  paymentDate?: Date;
  paymentNote?: string;
};

export const orderPaymentService = {
  // Mettre à jour le statut de paiement d'une commande
  async updateOrderPaymentStatus(payment: OrderPayment): Promise<boolean> {
    try {
      const response = await brain.update_order_payment_status({
        order_id: payment.orderId,
        client_id: payment.clientId,
        tailor_id: payment.tailorId,
        payment_received: payment.paymentReceived,
        payment_amount: payment.paymentAmount || 0,
        payment_note: payment.paymentNote
      });
      
      const result = await response.json();
      
      // Mettre à jour le document dans Firestore aussi
      const paymentRef = doc(db, 'order_payments', payment.orderId);
      await setDoc(paymentRef, {
        clientId: payment.clientId,
        tailorId: payment.tailorId,
        paymentReceived: payment.paymentReceived,
        paymentAmount: payment.paymentAmount,
        paymentDate: payment.paymentReceived ? Timestamp.now() : null,
        paymentNote: payment.paymentNote,
        updatedAt: Timestamp.now()
      }, { merge: true });
      
      // Mettre également à jour le statut dans la commande
      const orderRef = doc(db, 'orders', payment.orderId);
      await updateDoc(orderRef, {
        paymentStatus: payment.paymentReceived ? 'paid' : 'pending',
        updatedAt: Timestamp.now()
      });
      
      return result.status === 'success';
    } catch (error) {
      console.error('Error updating order payment status:', error);
      return false;
    }
  },

  // Obtenir le statut de paiement d'une commande
  async getOrderPaymentStatus(orderId: string, clientId: string, tailorId: string): Promise<OrderPayment | null> {
    try {
      // D'abord vérifier dans Firestore
      const paymentRef = doc(db, 'order_payments', orderId);
      const paymentDoc = await getDoc(paymentRef);
      
      if (paymentDoc.exists()) {
        const data = paymentDoc.data();
        return {
          orderId,
          clientId,
          tailorId,
          paymentReceived: data.paymentReceived || false,
          paymentAmount: data.paymentAmount,
          paymentDate: data.paymentDate?.toDate(),
          paymentNote: data.paymentNote
        };
      }
      
      // Si pas trouvé, vérifier via l'API et créer l'entrée
      const response = await brain.get_order_payment_status({
        order_id: orderId,
        client_id: clientId,
        tailor_id: tailorId
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        const payment: OrderPayment = {
          orderId,
          clientId,
          tailorId,
          paymentReceived: result.payment_received || false,
          paymentAmount: result.payment_amount,
          paymentDate: result.payment_date ? new Date(result.payment_date) : undefined,
          paymentNote: result.payment_note
        };
        
        // Sauvegarder dans Firestore
        await setDoc(paymentRef, {
          clientId,
          tailorId,
          paymentReceived: payment.paymentReceived,
          paymentAmount: payment.paymentAmount,
          paymentDate: payment.paymentDate ? Timestamp.fromDate(payment.paymentDate) : null,
          paymentNote: payment.paymentNote,
          createdAt: Timestamp.now()
        });
        
        return payment;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting order payment status:', error);
      return null;
    }
  }
};
