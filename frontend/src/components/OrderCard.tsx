import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '../utils/formatters';
import { Order, OrderStatus } from '../utils/orderStore';
import useAppSettingsStore from '../utils/appSettingsStore';

interface Props {
  order: Order;
  userRole: 'client' | 'tailor';
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
}

export function OrderCard({ order, userRole, onStatusChange }: Props) {
  const navigate = useNavigate();
  const { settings } = useAppSettingsStore();
  
  // Traduction et style des statuts
  const getStatusInfo = (status: OrderStatus): { label: string; styleClass: string } => {
    const statusMap = {
      [OrderStatus.PENDING]: { 
        label: 'En attente', 
        styleClass: 'bg-yellow-100 text-yellow-800' 
      },
      [OrderStatus.CONFIRMED]: { 
        label: 'Confirmée', 
        styleClass: 'bg-blue-100 text-blue-800' 
      },
      [OrderStatus.PAID]: { 
        label: 'Payée', 
        styleClass: 'bg-green-100 text-green-800' 
      },
      [OrderStatus.IN_PROGRESS]: { 
        label: 'En cours', 
        styleClass: 'bg-purple-100 text-purple-800' 
      },
      [OrderStatus.READY]: { 
        label: 'Prête', 
        styleClass: 'bg-indigo-100 text-indigo-800' 
      },
      [OrderStatus.DELIVERED]: { 
        label: 'Livrée', 
        styleClass: 'bg-teal-100 text-teal-800' 
      },
      [OrderStatus.COMPLETED]: { 
        label: 'Terminée', 
        styleClass: 'bg-green-100 text-green-800' 
      },
      [OrderStatus.CANCELLED]: { 
        label: 'Annulée', 
        styleClass: 'bg-gray-100 text-gray-800' 
      },
      [OrderStatus.REFUNDED]: { 
        label: 'Remboursée', 
        styleClass: 'bg-red-100 text-red-800' 
      },
    };
    
    return statusMap[status] || { label: 'Inconnu', styleClass: 'bg-gray-100 text-gray-500' };
  };
  
  // Obtenir les informations de statut
  const statusInfo = getStatusInfo(order.status);
  
  // Déterminer les actions disponibles en fonction du rôle de l'utilisateur et du statut de la commande
  const getAvailableActions = () => {
    if (userRole === 'client') {
      // Actions disponibles pour le client
      switch (order.status) {
        case OrderStatus.PENDING:
          return [
            { label: 'Annuler', action: () => onStatusChange?.(order.id, OrderStatus.CANCELLED), variant: 'destructive' as const },
          ];
        case OrderStatus.CONFIRMED:
          return [
            { label: 'Payer', action: () => navigate(`/orders/${order.id}/payment`), variant: 'default' as const },
            { label: 'Annuler', action: () => onStatusChange?.(order.id, OrderStatus.CANCELLED), variant: 'destructive' as const },
          ];
        case OrderStatus.DELIVERED:
          return [
            { label: 'Confirmer réception', action: () => onStatusChange?.(order.id, OrderStatus.COMPLETED), variant: 'default' as const },
          ];
        default:
          return [];
      }
    } else {
      // Actions disponibles pour le tailleur
      switch (order.status) {
        case OrderStatus.PENDING:
          return [
            { label: 'Accepter', action: () => onStatusChange?.(order.id, OrderStatus.CONFIRMED), variant: 'default' as const },
            { label: 'Refuser', action: () => onStatusChange?.(order.id, OrderStatus.CANCELLED), variant: 'destructive' as const },
          ];
        case OrderStatus.CONFIRMED:
          return [
            { label: 'Marquer comme payée', action: () => onStatusChange?.(order.id, OrderStatus.PAID), variant: 'default' as const },
          ];
        case OrderStatus.PAID:
          return [
            { label: 'Commencer', action: () => onStatusChange?.(order.id, OrderStatus.IN_PROGRESS), variant: 'default' as const },
          ];
        case OrderStatus.IN_PROGRESS:
          return [
            { label: 'Marquer comme prête', action: () => onStatusChange?.(order.id, OrderStatus.READY), variant: 'default' as const },
          ];
        case OrderStatus.READY:
          return [
            { label: 'Marquer comme livrée', action: () => onStatusChange?.(order.id, OrderStatus.DELIVERED), variant: 'default' as const },
          ];
        default:
          return [];
      }
    }
  };
  
  const actions = getAvailableActions();
  
  // Fonction pour voir les détails de la commande
  const handleViewDetails = () => {
    navigate(`/orders/${order.id}`);
  };
  
  return (
    <Card className="overflow-hidden h-full transition-all duration-200 hover:shadow-md flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            Commande #{order.id.substring(order.id.lastIndexOf('_') + 1)}
          </CardTitle>
          <Badge className={statusInfo.styleClass}>
            {statusInfo.label}
          </Badge>
        </div>
        <p className="text-sm text-gray-500">
          Créée le {formatDate(order.createdAt.getTime())}
        </p>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Description</h3>
            <p className="text-sm line-clamp-2">{order.description}</p>
          </div>
          
          <div className="flex justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-700">Prix</h3>
              <p className="font-medium">
                {order.price ? formatCurrency(order.price, settings?.currency) : 'À définir'}
              </p>
            </div>
            
            {order.estimatedCompletionDate && (
              <div className="text-right">
                <h3 className="text-sm font-medium text-gray-700">Date de livraison estimée</h3>
                <p>{formatDate(order.estimatedCompletionDate.getTime())}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex flex-col space-y-2">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={handleViewDetails}
        >
          Voir les détails
        </Button>
        
        {actions.length > 0 && (
          <div className="flex gap-2 w-full">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                className="flex-1"
                onClick={action.action}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
