import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from 'components/Navbar';
import { Footer } from 'components/Footer';
import { useUserGuardContext, firebaseAuth, firebaseApp } from 'app';
import useAppSettingsStore from '../utils/appSettingsStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'XOF', symbol: 'CFA', name: 'CFA Franc' },
  { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
];

export default function AdminSettings() {
  const { user } = useUserGuardContext();
  const navigate = useNavigate();
  const { settings, isLoading, error, fetchSettings, updateSettings } = useAppSettingsStore();
  
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    companyName: '',
    contactEmail: '',
    contactPhone: '',
    currencyCode: 'EUR',
    currencySymbol: '€',
    currencyPosition: 'before',
    primaryColor: '#3b82f6',
    secondaryColor: '#6b7280',
  });
  
  // Check if user is admin
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) return;
      
      try {
        const idTokenResult = await user.getIdTokenResult();
        const isUserAdmin = idTokenResult.claims?.role === 'admin' || false;
        setIsAdmin(isUserAdmin);
        
        if (!isUserAdmin) {
          toast.error('Accès non autorisé. Vous devez être administrateur pour accéder à cette page.');
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
      }
    };
    
    checkAdminRole();
  }, [user, navigate]);
  
  // Load settings
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  // Update form when settings are loaded
  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName,
        contactEmail: settings.contactEmail,
        contactPhone: settings.contactPhone,
        currencyCode: settings.currency.code,
        currencySymbol: settings.currency.symbol,
        currencyPosition: settings.currency.position,
        primaryColor: settings.theme.primaryColor,
        secondaryColor: settings.theme.secondaryColor,
      });
    }
  }, [settings]);
  
  // Handle currency change
  const handleCurrencyChange = (code: string) => {
    const currency = CURRENCIES.find(c => c.code === code);
    if (currency) {
      setFormData(prev => ({
        ...prev,
        currencyCode: currency.code,
        currencySymbol: currency.symbol,
      }));
    }
  };
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // Save settings
  const handleSaveSettings = async () => {
    if (!user) return;
    
    try {
      await updateSettings(user.uid, {
        companyName: formData.companyName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        currency: {
          code: formData.currencyCode,
          symbol: formData.currencySymbol,
          position: formData.currencyPosition as 'before' | 'after',
        },
        theme: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
        },
      });
      
      toast.success('Paramètres mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour des paramètres');
      console.error('Error saving settings:', error);
    }
  };
  
  if (isLoading && !settings) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des paramètres...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Accès non autorisé</h1>
            <p className="text-gray-600">Vous devez être administrateur pour accéder à cette page.</p>
            <Button onClick={() => navigate('/')} className="mt-6">
              Retour à l'accueil
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
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Paramètres administrateur</h1>
            <p className="text-gray-600 mt-1">
              Configurez les paramètres globaux de l'application
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="currency">Devise</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>
                  Configurez les informations de base de votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="companyName" className="text-sm font-medium">
                    Nom de l'entreprise
                  </label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Nom de votre entreprise"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contactEmail" className="text-sm font-medium">
                    Email de contact
                  </label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="contactPhone" className="text-sm font-medium">
                    Téléphone de contact
                  </label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="currency">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de devise</CardTitle>
                <CardDescription>
                  Configurez la devise utilisée dans toute l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="currencyCode" className="text-sm font-medium">
                    Devise
                  </label>
                  <Select
                    value={formData.currencyCode}
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger id="currencyCode">
                      <SelectValue placeholder="Sélectionnez une devise" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} - {currency.name} ({currency.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="currencySymbol" className="text-sm font-medium">
                    Symbole personnalisé (optionnel)
                  </label>
                  <Input
                    id="currencySymbol"
                    name="currencySymbol"
                    value={formData.currencySymbol}
                    onChange={handleChange}
                    placeholder="€"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Position du symbole
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="currencyPosition"
                        value="before"
                        checked={formData.currencyPosition === 'before'}
                        onChange={() => setFormData(prev => ({ ...prev, currencyPosition: 'before' }))}
                        className="h-4 w-4 text-primary"
                      />
                      <span>Avant ({formData.currencySymbol}100)</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="currencyPosition"
                        value="after"
                        checked={formData.currencyPosition === 'after'}
                        onChange={() => setFormData(prev => ({ ...prev, currencyPosition: 'after' }))}
                        className="h-4 w-4 text-primary"
                      />
                      <span>Après (100{formData.currencySymbol})</span>
                    </label>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Aperçu:</h3>
                  <p>
                    {formData.currencyPosition === 'before'
                      ? `${formData.currencySymbol}1,234.56`
                      : `1,234.56 ${formData.currencySymbol}`}
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Apparence</CardTitle>
                <CardDescription>
                  Personnalisez l'apparence de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="primaryColor" className="text-sm font-medium">
                    Couleur principale
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      id="primaryColor"
                      name="primaryColor"
                      value={formData.primaryColor}
                      onChange={handleChange}
                      className="h-10 w-10 rounded border border-gray-300"
                    />
                    <Input
                      value={formData.primaryColor}
                      name="primaryColor"
                      onChange={handleChange}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="secondaryColor" className="text-sm font-medium">
                    Couleur secondaire
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="color"
                      id="secondaryColor"
                      name="secondaryColor"
                      value={formData.secondaryColor}
                      onChange={handleChange}
                      className="h-10 w-10 rounded border border-gray-300"
                    />
                    <Input
                      value={formData.secondaryColor}
                      name="secondaryColor"
                      onChange={handleChange}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Aperçu:</h3>
                  <div className="flex space-x-4">
                    <div
                      className="h-10 w-24 rounded"
                      style={{ backgroundColor: formData.primaryColor }}
                    ></div>
                    <div
                      className="h-10 w-24 rounded"
                      style={{ backgroundColor: formData.secondaryColor }}
                    ></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}
