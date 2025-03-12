import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { useCurrentUser } from 'app';
import { db } from '../utils/firebase';
import { toast } from 'sonner';
import useAuthStore from '../utils/authStore';
import { UserRole } from '../utils/firebase';

export default function AdminInit() {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();
  const { register } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [hasAdminAccount, setHasAdminAccount] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    adminCode: ''
  });
  
  // Vérifier s'il existe déjà un compte administrateur
  useEffect(() => {
    const checkAdminAccount = async () => {
      try {
        setIsLoading(true);
        const usersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'admin'),
          limit(1)
        );
        const usersSnapshot = await getDocs(usersQuery);
        setHasAdminAccount(!usersSnapshot.empty);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking admin account:', error);
        setIsLoading(false);
      }
    };
    
    if (!loading) {
      checkAdminAccount();
    }
  }, [loading]);
  
  // Si l'utilisateur est connecté, rediriger vers la page d'accueil
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifications
    if (formData.password !== formData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.adminCode !== 'COUTUREADMIN') { // Code secret pour créer un compte admin
      toast.error('Code administrateur invalide');
      return;
    }
    
    try {
      setIsLoading(true);
      await register(formData.email, formData.password, UserRole.ADMIN, formData.displayName);
      toast.success('Compte administrateur créé avec succès');
      navigate('/admin-settings');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Vérification...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (hasAdminAccount) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Installation déjà effectuée</h1>
            <p className="text-gray-600">Un compte administrateur existe déjà. Veuillez vous connecter.</p>
            <Button onClick={() => navigate('/login')} className="mt-6">
              Se connecter
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Création du compte administrateur</CardTitle>
            <CardDescription>
              Configurez le premier compte administrateur pour commencer à utiliser CoutureFusion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Nom d'affichage
                </label>
                <Input
                  id="displayName"
                  name="displayName"
                  required
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Administrateur"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmer le mot de passe
                </label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="adminCode" className="text-sm font-medium">
                  Code administrateur
                </label>
                <Input
                  id="adminCode"
                  name="adminCode"
                  required
                  value={formData.adminCode}
                  onChange={handleChange}
                  placeholder="Entrez le code administrateur"
                />
                <p className="text-xs text-gray-500">Code par défaut: COUTUREADMIN</p>
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Création en cours...' : 'Créer un compte administrateur'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}