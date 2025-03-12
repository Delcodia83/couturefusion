import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useCurrentUser } from "app";
import { SubscriptionPlan, UserSubscription, subscriptionService } from "utils/subscriptionService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const Subscription = () => {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les plans d'abonnement
        const availablePlans = await subscriptionService.getSubscriptionPlans();
        setPlans(availablePlans);

        // Si l'utilisateur est connecté, charger son abonnement actuel
        if (user) {
          const subscription = await subscriptionService.getUserSubscription(user.uid);
          setUserSubscription(subscription);
        }
      } catch (error) {
        console.error("Error loading subscription data:", error);
        toast.error("Erreur lors du chargement des données d'abonnement");
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      loadData();
    }
  }, [user, loading]);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast.error("Vous devez être connecté pour vous abonner");
      navigate("/login");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Si c'est un plan gratuit, on met à jour directement
      const selectedPlan = plans.find(p => p.id === planId);
      if (selectedPlan && selectedPlan.price <= 0) {
        const newSubscription: UserSubscription = {
          userId: user.uid,
          planId: planId,
          active: true,
          startDate: new Date(),
          expiryDate: new Date(Date.now() + selectedPlan.duration_days * 24 * 60 * 60 * 1000),
          paymentStatus: "free"
        };
        
        await subscriptionService.updateUserSubscription(newSubscription);
        setUserSubscription(newSubscription);
        toast.success("Abonnement activé avec succès");
        navigate("/dashboard");
        return;
      }
      
      // Sinon, on crée un paiement
      const { paymentId, redirectUrl } = await subscriptionService.createPayment(
        user.uid,
        planId,
        `${window.location.origin}/payment-success?plan=${planId}`
      );
      
      // Rediriger vers la page de paiement
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Error subscribing to plan:", error);
      toast.error("Erreur lors de l'abonnement. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center min-h-[70vh]">
        <div className="text-center">
          <p className="text-lg">Chargement des plans d'abonnement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Toaster position="top-center" />
      
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Plans d'abonnement</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Découvrez nos différents forfaits et sélectionnez celui qui correspond le mieux à vos besoins.
        </p>
      </div>

      {userSubscription && (
        <div className="mb-10 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Votre abonnement actuel</h2>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div>
              <Badge variant={userSubscription.active ? "success" : "destructive"}>
                {userSubscription.active ? "Actif" : "Inactif"}
              </Badge>
              <span className="ml-3 font-medium">
                {plans.find(p => p.id === userSubscription.planId)?.name || "Plan inconnu"}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {userSubscription.expiryDate && (
                <p>Expire le: {userSubscription.expiryDate.toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="overflow-hidden">
            <CardHeader className={`${plan.id === 'professional' ? 'bg-blue-50' : plan.id === 'premium' ? 'bg-purple-50' : 'bg-gray-50'}`}>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-3xl font-bold">
                  {plan.price.toLocaleString()} {plan.currency}
                </span>
                <span className="text-sm text-gray-500 ml-2">/ mois</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <h3 className="text-sm font-medium mb-3">Fonctionnalités incluses:</h3>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mr-2 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <Separator />
            <CardFooter className="pt-4 pb-6">
              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isProcessing || (userSubscription?.planId === plan.id && userSubscription?.active)}
                className={`w-full ${plan.id === 'professional' ? 'bg-blue-600 hover:bg-blue-700' : plan.id === 'premium' ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
              >
                {userSubscription?.planId === plan.id && userSubscription?.active
                  ? "Abonnement actif"
                  : plan.price > 0
                  ? "S'abonner"
                  : "Activer gratuitement"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subscription;
