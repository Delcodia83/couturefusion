import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import { DesignForm } from 'components/DesignForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import useDesignCatalogStore, { DesignFormData } from '../utils/designCatalogStore';
import { toast } from 'sonner';

export default function TailorDesignCreate() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { isLoading, createDesign } = useDesignCatalogStore();
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (formData: DesignFormData, newImages: File[], imagesToDelete: string[]) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer un modèle');
      return;
    }
    
    try {
      await createDesign(user.uid, formData, newImages);
      toast.success('Modèle créé avec succès');
      navigate('/tailor-designs');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(`Erreur lors de la création: ${errorMsg}`);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/tailor-designs')} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Créer un nouveau modèle</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <DesignForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </div>
      
      <Footer />
    </div>
  );
}