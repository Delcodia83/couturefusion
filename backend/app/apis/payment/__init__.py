from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import databutton as db
import requests
import json
import time
import hashlib
import hmac
import base64
from typing import List, Optional

router = APIRouter()

# Configuration Paytech
PAYTECH_API_KEY = db.secrets.get("PAYTECH_API_KEY")
PAYTECH_SECRET_KEY = db.secrets.get("PAYTECH_SECRET_KEY")
PAYTECH_BASE_URL = "https://paytech.sn"  # URL de base
PAYTECH_API_PATH = "/api/payment/request/create"  # Chemin de l'API

# Modèles de données pour les abonnements
class SubscriptionPlan(BaseModel):
    id: str
    name: str
    description: str
    price: float
    currency: str = "XOF"  # Devise par défaut: Franc CFA
    duration_days: int  # Durée en jours
    features: List[str]

class CreatePaymentRequest(BaseModel):
    user_id: str
    plan_id: str
    payment_method: str = "paytech"  # Par défaut pour l'instant
    return_url: Optional[str] = None
    cancel_url: Optional[str] = None

class CreatePaymentResponse(BaseModel):
    payment_id: str
    redirect_url: str
    status: str
    message: str

class PaymentStatusRequest(BaseModel):
    payment_id: str

class PaymentStatusResponse(BaseModel):
    payment_id: str
    status: str
    user_id: str
    plan_id: str
    amount: float
    currency: str
    payment_date: Optional[str] = None
    expiry_date: Optional[str] = None

class OrderPaymentStatusRequest(BaseModel):
    order_id: str
    client_id: str
    tailor_id: str

class UpdateOrderPaymentStatusRequest(BaseModel):
    order_id: str
    client_id: str
    tailor_id: str
    payment_received: bool
    payment_amount: float
    payment_note: Optional[str] = None

class OrderPaymentStatusResponse(BaseModel):
    order_id: str
    status: str
    client_id: str
    tailor_id: str
    payment_received: bool
    payment_amount: Optional[float] = None
    payment_date: Optional[str] = None
    payment_note: Optional[str] = None

# Plans d'abonnement disponibles
SUBSCRIPTION_PLANS = [
    SubscriptionPlan(
        id="free",
        name="Basique",
        description="Accès aux fonctionnalités de base",
        price=0,
        currency="XOF",
        duration_days=30,
        features=[
            "Création de profil",
            "Prise de mesures standards",
            "Visibilité limitée"
        ]
    ),
    SubscriptionPlan(
        id="premium",
        name="Premium",
        description="Accès complet à toutes les fonctionnalités",
        price=5000,
        currency="XOF",
        duration_days=30,
        features=[
            "Toutes les fonctionnalités de base",
            "Catalogue de modèles illimité",
            "Gestion avancée des commandes",
            "Paiements en ligne",
            "Support prioritaire"
        ]
    ),
    SubscriptionPlan(
        id="professional",
        name="Professionnel",
        description="Solution complète pour les tailleurs professionnels",
        price=10000,
        currency="XOF",
        duration_days=30,
        features=[
            "Toutes les fonctionnalités premium",
            "Support clientele dédié",
            "Rapports analytiques avancés",
            "Personnalisation de l'interface",
            "Intégration à votre site web"
        ]
    )
]

@router.get("/plans")
async def get_subscription_plans() -> List[SubscriptionPlan]:
    """Obtenir la liste des plans d'abonnement disponibles"""
    return SUBSCRIPTION_PLANS

@router.post("/create-payment")
async def create_payment(request: CreatePaymentRequest) -> CreatePaymentResponse:
    """Créer une demande de paiement pour un abonnement via Paytech"""
    
    # Trouver le plan demandé
    plan = next((p for p in SUBSCRIPTION_PLANS if p.id == request.plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan d'abonnement non trouvé")
    
    # Pour les plans gratuits, aucun paiement n'est nécessaire
    if plan.price <= 0:
        # Ici, on simule un paiement réussi immédiatement pour un plan gratuit
        payment_id = f"free_{int(time.time())}_{request.user_id}"
        return CreatePaymentResponse(
            payment_id=payment_id,
            redirect_url=request.return_url or "/dashboard",
            status="success",
            message="Abonnement gratuit activé avec succès"
        )
    
    try:
        # Génération d'un identifiant de paiement unique pour le test
        payment_id = f"test_payment_{int(time.time())}_{request.user_id}"
        ref_command = f"SUB_{request.user_id}_{int(time.time())}"
        
        # Création d'une URL de redirection simulée pour les tests
        # Cette URL redirigerait normalement vers la page de paiement de Paytech
        # Mais pour les tests, nous la simulons pour rediriger directement vers notre page de succès
        success_url = request.return_url or "https://couturefusion.databutton.app/payment-success"
        cancel_url = request.cancel_url or "https://couturefusion.databutton.app/payment-cancelled"
        
        # En mode production, nous ferions appel à l'API Paytech réelle ici
        # Pour les tests, nous simulons une réponse positive
        
        # Stocker les informations de paiement pour référence ultérieure
        # Dans une implémentation réelle, nous stockerions ces informations dans Firestore
        payment_info = {
            "payment_id": payment_id,
            "user_id": request.user_id,
            "plan_id": plan.id,
            "amount": plan.price,
            "currency": plan.currency,
            "ref_command": ref_command,
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S"),
            "status": "pending",
            "redirect_url": f"{success_url}{'&' if '?' in success_url else '?'}payment_id={payment_id}&ref={ref_command}"
        }
        
        print(f"[DEBUG] Simulation de paiement créée: {payment_info}")
        
        # Retourner la réponse simulée
        return CreatePaymentResponse(
            payment_id=payment_id,
            redirect_url=payment_info["redirect_url"],
            status="success",
            message="Simulation: Redirection vers la page de paiement"
        )
            
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erreur lors de la création du paiement: {str(e)}"
        )

@router.get("/subscription-status/{user_id}")
async def get_subscription_status(user_id: str):
    """Obtenir le statut d'abonnement actuel d'un utilisateur"""
    # À implémenter: récupérer le statut d'abonnement depuis Firestore
    # Pour l'instant, nous retournons un statut fictif
    return {
        "user_id": user_id,
        "active": True,
        "plan": "premium",
        "expiry_date": "2023-12-31"
    }

@router.post("/webhook")
async def payment_webhook(payload: dict):
    """Webhook pour recevoir les confirmations de paiement de Paytech"""
    # À implémenter: vérification et traitement des webhooks Paytech
    # Cette fonction sera appelée par Paytech pour notifier des événements de paiement
    print(f"Reçu webhook de Paytech: {payload}")
    
    # Logique à implémenter: mettre à jour le statut d'abonnement dans Firestore
    
    return {"status": "success"}

@router.post("/order/update-payment-status")
async def update_order_payment_status(request: UpdateOrderPaymentStatusRequest) -> OrderPaymentStatusResponse:
    """Permettre aux tailleurs de marquer un paiement comme reçu pour une commande"""
    # À implémenter: mise à jour du statut de paiement dans Firestore
    # Pour l'instant, nous simulons une réponse réussie
    
    # Ici, nous devrions vérifier que l'utilisateur a le droit de mettre à jour ce statut
    
    current_timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    
    return OrderPaymentStatusResponse(
        order_id=request.order_id,
        status="success",
        client_id=request.client_id,
        tailor_id=request.tailor_id,
        payment_received=request.payment_received,
        payment_amount=request.payment_amount,
        payment_date=current_timestamp if request.payment_received else None,
        payment_note=request.payment_note
    )

@router.get("/order/payment-status/{order_id}")
async def get_order_payment_status(order_id: str, client_id: str, tailor_id: str) -> OrderPaymentStatusResponse:
    """Obtenir le statut de paiement d'une commande"""
    # À implémenter: récupérer le statut de paiement depuis Firestore
    # Pour l'instant, nous simulons une réponse
    
    return OrderPaymentStatusResponse(
        order_id=order_id,
        status="success",
        client_id=client_id,
        tailor_id=tailor_id,
        payment_received=False,
        payment_amount=None,
        payment_date=None,
        payment_note=None
    )
