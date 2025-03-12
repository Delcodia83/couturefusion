import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';

// Admin components
import AdminStats from "components/AdminStats";
import AdminUsers from "components/AdminUsers";
import AdminSubscriptions from "components/AdminSubscriptions";
import AdminContent from "components/AdminContent";

const AdminDashboard = () => {
  const { user, loading } = useCurrentUser();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is an admin
    if (!loading && user) {
      const checkAdminStatus = async () => {
        try {
          // Check admin status using the admin-auth API
          const response = await fetch(`/api/admin-auth/check-admin`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${await user.getIdToken()}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to verify admin status');
          }
          
          const data = await response.json();
          const hasAdminRights = data.is_admin;
          
          setIsAdmin(hasAdminRights);
          
          if (!hasAdminRights) {
            toast.error("Accès non autorisé. Redirection...");
            navigate("/");
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          toast.error("Erreur lors de la vérification des droits d'administration");
          navigate("/");
        }
      };
      
      checkAdminStatus();
    } else if (!loading && !user) {
      // Not logged in, redirect to login
      toast.error("Veuillez vous connecter pour accéder au panneau d'administration");
      navigate("/login");
    }
  }, [user, loading, navigate]);
  
  const handleLogout = () => {
    navigate("/logout");
  };
  
  const goToAdminAccess = () => {
    navigate("/AdminAccess");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>

export default AdminDashboard;
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Panneau d'Administration</h1>
            <div className="space-x-2">
              <button
                onClick={goToAdminAccess}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Gérer accès admin
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Déconnexion
              </button>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-gray-600">Bienvenue, {user?.displayName || 'Administrateur'}!</p>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="subscriptions">Abonnements</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AdminStats />
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Utilisateurs</CardTitle>
                <CardDescription>
                  Gérez les comptes des clients et des tailleurs sur la plateforme.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminUsers />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des Abonnements</CardTitle>
                <CardDescription>
                  Gérez les plans d'abonnement et suivez les paiements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminSubscriptions />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Modération de Contenu</CardTitle>
                <CardDescription>
                  Approuvez les designs et gérez le contenu de la plateforme.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdminContent />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}