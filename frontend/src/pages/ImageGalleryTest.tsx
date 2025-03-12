import React, { useState, useEffect } from 'react';
import { CloudinaryUploader } from 'components/CloudinaryUploader';
import { CloudinaryUploadResult, checkCloudinaryStatus } from 'utils/cloudinaryService';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ImageGalleryTest() {
  const [connectionStatus, setConnectionStatus] = useState<{status: string, message: string} | null>(null);
  const [uploadedImages, setUploadedImages] = useState<CloudinaryUploadResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier le statut de la connexion Cloudinary au chargement
  useEffect(() => {
    const checkStatus = async () => {
      try {
        setIsLoading(true);
        const status = await checkCloudinaryStatus();
        setConnectionStatus(status);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut Cloudinary:', error);
        setConnectionStatus({
          status: 'error',
          message: 'Impossible de vérifier la connexion à Cloudinary'
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, []);

  // Gérer le succès de l'upload
  const handleUploadSuccess = (result: CloudinaryUploadResult) => {
    setUploadedImages(prev => [result, ...prev]);
  };

  // Gérer les erreurs d'upload
  const handleUploadError = (error: Error) => {
    console.error('Erreur d\'upload:', error);
    toast.error(`Erreur d'upload: ${error.message}`);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold">Test de Cloudinary</h1>
      <Separator />

      {/* Statut de la connexion */}
      {isLoading ? (
        <div className="py-4">Vérification de la connexion à Cloudinary...</div>
      ) : connectionStatus ? (
        <Alert variant={connectionStatus.status === 'success' ? 'default' : 'destructive'} className="my-4">
          {connectionStatus.status === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>Statut de la connexion</AlertTitle>
          <AlertDescription>{connectionStatus.message}</AlertDescription>
        </Alert>
      ) : null}

      {/* Uploader */}
      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4">Téléverser une image</h2>
        <div className="max-w-md">
          <CloudinaryUploader 
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            folder="test"
            buttonText="Sélectionner une image"
            maxSizeMB={10}
          />
        </div>
      </div>

      {/* Galerie des images téléversées */}
      <div className="my-8">
        <h2 className="text-xl font-semibold mb-4">Images téléversées</h2>
        {uploadedImages.length === 0 ? (
          <p className="text-gray-500">Aucune image téléversée pour le moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {uploadedImages.map((image, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="aspect-square overflow-hidden rounded-md">
                    <img 
                      src={image.secure_url} 
                      alt={`Uploaded ${index + 1}`} 
                      className="w-full h-full object-cover transition-all hover:scale-105"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p className="truncate">{image.public_id}</p>
                    <p>{Math.round(image.bytes / 1024)} KB</p>
                    <p>{image.width} x {image.height}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
