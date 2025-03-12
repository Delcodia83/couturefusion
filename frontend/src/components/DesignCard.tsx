import React from 'react';
import { Design, DesignCategory } from '../utils/designCatalogStore';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '../utils/formatters';
import useAppSettingsStore from '../utils/appSettingsStore';

interface Props {
  design: Design;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DesignCard({ design, showActions = false, onEdit, onDelete }: Props) {
  const navigate = useNavigate();
  const { settings } = useAppSettingsStore();
  
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
  
  // Ouvrir la page de détails
  const handleViewDetails = () => {
    navigate(`/designs/${design.id}`);
  };
  
  return (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-200 hover:shadow-md">
      <div className="relative overflow-hidden aspect-[4/3]">
        {!design.isPublic && (
          <div className="absolute top-2 right-2 z-10">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">
              Non publié
            </Badge>
          </div>
        )}
        {design.images && design.images.length > 0 ? (
          <img 
            src={design.images[0]} 
            alt={design.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">Aucune image</span>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold line-clamp-1">{design.name}</CardTitle>
          <Badge className={getCategoryStyle(design.category)}>
            {getCategoryLabel(design.category)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{design.description}</p>
        <div className="flex justify-between items-center mt-2">
          <div className="font-medium">
            {formatCurrency(design.price, settings?.currency)}
          </div>
          <div className="text-xs text-gray-500">
            {design.estimatedTime} {design.estimatedTime > 1 ? 'jours' : 'jour'}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        {showActions ? (
          <div className="flex gap-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={onEdit}
            >
              Modifier
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              className="flex-1"
              onClick={onDelete}
            >
              Supprimer
            </Button>
          </div>
        ) : (
          <Button 
            variant="default" 
            size="sm" 
            className="w-full"
            onClick={handleViewDetails}
          >
            Voir les détails
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}