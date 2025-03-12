import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext } from 'app';
import { DesignForm } from 'components/DesignForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import useDesignCatalogStore, { Design, DesignFormData } from '../utils/designCatalogStore';
import { toast } from 'sonner';

export default function TailorDesignEdit() {
  const { designId } = useParams<{ designId: string }>();
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { isLoading, fetchDesignById, updateDesign } = useDesignCatalogStore();
  
  const [design, setDesign] = useState<Design | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Charger les détails du design
  useEffect(() => {
    const loadDesign = async () => {
      if (!designId || !user) return;
      
      try {
        setLoading(true);
        const designData = await fetchDesignById(designId);
        
        if (!designData) {
          toast.error('Modèle introuvable');
          navigate('/tailor-designs');
          return;
        }
        
        // Vérifier que le design appartient bien au tailleur actuel
        if (designData.tailorId !== user.uid) {
          toast.error('Vous n\'avez pas l\'autorisation de modifier ce modèle');
          navigate('/tailor-designs');
          return;
        }
        
        setDesign(designData);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue';
        toast.error(`Erreur lors du chargement: ${errorMsg}`);
      } finally {
        setLoading(false);
      }
    };
    
    loadDesign();
  }, [designId, user, navigate, fetchDesignById]);
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (formData: DesignFormData, newImages: File[], imagesToDelete: string[]) => {
    if (!designId || !user) {
      toast.error('Informations manquantes');
      return;
    }
    
    try {
      await updateDesign(designId, formData, newImages, imagesToDelete);
      toast.success('Modèle mis à jour avec succès');
      navigate('/tailor-designs');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(`Erreur lors de la mise à jour: ${errorMsg}`);
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
          <h1 className="text-3xl font-bold text-gray-900">Éditer le modèle</h1>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : design ? (
          <div className="bg-white rounded-lg shadow p-6">
            <DesignForm 
              initialValues={design}
              onSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Modèle introuvable
            </h3>
            <p className="text-gray-600 mb-6">
              Le modèle que vous essayez de modifier n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate('/tailor-designs')}>
              Retour à mes modèles
            </Button>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}