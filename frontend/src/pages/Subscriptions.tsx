import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "components/Navbar";
import { Footer } from "components/Footer";
import { useUserGuardContext } from "app";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CheckCircle, X, Zap } from "lucide-react";
import useLicenseStore, { LicenseType } from "../utils/licenseStore";

interface PlanFeature {
  name: string;
  description: string;
  included: boolean;
}

interface PricingPlan {
  type: LicenseType;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: PlanFeature[];
  buttonLabel: string;
  popular?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    type: LicenseType.FREE,
    name: "Gratuit",
    description: "Pour les particuliers et petits tailleurs",
    price: 0,
    currency: "EUR",
    billingPeriod: "pour toujours",
    features: [
      { name: "Profil client avec mesures", description: "Gérez vos informations et vos mesures", included: true },
      { name: "Commandes basiques", description: "Limitées à 10 commandes", included: true },
      { name: "Galerie de modèles", description: "Accès limité à la galerie", included: true },
      { name: "Support par email", description: "Réponse sous 72h", included: true },
      { name: "Suivi de commandes avancé", description: "Avec notifications et historique", included: false },
      { name: "Statistiques et analytics", description: "Pour optimiser votre activité", included: false },
    ],
    buttonLabel: "Continuer gratuitement",
  },
  {
    type: LicenseType.BASIC,
    name: "Basique",
    description: "Pour les tailleurs indépendants",
    price: 19.99,
    currency: "EUR",
    billingPeriod: "par mois",
    features: [
      { name: "Profil client avec mesures", description: "Gérez vos informations et vos mesures", included: true },
      { name: "Commandes illimitées", description: "Aucune limite sur le nombre de commandes", included: true },
      { name: "Galerie de modèles", description: "Accès complet à la galerie", included: true },
      { name: "Support par email", description: "Réponse sous 24h", included: true },
      { name: "Suivi de commandes avancé", description: "Avec notifications et historique", included: true },
      { name: "Statistiques et analytics", description: "Pour optimiser votre activité", included: false },
    ],
    buttonLabel: "Commencer l'essai",
    popular: true,
  },
  {
    type: LicenseType.PREMIUM,
    name: "Premium",
    description: "Pour les ateliers et boutiques",
    price: 49.99,
    currency: "EUR",
    billingPeriod: "par mois",
    features: [
      { name: "Profil client avec mesures", description: "Gérez vos informations et vos mesures", included: true },
      { name: "Commandes illimitées", description: "Aucune limite sur le nombre de commandes", included: true },
      { name: "Galerie de modèles", description: "Accès complet à la galerie", included: true },
      { name: "Support prioritaire", description: "Réponse sous 4h", included: true },
      { name: "Suivi de commandes avancé", description: "Avec notifications et historique", included: true },
      { name: "Statistiques et analytics", description: "Pour optimiser votre activité", included: true },
    ],
    buttonLabel: "S'abonner",
  },
];

export default function Subscriptions() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { fetchActiveLicense, currentLicense, createLicense, isLoading } = useLicenseStore();
  const [mockPaymentInProgress, setMockPaymentInProgress] = useState(false);

  useEffect(() => {
    const loadLicense = async () => {
      if (user) {
        await fetchActiveLicense(user.uid);
      }
    };

    loadLicense();
  }, [user]);

  const formatCurrency = (amount: number, currency: string): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const handleSelectPlan = async (plan: PricingPlan) => {
    if (!user) return;

    if (plan.type === LicenseType.FREE) {
      // Pour le plan gratuit, pas de paiement
      await handleSubscription(plan);
    } else {
      // Simuler un processus de paiement
      mockPaymentProcess(plan);
    }
  };

  const mockPaymentProcess = (plan: PricingPlan) => {
    setMockPaymentInProgress(true);
    toast.info("Simulation de paiement en cours...");

    // Simuler un délai de traitement
    setTimeout(async () => {
      setMockPaymentInProgress(false);
      toast.success("Paiement simulé avec succès!");
      await handleSubscription(plan);
    }, 2000);
  };

  const handleSubscription = async (plan: PricingPlan) => {
    if (!user) return;

    try {
      // Calculer les dates
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // Durée d'un mois pour l'abonnement

      // Définir les fonctionnalités en fonction du plan
      const featuresMap = {
        [LicenseType.FREE]: ["basic_orders", "profile_management"],
        [LicenseType.BASIC]: ["unlimited_orders", "profile_management", "full_gallery", "advanced_tracking"],
        [LicenseType.PREMIUM]: ["unlimited_orders", "profile_management", "full_gallery", "advanced_tracking", "analytics"],
        [LicenseType.ENTERPRISE]: ["unlimited_orders", "profile_management", "full_gallery", "advanced_tracking", "analytics", "api_access"],
      };

      // Créer la licence
      await createLicense({
        userId: user.uid,
        type: plan.type,
        features: featuresMap[plan.type],
        startDate,
        endDate,
        amount: plan.price,
        currency: plan.currency,
        paymentId: plan.type !== LicenseType.FREE ? `mock_payment_${Date.now()}` : undefined,
      });

      toast.success(`Vous êtes maintenant abonné au plan ${plan.name}!`);

      // Rediriger vers le dashboard après l'abonnement
      navigate("/dashboard");
    } catch (error) {
      console.error("Error during subscription:", error);
      toast.error("Une erreur est survenue lors de l'abonnement.");
    }
  };

  // Déterminer le plan actuel
  const getCurrentPlanName = () => {
    if (!currentLicense) return "Chargement...";
    
    const plan = pricingPlans.find(p => p.type === currentLicense.type);
    return plan ? plan.name : "Plan inconnu";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Choisissez votre abonnement</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sélectionnez le plan qui correspond le mieux à vos besoins. Tous nos plans comprennent un accès complet à notre plateforme avec différents niveaux de fonctionnalités.
            </p>

            {currentLicense && (
              <div className="mt-4 inline-flex items-center bg-gray-100 px-4 py-2 rounded-full">
                <span className="text-gray-700">Plan actuel:</span>
                <Badge variant="secondary" className="ml-2">
                  {getCurrentPlanName()}
                </Badge>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.type} 
                className={`flex flex-col relative ${plan.popular ? 'border-primary shadow-md' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge className="bg-primary hover:bg-primary/90 flex items-center gap-1">
                      <Zap size={14} />
                      Populaire
                    </Badge>
                  </div>
                )}
                
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-3xl font-bold">
                      {formatCurrency(plan.price, plan.currency)}
                    </span>
                    <span className="text-gray-500 ml-1">{plan.billingPeriod}</span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-grow">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        {feature.included ? (
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className={`font-medium ${feature.included ? 'text-gray-900' : 'text-gray-400'}`}>
                            {feature.name}
                          </p>
                          <p className={`text-sm ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
                            {feature.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    onClick={() => handleSelectPlan(plan)}
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    disabled={isLoading || mockPaymentInProgress}
                  >
                    {isLoading || mockPaymentInProgress ? "Chargement..." : plan.buttonLabel}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}