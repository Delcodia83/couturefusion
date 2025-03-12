import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useCurrentUser } from 'app';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Clock, DollarSign, ShoppingCart, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import useDesignCatalogStore, { Design, DesignCategory } from '../utils/designCatalogStore';
import useAppSettingsStore from '../utils/appSettingsStore';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'sonner';

export default function DesignDetail() {
  const { designId } = useParams<{ designId: string }>();
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { fetchDesignById } = useDesignCatalogStore();
  const { settings } = useAppSettingsStore();
  
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  const [tailorName, setTailorName] = useState('');
  
  // Charger les détails du design
  useEffect(() => {
    const loadDesign = async () => {
      if (!designId) return;
      
      try {
        setLoading(true);
        const designData = await fetchDesignById(designId);
        
        if (!designData) {
          toast.error('Modèle introuvable');
          navigate('/designs');
          return;
        }
        
        // Vérifier que le design est public ou appartient à l'utilisateur
        if (!designData.isPublic && (!user || designData.tailorId !== user.uid)) {
          toast.error('Vous n\'avez pas accès à ce modèle');
          navigate('/designs');
          return;
        }
        
        setDesign(designData);
        
        // Charger les informations du tailleur (nom)
        // Dans une version future, nous récupérerons le profil du tailleur depuis son ID
        setTailorName('Tailleur professionnel'); // Temporaire
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue';
        toast.error(`Erreur lors du chargement: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadDesign();
  }, [designId, user, navigate, fetchDesignById]);
  
  // Traduction des catégories
  const getCategoryLabel = (category: DesignCategory): string => {
    const categories = {
      [DesignCategory.DRESS]: 'Robe',
      [DesignCategory.SUIT]: 'Costume',
      [DesignCategory.SHIRT]: 'Chemise',
      [DesignCategory.PANTS]: 'Pantalon',
      [DesignCategory.SKIRT]: 'Jupe',
      [DesignCategory.COAT]: 'Manteau',
      [DesignCategory.ACCESSORY]: 'Accessoire',
      [DesignCategory.OTHER]: 'Autre'
    };
    return categories[category];
  };
  
  // Déterminer le style de la catégorie
  const getCategoryStyle = (category: DesignCategory): string => {
    const styles = {
      [DesignCategory.DRESS]: 'bg-pink-100 text-pink-800',
      [DesignCategory.SUIT]: 'bg-blue-100 text-blue-800',
      [DesignCategory.SHIRT]: 'bg-green-100 text-green-800',
      [DesignCategory.PANTS]: 'bg-purple-100 text-purple-800',
      [DesignCategory.SKIRT]: 'bg-yellow-100 text-yellow-800',
      [DesignCategory.COAT]: 'bg-orange-100 text-orange-800',
      [DesignCategory.ACCESSORY]: 'bg-indigo-100 text-indigo-800',
      [DesignCategory.OTHER]: 'bg-gray-100 text-gray-800'
    };
    return styles[category];
  };
  
  // Fonction temporaire pour commander
  const handleOrder = () => {
    toast.info('La fonctionnalité de commande sera disponible prochainement');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        {/* Bouton de retour */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/designs')} 
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la galerie
        </Button>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : design ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Galerie d'images */}
            <div className="bg-white rounded-lg shadow p-4">
              {design.images && design.images.length > 0 ? (
                <Carousel className="w-full">
                  <CarouselContent>
                    {design.images.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-square relative">
                          <img 
                            src={image} 
                            alt={`${design.name} - Image ${index + 1}`} 
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </Carousel>
              ) : (
                <div className="aspect-square flex items-center justify-center bg-gray-100 rounded-md">
                  <span className="text-gray-400">Aucune image disponible</span>
                </div>
              )}
            </div>
            
            {/* Détails du modèle */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start">
                  <h1 className="text-3xl font-bold text-gray-900">{design.name}</h1>
                  <Badge className={getCategoryStyle(design.category)}>
                    {getCategoryLabel(design.category)}
                  </Badge>
                </div>
                <div className="flex items-center mt-2 text-gray-600">
                  <User size={16} className="mr-1" />
                  <span>Par {tailorName}</span>
                </div>
              </div>
              
              <div className="text-lg font-semibold text-primary">
                {formatCurrency(design.price, settings?.currency)}
              </div>
              
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {design.description}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <Clock className="text-primary mr-2" size={20} />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Délai estimé</h3>
                      <p className="text-lg font-semibold">
                        {design.estimatedTime} {design.estimatedTime > 1 ? 'jours' : 'jour'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 bg-white rounded-lg shadow p-4">
                  <div className="flex items-center">
                    <DollarSign className="text-primary mr-2" size={20} />
                    <div>
                      <h3 className="text-sm font-medium text-gray-600">Prix</h3>
                      <p className="text-lg font-semibold">
                        {formatCurrency(design.price, settings?.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full py-6 text-lg" 
                onClick={handleOrder}
              >
                <ShoppingCart className="mr-2" />
                Commander ce modèle
              </Button>
              
              <p className="text-sm text-gray-500 text-center">
                En commandant, vous serez mis en relation avec le tailleur pour discuter des détails et prendre vos mesures.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Modèle introuvable
            </h3>
            <p className="text-gray-600 mb-6">
              Le modèle que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate('/designs')}>
              Retour à la galerie
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}