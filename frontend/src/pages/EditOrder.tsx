import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { DatePicker } from 'components/DatePicker';
import { ChevronLeft, Info } from 'lucide-react';
import { toast } from 'sonner';
import useOrderStore, { Order, OrderStatus, UpdateOrderData } from '../utils/orderStore';
import useAppSettingsStore from '../utils/appSettingsStore';

export default function EditOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  
  const { settings } = useAppSettingsStore();
  const { fetchOrderById, updateOrderDetails, isLoading } = useOrderStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState<UpdateOrderData>({
    price: 0,
    estimatedCompletionDate: undefined,
    notes: ''
  });
  
  useEffect(() => {
    const loadOrder = async () => {
      if (!orderId || !user) return;
      
      try {
        const orderData = await fetchOrderById(orderId);
        
        if (!orderData) {
          toast.error("Cette commande n'existe pas");
          navigate('/orders');
          return;
        }
        
        // Vérifier que l'utilisateur est bien le tailleur associé à cette commande
        if (orderData.tailorId !== user.uid) {
          toast.error("Vous n'avez pas accès à cette commande");
          navigate('/orders');
          return;
        }
        
        setOrder(orderData);
        
        // Initialiser les données du formulaire
        setFormData({
          price: orderData.price,
          estimatedCompletionDate: orderData.estimatedCompletionDate,
          notes: orderData.notes || ''
        });
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error("Erreur lors du chargement de la commande");
      }
    };
    
    loadOrder();
  }, [orderId, user]);
  
  // Mettre à jour les données du formulaire
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!order) return;
    
    try {
      // Mettre à jour les détails de la commande
      await updateOrderDetails(order.id, formData);
      
      toast.success('Commande mise à jour avec succès');
      navigate(`/orders/${order.id}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      toast.error('Erreur lors de la mise à jour de la commande');
    }
  };
  
  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
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
          onClick={() => navigate(`/orders/${order.id}`)}
        >
          <ChevronLeft size={16} />
          Retour aux détails de la commande
        </Button>
        
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">
            Modifier la commande #{order.id.substring(order.id.lastIndexOf('_') + 1)}
          </h1>
          
          <form onSubmit={handleSubmit}>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Détails de la commande</CardTitle>
                <CardDescription>
                  Mettez à jour les détails de cette commande
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Prix (en {settings?.currency?.code || 'EUR'})</Label>
                  <div className="flex items-center">
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Prix"
                      value={formData.price !== undefined ? formData.price : ''}
                      onChange={(e) => updateFormData('price', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estimatedCompletionDate">Date de livraison estimée</Label>
                  <DatePicker
                    date={formData.estimatedCompletionDate}
                    setDate={(date) => updateFormData('estimatedCompletionDate', date)}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes internes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Notes internes (visibles uniquement par vous)"
                    rows={6}
                    value={formData.notes || ''}
                    onChange={(e) => updateFormData('notes', e.target.value)}
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-md flex items-start space-x-2">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-blue-700 text-sm">
                    <p>Pour modifier le statut de la commande, retournez à la page de détails et utilisez les boutons d'action.</p>
                    <p className="mt-1">Pour ajouter des fichiers, cette fonctionnalité sera disponible prochainement.</p>
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}