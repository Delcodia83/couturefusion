import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import { DesignCard } from 'components/DesignCard';
import { DashboardActionButton } from 'components/DashboardActionButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import useDesignCatalogStore, { DesignCategory } from '../utils/designCatalogStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function TailorDesigns() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { designs, isLoading, error, fetchDesigns, deleteDesign } = useDesignCatalogStore();
  
  const [activeTab, setActiveTab] = useState<'public' | 'draft' | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<DesignCategory | ''>('');
  const [designToDelete, setDesignToDelete] = useState<string | null>(null);
  
  // Fonction pour charger les designs
  const loadDesigns = async () => {
    if (!user) return;
    
    const isPublic = activeTab === 'public' ? true : (activeTab === 'draft' ? false : undefined);
    await fetchDesigns(user.uid, categoryFilter || undefined, isPublic);
  };

  // Charger les designs du tailleur
  useEffect(() => {
    if (user) {
      loadDesigns();
    }
  }, [user]);
  
  // Observer les changements de filtres
  useEffect(() => {
    loadDesigns();
  }, [activeTab, categoryFilter]);
  
  // Filtrer les designs en fonction de l'onglet actif
  const filteredDesigns = designs.filter(design => {
    if (activeTab === 'public') return design.isPublic;
    if (activeTab === 'draft') return !design.isPublic;
    return true;
  });
  
  // Gérer l'édition d'un design
  const handleEditDesign = (designId: string) => {
    navigate(`/tailor-design-edit/${designId}`);
  };
  
  // Confirmation de suppression
  const handleConfirmDelete = async () => {
    if (!designToDelete) return;
    
    try {
      await deleteDesign(designToDelete);
      toast.success('Modèle supprimé avec succès');
      setDesignToDelete(null);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(`Erreur lors de la suppression: ${errorMsg}`);
    }
  };
  
  // Liste des catégories pour le filtre
  const categories = [
    { value: DesignCategory.DRESS, label: 'Robe' },
    { value: DesignCategory.SUIT, label: 'Costume' },
    { value: DesignCategory.SHIRT, label: 'Chemise' },
    { value: DesignCategory.PANTS, label: 'Pantalon' },
    { value: DesignCategory.SKIRT, label: 'Jupe' },
    { value: DesignCategory.COAT, label: 'Manteau' },
    { value: DesignCategory.ACCESSORY, label: 'Accessoire' },
    { value: DesignCategory.OTHER, label: 'Autre' },
  ];
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes Modèles</h1>
            <p className="text-gray-600 mt-1">
              Gérez vos créations et proposez-les à vos clients
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <DashboardActionButton 
              onClick={() => navigate('/tailor-dashboard')} 
              icon="←" 
              label="Tableau de bord"
            />
            <DashboardActionButton 
              onClick={() => navigate('/tailor-design-create')} 
              icon="➤" 
              label="Nouveau modèle"
              primary
            />
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {/* Filtres */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
          <Tabs 
            defaultValue="all" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'public' | 'draft' | 'all')}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">Tous</TabsTrigger>
              <TabsTrigger value="public">Publiés</TabsTrigger>
              <TabsTrigger value="draft">Brouillons</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="w-full md:w-64">
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Liste des designs */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun modèle trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'public' 
                ? 'Vous n\'avez pas encore publié de modèles. Créez-en un et publiez-le !' 
                : activeTab === 'draft' 
                  ? 'Vous n\'avez pas de brouillons. Commencez à créer vos modèles !' 
                  : 'Vous n\'avez pas encore de modèles. Créez votre premier modèle !'}
            </p>
            <button
              onClick={() => navigate('/tailor-design-create')}
              className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Créer un modèle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                showActions
                onEdit={() => handleEditDesign(design.id)}
                onDelete={() => setDesignToDelete(design.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
      
      {/* Dialogue de confirmation de suppression */}
      <AlertDialog open={!!designToDelete} onOpenChange={() => setDesignToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}