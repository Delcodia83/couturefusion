import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { firebaseApp } from "app";
import { collection, getDocs, getFirestore, query, where, addDoc, updateDoc, doc } from "firebase/firestore";
import { toast } from "sonner";

const db = getFirestore(firebaseApp);

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  isActive: boolean;
}

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  status: string;
  startDate: Date;
  endDate: Date;
  amount: number;
  paymentId?: string;
}

const AdminSubscriptions = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isNewPlanDialogOpen, setIsNewPlanDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newPlan, setNewPlan] = useState<Partial<SubscriptionPlan>>({
    name: "",
    description: "",
    price: 0,
    features: [],
    isActive: true
  });
  const [newFeature, setNewFeature] = useState("");

  useEffect(() => {
    fetchPlansAndSubscriptions();
  }, []);

  const fetchPlansAndSubscriptions = async () => {
    try {
      setLoading(true);
      
      // Fetch subscription plans
      const plansQuery = query(collection(db, "subscriptionPlans"));
      const plansSnapshot = await getDocs(plansQuery);
      
      const fetchedPlans: SubscriptionPlan[] = [];
      plansSnapshot.forEach((doc) => {
        const planData = doc.data();
        fetchedPlans.push({
          id: doc.id,
          name: planData.name || "",
          description: planData.description || "",
          price: planData.price || 0,
          features: planData.features || [],
          isActive: planData.isActive !== false
        });
      });
      
      setPlans(fetchedPlans);
      
      // Fetch subscriptions
      const subscriptionsQuery = query(collection(db, "subscriptions"));
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      
      const fetchedSubscriptions: Subscription[] = [];
      subscriptionsSnapshot.forEach((doc) => {
        const subData = doc.data();
        fetchedSubscriptions.push({
          id: doc.id,
          userId: subData.userId || "",
          userEmail: subData.userEmail || "",
          userName: subData.userName || "",
          planId: subData.planId || "",
          planName: subData.planName || "",
          status: subData.status || "inactive",
          startDate: subData.startDate?.toDate() || new Date(),
          endDate: subData.endDate?.toDate() || new Date(),
          amount: subData.amount || 0,
          paymentId: subData.paymentId
        });
      });
      
      setSubscriptions(fetchedSubscriptions);
      
    } catch (error) {
      console.error("Error fetching subscription data:", error);
      toast.error("Erreur lors du chargement des données d'abonnement");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      if (!newPlan.name || !newPlan.description || !newPlan.price) {
        toast.error("Veuillez remplir tous les champs requis");
        return;
      }
      
      const plansCollection = collection(db, "subscriptionPlans");
      await addDoc(plansCollection, {
        name: newPlan.name,
        description: newPlan.description,
        price: Number(newPlan.price),
        features: newPlan.features,
        isActive: true,
        createdAt: new Date()
      });
      
      toast.success("Plan d'abonnement créé avec succès");
      setIsNewPlanDialogOpen(false);
      setNewPlan({
        name: "",
        description: "",
        price: 0,
        features: [],
        isActive: true
      });
      fetchPlansAndSubscriptions();
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      toast.error("Erreur lors de la création du plan d'abonnement");
    }
  };

  const handleTogglePlanStatus = async (planId: string, currentStatus: boolean) => {
    try {
      const planRef = doc(db, "subscriptionPlans", planId);
      await updateDoc(planRef, {
        isActive: !currentStatus
      });
      
      // Update local state
      setPlans(prevPlans => 
        prevPlans.map(plan => 
          plan.id === planId ? { ...plan, isActive: !currentStatus } : plan
        )
      );
      
      toast.success(`Plan ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast.error("Erreur lors de la modification du statut du plan");
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    
    setNewPlan(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeature.trim()]
    }));
    
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    setNewPlan(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des abonnements...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Plans d'abonnement</h2>
        <Button onClick={() => setIsNewPlanDialogOpen(true)}>
          Nouveau Plan
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className={`${!plan.isActive ? 'opacity-60' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-2xl font-bold">{plan.price.toLocaleString()} FCFA<span className="text-sm font-normal">/mois</span></div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
              <ul className="space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <span className="mr-2 text-green-500">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleTogglePlanStatus(plan.id, plan.isActive)}>
                {plan.isActive ? 'Désactiver' : 'Activer'}
              </Button>
              <Button variant="ghost" size="sm">
                Modifier
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <h2 className="text-xl font-semibold mt-12">Abonnements actifs</h2>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Date de début</TableHead>
              <TableHead>Date de fin</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length > 0 ? (
              subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.userName} <span className="text-xs text-muted-foreground block">{sub.userEmail}</span></TableCell>
                  <TableCell>{sub.planName}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      sub.status === 'active' ? 'bg-green-100 text-green-800' : 
                      sub.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {sub.status === 'active' ? 'Actif' : 
                       sub.status === 'pending' ? 'En attente' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell>{sub.startDate.toLocaleDateString()}</TableCell>
                  <TableCell>{sub.endDate.toLocaleDateString()}</TableCell>
                  <TableCell>{sub.amount.toLocaleString()} FCFA</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Aucun abonnement actif trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isNewPlanDialogOpen} onOpenChange={setIsNewPlanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau plan d'abonnement</DialogTitle>
            <DialogDescription>
              Définissez les détails du nouveau plan d'abonnement.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Nom du plan</Label>
              <Input
                id="plan-name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                placeholder="Ex: Plan Premium"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan-description">Description</Label>
              <Input
                id="plan-description"
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                placeholder="Une brève description du plan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="plan-price">Prix (FCFA)</Label>
              <Input
                id="plan-price"
                type="number"
                value={newPlan.price}
                onChange={(e) => setNewPlan({...newPlan, price: Number(e.target.value)})}
                placeholder="Prix mensuel"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Fonctionnalités incluses</Label>
              <div className="flex space-x-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Ajouter une fonctionnalité"
                />
                <Button type="button" onClick={handleAddFeature}>
                  Ajouter
                </Button>
              </div>
              
              <ul className="mt-3 space-y-2">
                {newPlan.features?.map((feature, index) => (
                  <li key={index} className="flex justify-between items-center border rounded p-2">
                    <span>{feature}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveFeature(index)}
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewPlanDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePlan}>
              Créer le plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;