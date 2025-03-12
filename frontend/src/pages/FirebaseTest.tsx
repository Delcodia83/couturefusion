import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import brain from 'brain';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

export default function FirebaseTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const testFirebase = async () => {
    if (!email || !password) {
      toast.error('Veuillez saisir votre email et mot de passe');
      return;
    }

    setTesting(true);
    try {
      const response = await brain.test_firebase({ email, password });
      const data = await response.json();
      setResults(data);
      if (data.connection_test) {
        toast.success('Connexion Firebase réussie!');
      } else {
        toast.error('Problème de connexion à Firebase');
      }
    } catch (error) {
      console.error('Test error:', error);
      toast.error('Erreur lors du test: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Diagnostic Firebase & Firestore</h1>
      <p className="mb-6">Cet outil permet de diagnostiquer les problèmes de connexion avec Firebase et Firestore.</p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test de connexion Firebase</CardTitle>
            <CardDescription>
              Entrez vos identifiants pour tester la connexion Firebase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email">Email</label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password">Mot de passe</label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={testFirebase} disabled={testing}>
              {testing ? 'Test en cours...' : 'Tester la connexion'}
            </Button>
          </CardFooter>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Résultats du diagnostic</CardTitle>
              <CardDescription>
                État de la connexion et recommandations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">État de la connexion:</h3>
                <p className={results.connection_test ? 'text-green-600' : 'text-red-600'}>
                  {results.connection_test ? '✅ Connexion réussie' : '❌ Échec de connexion'}
                </p>
              </div>

              {results.error_message && (
                <div>
                  <h3 className="font-semibold mb-2">Message d'erreur:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                    {results.error_message}
                  </pre>
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Configuration Firebase:</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-60">
                  {JSON.stringify(results.firebase_config, null, 2)}
                </pre>
              </div>

              {results.recommendations && (
                <div>
                  <h3 className="font-semibold mb-2">Recommandations:</h3>
                  <div className="bg-blue-50 p-3 rounded text-sm whitespace-pre-wrap">
                    {results.recommendations}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
