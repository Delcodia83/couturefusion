from fastapi import APIRouter
from pydantic import BaseModel
import databutton as db
import json
import os

router = APIRouter()

class FirebaseInfoRequest(BaseModel):
    email: str
    password: str

class FirebaseInfoResponse(BaseModel):
    connection_test: bool
    error_message: str = ""
    firebase_config: dict = {}
    firestore_rules: str = ""
    recommendations: str = ""

@router.post("/test-firebase")
async def test_firebase(request: FirebaseInfoRequest) -> FirebaseInfoResponse:
    """
    Test Firebase connection and provide info about config and rules
    """
    import requests
    from firebase_admin import initialize_app, credentials, firestore
    import firebase_admin
    
    firebase_config = {}
    firestore_rules = ""
    connection_test = False
    error_message = ""
    recommendations = ""
    
    try:
        # Get Firebase Config
        try:
            # Lire la config depuis la configuration Firebase
            response = requests.get("https://api.databutton.com/_projects/d4b89513-1099-4345-9109-4e093272414d/dbtn/firebase/config", timeout=10)
            if response.status_code == 200:
                firebase_config = response.json()
                recommendations += "✅ Firebase config récupérée avec succès\n"
            else:
                recommendations += "❌ Impossible de récupérer la config Firebase. Code: " + str(response.status_code) + "\n"
        except Exception as e:
            error_message += f"Erreur lors de la récupération de la config Firebase: {str(e)}\n"
        
        # Get Firestore Rules
        project_id = firebase_config.get("projectId", "")
        api_key = firebase_config.get("apiKey", "")
        if project_id and api_key:
            # Tenter de récupérer les règles via l'API Firebase (approximatif)
            try:
                # On peut seulement tester si les règles permettent l'accès au document
                recommendations += "ℹ️ Recommandation pour les règles Firestore:\n"
                recommendations += "```\nrules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if request.auth != null;\n    }\n  }\n}\n```\n"
                recommendations += "👉 Ces règles permettent à tout utilisateur authentifié d'accéder à la base de données.\n"
                recommendations += "🔒 Pour la production, vous devrez les renforcer en fonction de vos besoins de sécurité.\n"
            except Exception as e:
                error_message += f"Erreur lors de la récupération des règles Firestore: {str(e)}\n"
        
        # Test connection avec les identifiants fournis
        try:
            import requests
            url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={api_key}"
            payload = {
                "email": request.email,
                "password": request.password,
                "returnSecureToken": True
            }
            response = requests.post(url, json=payload)
            if response.status_code == 200:
                connection_test = True
                recommendations += "✅ Connexion à Firebase Auth réussie!\n"
            else:
                error_data = response.json()
                error_message += f"Erreur Auth: {error_data.get('error', {}).get('message', 'Unknown error')}\n"
                recommendations += "❌ Échec de connexion à Firebase Auth\n"
        except Exception as e:
            error_message += f"Erreur lors du test de connexion: {str(e)}\n"
            connection_test = False
            
    except Exception as e:
        error_message = f"Erreur générale: {str(e)}"
    
    # Ajouter des suggestions de règles de sécurité
    if "Missing or insufficient permissions" in error_message:
        recommendations += "\n⚠️ ERREUR DE PERMISSIONS DÉTECTÉE\n"
        recommendations += "Vous devez mettre à jour vos règles de sécurité Firestore dans la console Firebase:\n"
        recommendations += "1. Allez sur https://console.firebase.google.com\n"
        recommendations += "2. Sélectionnez votre projet\n"
        recommendations += "3. Cliquez sur 'Firestore Database' dans le menu\n"
        recommendations += "4. Allez dans l'onglet 'Règles'\n"
        recommendations += "5. Mettez à jour vos règles avec celles ci-dessus pour le développement\n"
    
    return FirebaseInfoResponse(
        connection_test=connection_test,
        error_message=error_message,
        firebase_config=firebase_config,
        firestore_rules=firestore_rules,
        recommendations=recommendations
    )
