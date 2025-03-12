import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { DesignCategory, DesignFormData, Design } from '../utils/designCatalogStore';
import { X } from 'lucide-react';

interface Props {
  initialValues?: Design;
  onSubmit: (formData: DesignFormData, newImages: File[], imagesToDelete: string[]) => void;
  isLoading: boolean;
}

export function DesignForm({ initialValues, onSubmit, isLoading }: Props) {
  const [formData, setFormData] = useState<DesignFormData>({
    name: '',
    description: '',
    category: DesignCategory.OTHER,
    price: 0,
    estimatedTime: 1,
    isPublic: false
  });
  
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  
  // Initialiser le formulaire avec les valeurs existantes
  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name,
        description: initialValues.description,
        category: initialValues.category,
        price: initialValues.price,
        estimatedTime: initialValues.estimatedTime,
        isPublic: initialValues.isPublic
      });
      
      if (initialValues.images) {
        setExistingImages(initialValues.images);
      }
    }
  }, [initialValues]);
  
  // Générer les URL de prévisualisation pour les nouveaux fichiers
  useEffect(() => {
    if (newImages.length === 0) {
      setImagePreviewUrls([]);
      return;
    }
    
    const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
    setImagePreviewUrls(newPreviewUrls);
    
    // Nettoyer les URL de prévisualisation lors du démontage
    return () => {
      newPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [newImages]);
  
  // Gérer les changements de champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'estimatedTime' ? parseFloat(value) : value
    }));
  };
  
  // Gérer les changements de sélecteur
  const handleSelectChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Gérer les changements de switch
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Gérer l'ajout d'images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setNewImages(prev => [...prev, ...filesArray]);
    }
  };
  
  // Supprimer une nouvelle image
  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // Marquer une image existante pour suppression
  const handleRemoveExistingImage = (imageUrl: string) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(url => url !== imageUrl));
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, newImages, imagesToDelete);
  };
  
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom du modèle*</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Robe de soirée élégante"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description*</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Décrivez le modèle en détail..."
            required
            rows={4}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie*</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange('category', value)}
              required
            >
              <SelectTrigger id="category">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="price">Prix*</Label>
            <Input
              id="price"
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="estimatedTime">Délai estimé (jours)*</Label>
            <Input
              id="estimatedTime"
              name="estimatedTime"
              type="number"
              min="1"
              step="1"
              value={formData.estimatedTime}
              onChange={handleChange}
              placeholder="7"
              required
            />
          </div>
          
          <div className="space-y-2 flex items-end pb-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleSwitchChange('isPublic', checked)}
              />
              <Label htmlFor="isPublic">Publier le modèle</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Images</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
            {/* Images existantes non marquées pour suppression */}
            {existingImages.map((imageUrl, index) => (
              <Card key={`existing-${index}`} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <img 
                    src={imageUrl} 
                    alt={`Image ${index + 1}`} 
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(imageUrl)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </CardContent>
              </Card>
            ))}
            
            {/* Nouvelles images */}
            {imagePreviewUrls.map((url, index) => (
              <Card key={`new-${index}`} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <img 
                    src={url} 
                    alt={`Nouvelle image ${index + 1}`} 
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveNewImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={16} />
                  </button>
                </CardContent>
              </Card>
            ))}
            
            {/* Bouton d'ajout d'images */}
            <Card className="relative overflow-hidden border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
              <CardContent className="p-0">
                <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <p className="text-xs text-gray-500 mt-1">Ajouter une image</p>
                  </div>
                  <input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Enregistrement...' : (initialValues ? 'Mettre à jour le modèle' : 'Créer le modèle')}
      </Button>
    </form>
  );
}