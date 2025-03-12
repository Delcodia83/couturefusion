import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useCurrentUser } from 'app';
import { DesignCard } from 'components/DesignCard';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import useDesignCatalogStore, { DesignCategory } from '../utils/designCatalogStore';

export default function DesignGallery() {
  const { user } = useCurrentUser();
  const navigate = useNavigate();
  const { designs, isLoading, error, fetchDesigns } = useDesignCatalogStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DesignCategory | ''>('');
  
  // Charger tous les designs publics
  useEffect(() => {
    // Pour la galerie publique, on charge uniquement les designs publics
    fetchDesigns(undefined, categoryFilter || undefined, true);
  }, [categoryFilter]);
  
  // Filtrer les designs en fonction de la recherche
  const filteredDesigns = designs.filter(design => {
    const matchesSearch = searchQuery === '' || 
      design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      design.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });
  
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
            <h1 className="text-3xl font-bold text-gray-900">Galerie de Modèles</h1>
            <p className="text-gray-600 mt-1">
              Découvrez les créations de nos tailleurs
            </p>
          </div>
          
          {user && (
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={() => navigate(user ? '/client-dashboard' : '/')} 
                variant="outline"
              >
                {user ? 'Tableau de bord' : 'Accueil'}
              </Button>
            </div>
          )}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        {/* Filtres et recherche */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
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
          
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              type="text"
              placeholder="Rechercher par nom ou description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
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
              Aucun modèle ne correspond à vos critères de recherche.
            </p>
            <Button variant="outline" onClick={() => {
              setSearchQuery('');
              setCategoryFilter('');
            }}>
              Réinitialiser les filtres
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDesigns.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}