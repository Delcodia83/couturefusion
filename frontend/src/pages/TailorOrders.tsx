import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, FileEdit } from 'lucide-react';
import { toast } from 'sonner';
import useOrderStore, { Order, OrderStatus } from '../utils/orderStore';
import { OrderCard } from 'components/OrderCard';

export default function TailorOrders() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { orders, isLoading, error, fetchTailorOrders, updateOrderStatus } = useOrderStore();
  
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  useEffect(() => {
    if (user) {
      fetchTailorOrders(user.uid);
    }
  }, [user]);
  
  // Filtrer les commandes selon l'onglet actif et la recherche
  const getFilteredOrders = () => {
    let filtered = orders;
    
    // Filtrer par onglet
    if (activeTab === 'pending') {
      filtered = filtered.filter(order => 
        order.status === OrderStatus.PENDING ||
        order.status === OrderStatus.CONFIRMED
      );
    } else if (activeTab === 'active') {
      filtered = filtered.filter(order => 
        order.status === OrderStatus.PAID ||
        order.status === OrderStatus.IN_PROGRESS || 
        order.status === OrderStatus.READY ||
        order.status === OrderStatus.DELIVERED
      );
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(order => 
        order.status === OrderStatus.COMPLETED || 
        order.status === OrderStatus.CANCELLED || 
        order.status === OrderStatus.REFUNDED
      );
    }
    
    // Filtrer par recherche si nécessaire
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.description.toLowerCase().includes(query) ||
        (order.clientNotes && order.clientNotes.toLowerCase().includes(query))
      );
    }
    
    return filtered;
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
  
  // Voir les détails d'une commande
  const handleViewOrderDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };
  
  const filteredOrders = getFilteredOrders();
  
  // Compter les commandes par statut
  const getPendingCount = () => orders.filter(o => o.status === OrderStatus.PENDING || o.status === OrderStatus.CONFIRMED).length;
  const getActiveCount = () => orders.filter(o => [OrderStatus.PAID, OrderStatus.IN_PROGRESS, OrderStatus.READY, OrderStatus.DELIVERED].includes(o.status)).length;
  const getCompletedCount = () => orders.filter(o => [OrderStatus.COMPLETED, OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(o.status)).length;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/orders/edit')} 
              variant="outline"
            >
              <FileEdit className="h-4 w-4 mr-2" />
              Éditer les prix
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Rechercher une commande..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="relative">
              Toutes
              <Badge className="ml-2 bg-gray-200 text-gray-800">{orders.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="relative">
              En attente
              <Badge className="ml-2 bg-yellow-100 text-yellow-800">{getPendingCount()}</Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="relative">
              En cours
              <Badge className="ml-2 bg-blue-100 text-blue-800">{getActiveCount()}</Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Terminées
              <Badge className="ml-2 bg-green-100 text-green-800">{getCompletedCount()}</Badge>
            </TabsTrigger>
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
                    userRole="tailor" 
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {searchQuery ? 
                    "Aucune commande ne correspond à votre recherche" : 
                    "Vous n'avez pas encore de commandes"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
