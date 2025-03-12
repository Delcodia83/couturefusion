import { OrderStatus } from './orderStore';

/**
 * Obtient le libellé français pour un statut de commande
 */
export function getOrderStatusLabel(status: OrderStatus): string {
  const statusLabels: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'En attente',
    [OrderStatus.CONFIRMED]: 'Confirmée',
    [OrderStatus.PAID]: 'Payée',
    [OrderStatus.IN_PROGRESS]: 'En cours',
    [OrderStatus.READY]: 'Prête',
    [OrderStatus.DELIVERED]: 'Livrée',
    [OrderStatus.COMPLETED]: 'Terminée',
    [OrderStatus.CANCELLED]: 'Annulée',
    [OrderStatus.REFUNDED]: 'Remboursée'
  };
  
  return statusLabels[status] || 'Statut inconnu';
}

/**
 * Obtient la classe de couleur pour un badge de statut
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const statusColors: Record<OrderStatus, string> = {
    [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    [OrderStatus.PAID]: 'bg-green-100 text-green-800 hover:bg-green-200',
    [OrderStatus.IN_PROGRESS]: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
    [OrderStatus.READY]: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    [OrderStatus.DELIVERED]: 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
    [OrderStatus.COMPLETED]: 'bg-teal-100 text-teal-800 hover:bg-teal-200',
    [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    [OrderStatus.REFUNDED]: 'bg-red-100 text-red-800 hover:bg-red-200'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Détermine les actions disponibles pour un statut de commande donné
 * @param status - Le statut actuel de la commande
 * @param userRole - Le rôle de l'utilisateur ('client' ou 'tailor')
 */
export function getAvailableActions(status: OrderStatus, userRole: 'client' | 'tailor'): string[] {
  if (userRole === 'client') {
    switch (status) {
      case OrderStatus.PENDING:
        return ['cancel'];
      case OrderStatus.CONFIRMED:
        return ['pay', 'cancel'];
      case OrderStatus.READY:
        return ['confirm_receipt'];
      case OrderStatus.DELIVERED:
        return ['complete'];
      default:
        return [];
    }
  } else { // tailleur
    switch (status) {
      case OrderStatus.PENDING:
        return ['confirm', 'decline'];
      case OrderStatus.CONFIRMED:
        return ['start_work'];
      case OrderStatus.PAID:
        return ['start_work'];
      case OrderStatus.IN_PROGRESS:
        return ['mark_ready'];
      case OrderStatus.READY:
        return ['mark_delivered'];
      default:
        return [];
    }
  }
}

/**
 * Obtient le prochain statut pour une action donnée
 */
export function getNextStatus(action: string): OrderStatus | null {
  switch (action) {
    case 'confirm':
      return OrderStatus.CONFIRMED;
    case 'pay':
      return OrderStatus.PAID;
    case 'start_work':
      return OrderStatus.IN_PROGRESS;
    case 'mark_ready':
      return OrderStatus.READY;
    case 'mark_delivered':
      return OrderStatus.DELIVERED;
    case 'confirm_receipt':
      return OrderStatus.DELIVERED;
    case 'complete':
      return OrderStatus.COMPLETED;
    case 'cancel':
      return OrderStatus.CANCELLED;
    case 'decline':
      return OrderStatus.CANCELLED;
    default:
      return null;
  }
}

/**
 * Obtient le libellé pour un bouton d'action
 */
export function getActionButtonLabel(action: string): string {
  const actionLabels: Record<string, string> = {
    'confirm': 'Confirmer la commande',
    'pay': 'Effectuer le paiement',
    'start_work': 'Commencer le travail',
    'mark_ready': 'Marquer comme prête',
    'mark_delivered': 'Marquer comme livrée',
    'confirm_receipt': 'Confirmer la réception',
    'complete': 'Terminer la commande',
    'cancel': 'Annuler',
    'decline': 'Refuser'
  };
  
  return actionLabels[action] || action;
}