import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { DesignCard } from 'components/DesignCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import useDesignCatalogStore, { DesignCategory } from '../utils/designCatalogStore';

export default function Designs() {
  const navigate = useNavigate();
  const { designs, isLoading, error, fetchDesigns } = useDesignCatalogStore();
  
  const [categoryFilter, setCategoryFilter] = useState<DesignCategory | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Charger tous les designs publics
  useEffect(() => {
    loadDesigns();
  }, []);
  
  // Fonction pour charger les designs
  const loadDesigns = async () => {
    await fetchDesigns(undefined, categoryFilter || undefined, true); // true = seulement les designs publics
  };
  
  // Rafraîchir quand les filtres changent
  useEffect(() => {
    loadDesigns();
  }, [categoryFilter]);
  
  // Filtrer les designs par recherche
  const filteredDesigns = designs.filter(design => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      design.name.toLowerCase().includes(query) ||
      design.description.toLowerCase().includes(query)
    );
  });
  
  // Obtenir la liste des catégories
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
      
      <div className="bg-gradient-to-r from-primary/90 to-primary/70 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Catalogue de Modèles</h1>
          <p className="text-lg max-w-2xl">Parcourez notre sélection de modèles créés par nos tailleurs professionnels. Trouvez l'inspiration pour votre prochain vêtement sur mesure.</p>
        </div>
      </div>
      
      <div className="flex-grow container mx-auto px-4 py-8">
        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div>
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value as DesignCategory | '')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
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
            
            <Button 
              onClick={() => {
                setCategoryFilter('');
                setSearchQuery('');
              }}
              variant="outline"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        </div>
        
        {/* Résultats */}
        {isLoading ? (
          <div className="flex justify-center items-center p-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
            <p>Une erreur est survenue lors du chargement des modèles. Veuillez réessayer.</p>
          </div>
        ) : filteredDesigns.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun modèle trouvé
            </h3>
            <p className="text-gray-600 mb-6">
              Aucun modèle ne correspond à vos critères de recherche. Essayez de modifier vos filtres.
            </p>
            <Button onClick={() => {
              setCategoryFilter('');
              setSearchQuery('');
            }}>
              Voir tous les modèles
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <DesignCard 
                key={design.id} 
                design={design}
              />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}
