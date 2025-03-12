import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext, useCurrentUser } from 'app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, Calendar, User, DollarSign, MessageCircle, PaperclipIcon, Send, Upload } from 'lucide-react';
import { toast } from 'sonner';
import useOrderStore, { Order, OrderStatus } from '../utils/orderStore';
import { formatDate, formatCurrency } from '../utils/formatters';
import useAppSettingsStore from '../utils/appSettingsStore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { UserRole } from '../utils/firebase';

// Interface pour les données utilisateur récupérées
interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: UserRole;
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  
  const { settings } = useAppSettingsStore();
  const { fetchOrderById, currentOrder, updateOrderStatus, updateClientOrder, updateOrderDetails } = useOrderStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [clientData, setClientData] = useState<UserData | null>(null);
  const [tailorData, setTailorData] = useState<UserData | null>(null);
  const [newNote, setNewNote] = useState('');
  const [userRole, setUserRole] = useState<'client' | 'tailor'>('client');
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !user) return;
      
      setIsLoading(true);
      try {
        const orderData = await fetchOrderById(orderId);
        
        if (!orderData) {
          toast.error("Cette commande n'existe pas");
          navigate('/orders');
          return;
        }
        
        // Vérifier que l'utilisateur a le droit de voir cette commande
        if (orderData.clientId !== user.uid && orderData.tailorId !== user.uid) {
          toast.error("Vous n'avez pas accès à cette commande");
          navigate('/orders');
          return;
        }
        
        setOrder(orderData);
        
        // Déterminer le rôle de l'utilisateur pour cette commande
        if (orderData.clientId === user.uid) {
          setUserRole('client');
        } else {
          setUserRole('tailor');
        }
        
        // Charger les données du client et du tailleur
        await Promise.all([
          loadUserData(orderData.clientId, 'client'),
          loadUserData(orderData.tailorId, 'tailor')
        ]);
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error("Erreur lors du chargement de la commande");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadOrder();
  }, [orderId, user]);
  
  // Charger les données d'un utilisateur (client ou tailleur)
  const loadUserData = async (userId: string, role: 'client' | 'tailor') => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserData;
        
        if (role === 'client') {
          setClientData(userData);
        } else {
          setTailorData(userData);
        }
      }
    } catch (error) {
      console.error(`Error loading ${role} data:`, error);
    }
  };
  
  // Gérer le changement de statut
  const handleChangeStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    
    try {
      await updateOrderStatus(order.id, newStatus, `Statut mis à jour: ${getStatusLabel(newStatus)}`);
      
      // Mettre à jour l'ordre local
      const updatedOrder = await fetchOrderById(order.id);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
      
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };
  
  // Ajouter une note à la commande
  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return;
    
    try {
      if (userRole === 'client') {
        await updateClientOrder(order.id, {
          clientNotes: order.clientNotes ? `${order.clientNotes}\n\n${newNote}` : newNote
        });
      } else {
        await updateOrderDetails(order.id, {
          notes: order.notes ? `${order.notes}\n\n${newNote}` : newNote
        });
      }
      
      // Mettre à jour l'ordre local
      const updatedOrder = await fetchOrderById(order.id);
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
      
      setNewNote(''); // Réinitialiser le champ
      toast.success('Note ajoutée avec succès');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Erreur lors de l\'ajout de la note');
    }
  };
  
  // Obtenir le label pour un statut
  const getStatusLabel = (status: OrderStatus): string => {
    const statusMap = {
      [OrderStatus.PENDING]: 'En attente',
      [OrderStatus.CONFIRMED]: 'Confirmée',
      [OrderStatus.PAID]: 'Payée',
      [OrderStatus.IN_PROGRESS]: 'En cours',
      [OrderStatus.READY]: 'Prête',
      [OrderStatus.DELIVERED]: 'Livrée',
      [OrderStatus.COMPLETED]: 'Terminée',
      [OrderStatus.CANCELLED]: 'Annulée',
      [OrderStatus.REFUNDED]: 'Remboursée',
    };
    
    return statusMap[status] || 'Inconnu';
  };
  
  // Obtenir la classe de style pour un statut
  const getStatusClass = (status: OrderStatus): string => {
    const statusMap = {
      [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
      [OrderStatus.PAID]: 'bg-green-100 text-green-800',
      [OrderStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800',
      [OrderStatus.READY]: 'bg-indigo-100 text-indigo-800',
      [OrderStatus.DELIVERED]: 'bg-teal-100 text-teal-800',
      [OrderStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [OrderStatus.CANCELLED]: 'bg-gray-100 text-gray-800',
      [OrderStatus.REFUNDED]: 'bg-red-100 text-red-800',
    };
    
    return statusMap[status] || 'bg-gray-100 text-gray-500';
  };
  
  // Obtenir les actions disponibles pour l'utilisateur
  const getAvailableActions = () => {
    if (!order) return [];
    
    if (userRole === 'client') {
      // Actions disponibles pour le client
      switch (order.status) {
        case OrderStatus.PENDING:
          return [
            { label: 'Annuler', action: () => handleChangeStatus(OrderStatus.CANCELLED), variant: 'destructive' as const },
          ];
        case OrderStatus.CONFIRMED:
          return [
            { label: 'Payer', action: () => navigate(`/orders/${order.id}/payment`), variant: 'default' as const },
            { label: 'Annuler', action: () => handleChangeStatus(OrderStatus.CANCELLED), variant: 'destructive' as const },
          ];
        case OrderStatus.DELIVERED:
          return [
            { label: 'Confirmer réception', action: () => handleChangeStatus(OrderStatus.COMPLETED), variant: 'default' as const },
          ];
        default:
          return [];
      }
    } else {
      // Actions disponibles pour le tailleur
      switch (order.status) {
        case OrderStatus.PENDING:
          return [
            { label: 'Accepter', action: () => handleChangeStatus(OrderStatus.CONFIRMED), variant: 'default' as const },
            { label: 'Refuser', action: () => handleChangeStatus(OrderStatus.CANCELLED), variant: 'destructive' as const },
          ];
        case OrderStatus.CONFIRMED:
          return [
            { label: 'Marquer comme payée', action: () => handleChangeStatus(OrderStatus.PAID), variant: 'default' as const },
          ];
        case OrderStatus.PAID:
          return [
            { label: 'Commencer', action: () => handleChangeStatus(OrderStatus.IN_PROGRESS), variant: 'default' as const },
          ];
        case OrderStatus.IN_PROGRESS:
          return [
            { label: 'Marquer comme prête', action: () => handleChangeStatus(OrderStatus.READY), variant: 'default' as const },
          ];
        case OrderStatus.READY:
          return [
            { label: 'Marquer comme livrée', action: () => handleChangeStatus(OrderStatus.DELIVERED), variant: 'default' as const },
          ];
        default:
          return [];
      }
    }
  };
  
  const actions = getAvailableActions();
  
  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-1"
          onClick={() => navigate('/orders')}
        >
          <ChevronLeft size={16} />
          Retour aux commandes
        </Button>
        
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* En-tête et informations générales */}
          <div className="lg:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">
                  Commande #{order.id.substring(order.id.lastIndexOf('_') + 1)}
                </h1>
                <p className="text-gray-500">Créée le {formatDate(order.createdAt.getTime())}</p>
              </div>
              <Badge className={getStatusClass(order.status)}>
                {getStatusLabel(order.status)}
              </Badge>
            </div>
            
            <Card className="mb-6">
              <CardHeader className="pb-2">
                <CardTitle>Détails de la commande</CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Client</h3>
                      <div className="flex items-center mt-1">
                        <Avatar className="h-8 w-8 mr-2">
                          {clientData?.photoURL && <AvatarImage src={clientData.photoURL} />}
                          <AvatarFallback>{clientData?.displayName?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <span>{clientData?.displayName || 'Client'}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Tailleur</h3>
                      <div className="flex items-center mt-1">
                        <Avatar className="h-8 w-8 mr-2">
                          {tailorData?.photoURL && <AvatarImage src={tailorData.photoURL} />}
                          <AvatarFallback>{tailorData?.displayName?.charAt(0) || '?'}</AvatarFallback>
                        </Avatar>
                        <span>{tailorData?.displayName || 'Tailleur'}</span>
                      </div>
                    </div>
                    
                    {order.estimatedCompletionDate && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Date estimée</h3>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{formatDate(order.estimatedCompletionDate.getTime())}</span>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700">Prix</h3>
                      <div className="flex items-center mt-1">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{order.price ? formatCurrency(order.price, settings?.currency) : 'À définir'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Description</h3>
                    <p className="mt-1 whitespace-pre-wrap">{order.description}</p>
                  </div>
                  
                  {/* Mensurations */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Mensurations</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      {Object.entries(order.measurements).map(([key, value]) => (
                        <div key={key}>
                          <span className="text-sm text-gray-500 capitalize">{key}</span>: 
                          <span className="ml-1 font-medium">{value}cm</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Pièces jointes */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Pièces jointes</h3>
                    {order.attachments && order.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {order.attachments.map((url, index) => (
                          <a 
                            key={index} 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 p-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                          >
                            <PaperclipIcon className="h-4 w-4" />
                            <span className="text-sm">Pièce jointe {index + 1}</span>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500 italic">Aucune pièce jointe</p>
                        {(userRole === 'client' && [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) ||
                         (userRole === 'tailor') ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 flex items-center gap-1"
                            onClick={() => document.getElementById('attachment-upload')?.click()}
                          >
                            <Upload className="h-4 w-4" />
                            Ajouter une pièce jointe
                            <input 
                              id="attachment-upload" 
                              type="file" 
                              className="hidden" 
                              accept=".jpg,.jpeg,.png,.pdf"
                              onChange={(e) => {
                                // Cette fonctionnalité sera complétée avec le stockage Firebase
                                toast.success('Ajout de pièces jointes disponible dans la prochaine mise à jour');
                              }}
                            />
                          </Button>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Communications */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Communications</CardTitle>
              </CardHeader>
              
              <CardContent>
                <Tabs defaultValue="notes">
                  <TabsList className="mb-4">
                    <TabsTrigger value="notes">
                      {userRole === 'tailor' ? 'Notes internes' : 'Notes'}
                    </TabsTrigger>
                    <TabsTrigger value="client">
                      Communications client
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="notes" className="space-y-4">
                    {order.notes ? (
                      <div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-md border">
                        {order.notes}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Aucune note interne pour cette commande.</p>
                    )}
                    
                    {userRole === 'tailor' && (
                      <div className="mt-4">
                        <Textarea
                          placeholder="Ajouter une note interne..."
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          className="mb-2"
                          rows={3}
                        />
                        <Button 
                          onClick={handleAddNote}
                          disabled={!newNote.trim()}
                          className="flex items-center gap-1"
                        >
                          <Send size={16} />
                          Ajouter
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="client" className="space-y-4">
                    {order.clientNotes ? (
                      <div className="whitespace-pre-wrap p-4 bg-gray-50 rounded-md border">
                        {order.clientNotes}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">Aucune communication client pour cette commande.</p>
                    )}
                    
                    <div className="mt-4">
                      <Textarea
                        placeholder="Ajouter un message..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="mb-2"
                        rows={3}
                      />
                      <Button 
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="flex items-center gap-1"
                      >
                        <Send size={16} />
                        Envoyer
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Sidebar avec actions */}
          <div className="lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
                <CardDescription>
                  Gérez l'état de cette commande
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {userRole === 'tailor' && order.status === OrderStatus.PENDING && (
                    <div className="p-3 bg-amber-100 text-amber-800 rounded-md">
                      Cette commande est en attente de validation de votre part.
                    </div>
                  )}
                  
                  {userRole === 'client' && order.status === OrderStatus.CONFIRMED && (
                    <div className="p-3 bg-blue-100 text-blue-800 rounded-md">
                      Cette commande a été acceptée et est en attente de paiement.
                    </div>
                  )}
                  
                  {userRole === 'client' && order.status === OrderStatus.DELIVERED && (
                    <div className="p-3 bg-green-100 text-green-800 rounded-md">
                      Votre commande a été livrée. Veuillez confirmer la réception.
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex-col space-y-2">
                {actions.length > 0 ? (
                  <div className="space-y-2 w-full">
                    {actions.map((action, index) => (
                      <Button
                        key={index}
                        variant={action.variant}
                        className="w-full"
                        onClick={action.action}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 italic">
                    {[OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(order.status) ?
                      "Cette commande a été annulée." :
                      order.status === OrderStatus.COMPLETED ?
                        "Cette commande est terminée." :
                        "Aucune action disponible actuellement."
                    }
                  </p>
                )}
                
                {userRole === 'tailor' && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => navigate(`/orders/${order.id}/edit`)}
                  >
                    Modifier les détails
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
