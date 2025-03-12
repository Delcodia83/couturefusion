import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw } from 'lucide-react';

const PaymentCancelled = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-12 w-12 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Paiement annulé</CardTitle>
            <CardDescription className="text-center">
              Votre transaction a été annulée ou n'a pas pu être complétée
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-700 mb-1">Que faire maintenant ?</h3>
                <p className="text-sm">
                  Vous pouvez réessayer le paiement ou choisir un autre plan d'abonnement. Si vous continuez à rencontrer des difficultés, veuillez nous contacter.
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/dashboard")}
            >
              Retour au tableau de bord
            </Button>
            <Button 
              className="w-full" 
              onClick={() => navigate("/subscription")}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Réessayer
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentCancelled;
