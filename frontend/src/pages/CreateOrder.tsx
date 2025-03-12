import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { toast } from 'sonner';
import useOrderStore, { CreateOrderData, OrderMeasurements } from '../utils/orderStore';
import { useForm } from 'react-hook-form';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';
import { UserRole } from '../utils/firebase';

// Interface pour les données des tailleurs
interface TailorData {
  uid: string;
  displayName: string;
  photoURL?: string;
  businessName?: string;
  specialization?: string[];
}

// Interface complète pour le formulaire
interface OrderFormData extends CreateOrderData {
  selectedTailor: string; // ID du tailleur sélectionné
}

export default function CreateOrder() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { createOrder, isLoading } = useOrderStore();
  
  const [tailors, setTailors] = useState<TailorData[]>([]);
  const [tailorsLoading, setTailorsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [formData, setFormData] = useState<OrderFormData>({
    clientId: user?.uid || '',
    tailorId: '',
    description: '',
    measurements: {},
    selectedTailor: ''
  });
  
  // Charger la liste des tailleurs
  useEffect(() => {
    const loadTailors = async () => {
      if (!user) return;
      
      setTailorsLoading(true);
      try {
        // Dans une application réelle, vous utiliseriez un endpoint pour obtenir les tailleurs disponibles
        // Ici, nous simulons une requête pour obtenir quelques tailleurs
        const tailorsCollection = await getDoc(doc(db, 'app_data', 'tailors'));
        
        if (tailorsCollection.exists()) {
          const tailorsData = tailorsCollection.data().tailors as TailorData[];
          setTailors(tailorsData);
        } else {
          console.log('Aucun tailleur trouvé dans la base de données');
          // Utiliser des données de test si aucun tailleur n'est trouvé
          setTailors([
            {
              uid: 'tailor1',
              displayName: 'Pierre Couture',
              businessName: 'Atelier Couture Paris',
              specialization: ['Costumes', 'Robes de soirée']
            },
            {
              uid: 'tailor2',
              displayName: 'Marie Tissier',
              businessName: 'Création sur Mesure',
              specialization: ['Tenues de cérémonie', 'Vêtements décontractés']
            },
            {
              uid: 'tailor3',
              displayName: 'Jean Tissu',
              businessName: 'Tissu d\'Or',
              specialization: ['Cuir', 'Denim', 'Articles de sport']
            }
          ]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des tailleurs:', error);
        toast.error('Impossible de charger la liste des tailleurs');
      } finally {
        setTailorsLoading(false);
      }
    };
    
    loadTailors();
  }, [user]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier que tous les champs obligatoires sont remplis
    if (!formData.selectedTailor) {
      toast.error('Veuillez sélectionner un tailleur');
      setActiveTab('info');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Veuillez fournir une description de votre commande');
      setActiveTab('info');
      return;
    }
    
    // Vérifier qu'au moins quelques mensurations sont fournies
    const measurementsCount = Object.values(formData.measurements).filter(val => val !== undefined && val !== null).length;
    if (measurementsCount < 3) {
      toast.error('Veuillez fournir au moins 3 mensurations');
      setActiveTab('measurements');
      return;
    }
    
    try {
      // Préparer les données de la commande
      const orderData: CreateOrderData = {
        clientId: user?.uid || '',
        tailorId: formData.selectedTailor,
        description: formData.description,
        measurements: formData.measurements,
        attachments: [] // À implémenter: téléchargement de fichiers
      };
      
      // Créer la commande
      const newOrder = await createOrder(orderData);
      
      toast.success('Commande créée avec succès !');
      navigate(`/orders/${newOrder.id}`);
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      toast.error('Erreur lors de la création de la commande');
    }
  };
  
  // Mettre à jour les données du formulaire
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Mettre à jour une mesure spécifique
  const updateMeasurement = (field: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    setFormData((prev) => ({
      ...prev,
      measurements: {
        ...prev.measurements,
        [field]: numValue
      }
    }));
  };
  
  // Passer à l'onglet suivant
  const nextTab = () => {
    if (activeTab === 'info') {
      setActiveTab('measurements');
    } else if (activeTab === 'measurements') {
      setActiveTab('review');
    }
  };
  
  // Revenir à l'onglet précédent
  const prevTab = () => {
    if (activeTab === 'measurements') {
      setActiveTab('info');
    } else if (activeTab === 'review') {
      setActiveTab('measurements');
    }
  };
  
  // Obtenir le nom du tailleur sélectionné
  const getSelectedTailorName = () => {
    const tailor = tailors.find(t => t.uid === formData.selectedTailor);
    return tailor ? tailor.displayName : 'Tailleur inconnu';
  };
  
  // Liste des mensurations disponibles
  const measurementFields = [
    { id: 'chest', label: 'Tour de poitrine' },
    { id: 'waist', label: 'Tour de taille' },
    { id: 'hips', label: 'Tour de hanches' },
    { id: 'shoulder', label: 'Largeur d\'épaules' },
    { id: 'sleeve', label: 'Longueur de manche' },
    { id: 'inseam', label: 'Entrejambe' },
    { id: 'neck', label: 'Tour de cou' },
    { id: 'thigh', label: 'Tour de cuisse' },
    { id: 'height', label: 'Taille (hauteur)' },
    { id: 'weight', label: 'Poids (kg)' },
    { id: 'wrist', label: 'Tour de poignet' },
    { id: 'upperArm', label: 'Tour de bras' },
    { id: 'ankle', label: 'Tour de cheville' },
    { id: 'backWidth', label: 'Largeur du dos' },
    { id: 'frontLength', label: 'Longueur devant' },
    { id: 'backLength', label: 'Longueur dos' }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-1"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={16} />
          Retour
        </Button>
        
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Nouvelle commande</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="info">Informations</TabsTrigger>
              <TabsTrigger value="measurements">Mensurations</TabsTrigger>
              <TabsTrigger value="review">Vérification</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit}>
              {/* Onglet Informations */}
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations de la commande</CardTitle>
                    <CardDescription>
                      Sélectionnez un tailleur et décrivez votre projet
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="tailor">Sélectionnez un tailleur</Label>
                      <Select 
                        value={formData.selectedTailor}
                        onValueChange={(value) => updateFormData('selectedTailor', value)}
                      >
                        <SelectTrigger id="tailor" className="w-full">
                          <SelectValue placeholder="Choisir un tailleur" />
                        </SelectTrigger>
                        <SelectContent>
                          {tailors.map((tailor) => (
                            <SelectItem key={tailor.uid} value={tailor.uid}>
                              {tailor.businessName || tailor.displayName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description détaillée</Label>
                      <Textarea
                        id="description"
                        placeholder="Décrivez votre projet (type de vêtement, matière souhaitée, occasion, etc.)"
                        rows={6}
                        value={formData.description}
                        onChange={(e) => updateFormData('description', e.target.value)}
                      />
                    </div>
                    
                    {/* Implémentation future: sélection de design */}
                    {/* <div className="space-y-2">
                      <Label>Choisir un modèle</Label>
                      <p className="text-sm text-gray-500">Cette fonctionnalité sera bientôt disponible</p>
                    </div> */}
                    
                    {/* Téléchargement de fichiers */}
                    <div className="space-y-2">
                      <Label>Ajouter des références (images, documents)</Label>
                      <div 
                        className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm font-medium">Cliquez pour télécharger des fichiers</p>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG, PDF jusqu'à 10MB</p>
                        <input 
                          id="file-upload" 
                          type="file" 
                          className="hidden" 
                          accept=".jpg,.jpeg,.png,.pdf"
                          multiple
                          onChange={(e) => {
                            // Cette fonctionnalité sera complétée avec le stockage Firebase
                            toast.success('Téléchargement de fichiers disponible dans la prochaine mise à jour');
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={nextTab}
                      disabled={!formData.selectedTailor || !formData.description.trim()}
                    >
                      Continuer
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Onglet Mensurations */}
              <TabsContent value="measurements">
                <Card>
                  <CardHeader>
                    <CardTitle>Vos mensurations</CardTitle>
                    <CardDescription>
                      Indiquez vos mensurations en centimètres (cm)
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {measurementFields.map((field) => (
                        <div key={field.id} className="space-y-1">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <div className="flex items-center">
                            <Input
                              id={field.id}
                              type="number"
                              min="0"
                              step="0.1"
                              value={formData.measurements[field.id] || ''}
                              onChange={(e) => updateMeasurement(field.id, e.target.value)}
                              className="flex-1"
                            />
                            <span className="ml-2 text-sm text-gray-500">cm</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevTab}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Retour
                    </Button>
                    <Button 
                      type="button" 
                      onClick={nextTab}
                    >
                      Vérifier la commande
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              {/* Onglet Vérification */}
              <TabsContent value="review">
                <Card>
                  <CardHeader>
                    <CardTitle>Vérifiez votre commande</CardTitle>
                    <CardDescription>
                      Assurez-vous que tous les détails sont corrects avant de soumettre
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Détails de la commande</h3>
                      <div className="bg-gray-50 p-4 rounded-md space-y-2">
                        <div>
                          <span className="font-medium">Tailleur: </span>
                          <span>{getSelectedTailorName()}</span>
                        </div>
                        <div>
                          <span className="font-medium">Description: </span>
                          <p className="whitespace-pre-wrap mt-1">{formData.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Vos mensurations</h3>
                      <ScrollArea className="h-64 bg-gray-50 p-4 rounded-md">
                        <div className="grid grid-cols-2 gap-3">
                          {measurementFields.map((field) => {
                            const value = formData.measurements[field.id];
                            if (!value) return null;
                            
                            return (
                              <div key={field.id}>
                                <span className="font-medium">{field.label}: </span>
                                <span>{value} cm</span>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-md">
                      <p className="text-blue-700 text-sm">
                        En soumettant cette commande, elle sera envoyée au tailleur pour évaluation. 
                        Le tailleur pourra accepter la commande, suggérer des modifications ou la refuser.
                      </p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevTab}
                    >
                      <ChevronLeft className="mr-1 h-4 w-4" />
                      Modifier
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                    >
                      {isLoading ? 'Création...' : 'Soumettre la commande'}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </form>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}