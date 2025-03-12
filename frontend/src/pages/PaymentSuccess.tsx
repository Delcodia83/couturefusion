import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from 'app';
import { subscriptionService, UserSubscription } from 'utils/subscriptionService';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useCurrentUser();
  const [isProcessing, setIsProcessing] = useState(true);
  const [planName, setPlanName] = useState("");
  
  // Récupérer le plan ID des query params
  const queryParams = new URLSearchParams(location.search);
  const planId = queryParams.get('plan');
  const token = queryParams.get('token'); // Paytech token
  
  useEffect(() => {
    const processPayment = async () => {
      if (loading) return;
      
      if (!user) {
        toast.error("Vous devez être connecté pour continuer");
        navigate("/login");
        return;
      }
      
      try {
        // Charger les détails du plan
        const plans = await subscriptionService.getSubscriptionPlans();
        const selectedPlan = plans.find(p => p.id === planId);
        
        if (selectedPlan) {
          setPlanName(selectedPlan.name);
          
          // Mettre à jour l'abonnement de l'utilisateur
          const newSubscription: UserSubscription = {
            userId: user.uid,
            planId: selectedPlan.id,
            active: true,
            startDate: new Date(),
            expiryDate: new Date(Date.now() + selectedPlan.duration_days * 24 * 60 * 60 * 1000),
            paymentId: token || undefined,
            paymentStatus: "completed"
          };
          
          await subscriptionService.updateUserSubscription(newSubscription);
          toast.success("Votre abonnement a été activé avec succès");
        } else {
          toast.error("Plan non trouvé");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        toast.error("Erreur lors du traitement du paiement");
      } finally {
        setIsProcessing(false);
      }
    };
    
    processPayment();
  }, [user, loading, planId, token, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Toaster position="top-right" />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Paiement réussi !</CardTitle>
            <CardDescription className="text-center">
              Votre abonnement a été activé avec succès
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {isProcessing ? (
              <div className="text-center py-4">
                <p>Traitement de votre paiement en cours...</p>
                <div className="mt-4 h-2 w-full bg-gray-200 rounded">
                  <div className="h-full bg-blue-500 rounded animate-pulse" style={{ width: '100%' }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded">
                  <h3 className="font-medium text-gray-700 mb-1">Détails de l'abonnement</h3>
                  <p className="text-sm">Vous êtes maintenant abonné au plan <strong>{planName}</strong>.</p>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter>
            <Button 
              className="w-full" 
              disabled={isProcessing}
              onClick={() => navigate("/dashboard")}
            >
              Accéder à votre espace {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
