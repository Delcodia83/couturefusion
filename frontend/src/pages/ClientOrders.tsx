import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import useOrderStore, { Order, OrderStatus } from '../utils/orderStore';
import { OrderCard } from 'components/OrderCard';
import { DashboardActionButton } from 'components/DashboardActionButton';

export default function ClientOrders() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { orders, isLoading, error, fetchClientOrders, updateOrderStatus } = useOrderStore();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed' | 'all'>('all');
  
  useEffect(() => {
    if (user) {
      fetchClientOrders(user.uid);
    }
  }, [user]);
  
  // Filtrer les commandes selon l'onglet actif
  const getFilteredOrders = () => {
    if (activeTab === 'all') return orders;
    
    if (activeTab === 'pending') {
      return orders.filter(order => 
        order.status === OrderStatus.PENDING || 
        order.status === OrderStatus.CONFIRMED
      );
    }
    
    if (activeTab === 'active') {
      return orders.filter(order => 
        order.status === OrderStatus.PAID || 
        order.status === OrderStatus.IN_PROGRESS || 
        order.status === OrderStatus.READY ||
        order.status === OrderStatus.DELIVERED
      );
    }
    
    if (activeTab === 'completed') {
      return orders.filter(order => 
        order.status === OrderStatus.COMPLETED || 
        order.status === OrderStatus.CANCELLED || 
        order.status === OrderStatus.REFUNDED
      );
    }
    
    return orders;
  };
  
  // Gérer le changement de statut d'une commande
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Le statut de la commande a été mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut');
      console.error('Error updating order status:', error);
    }
  };
  
  // Créer une nouvelle commande
  const handleCreateOrder = () => {
    navigate('/orders/new');
  };
  
  const filteredOrders = getFilteredOrders();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Mes Commandes</h1>
          <DashboardActionButton onClick={handleCreateOrder} icon="Plus" label="Nouvelle commande" />
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">Toutes</TabsTrigger>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="active">En cours</TabsTrigger>
            <TabsTrigger value="completed">Terminées</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <Skeleton className="h-48" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full mt-4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    userRole="client" 
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Vous n'avez pas encore de commandes</p>
                <Button onClick={handleCreateOrder}>Créer une commande</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
