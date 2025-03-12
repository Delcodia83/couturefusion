import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "app";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "components/Navbar";
import { Footer } from "components/Footer";
import { toast } from "sonner";

const AdminAccess = () => {
  const { user, loading } = useCurrentUser();
  const [registering, setRegistering] = useState(false);
  const navigate = useNavigate();
  
  const registerAsAdmin = async () => {
    if (!user || !user.email) {
      toast.error("Vous devez être connecté pour devenir administrateur");
      return;
    }
    
    try {
      setRegistering(true);
      
      const response = await fetch(`/api/admin-auth/register-firebase-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: user.email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success("Vous êtes maintenant administrateur!");
        navigate("/AdminDashboard");
      } else {
        toast.error(`Erreur: ${data.message}`);
      }
    } catch (error) {
      console.error("Error registering as admin:", error);
      toast.error("Erreur lors de l'enregistrement comme administrateur");
    } finally {
      setRegistering(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Accès Administrateur</CardTitle>
              <CardDescription>
                Vous devez être connecté pour accéder à l'administration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Veuillez vous connecter à votre compte pour devenir administrateur ou accéder au
                panneau d'administration existant.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate("/login")}>
                Se connecter
              </Button>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Accès Administrateur</CardTitle>
            <CardDescription>
              Gérez votre accès au panneau d'administration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Bienvenue, <strong>{user.displayName || user.email}</strong>.
            </p>
            <p>
              Pour devenir administrateur et accéder au panneau d'administration,
              cliquez sur le bouton ci-dessous.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              className="w-full"
              disabled={registering}
              onClick={registerAsAdmin}
            >
              {registering ? "En cours..." : "Devenir Administrateur"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/AdminDashboard")}
            >
              Accéder au Panneau d'Administration
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AdminAccess;