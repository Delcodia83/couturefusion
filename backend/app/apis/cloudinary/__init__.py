from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
import cloudinary
import cloudinary.uploader
import cloudinary.api
import databutton as db
import json
import time
import hashlib
import hmac
import base64

# Configure cloudinary
cloudinary.config(
    cloud_name=db.secrets.get("CLOUDINARY_CLOUD_NAME"),
    api_key=db.secrets.get("CLOUDINARY_API_KEY"),
    api_secret=db.secrets.get("CLOUDINARY_API_SECRET"),
    secure=True
)

router = APIRouter()

class GenerateSignatureRequest(BaseModel):
    folder: str  # Dossier pour organiser les uploads (ex: designs, profiles)
    public_id: str = None  # ID public optionnel

class GenerateSignatureResponse(BaseModel):
    signature: str
    timestamp: int
    cloud_name: str
    api_key: str
    folder: str
    public_id: str = None

class CloudinaryStatusResponse(BaseModel):
    status: str
    message: str

@router.get("/status")
def check_status() -> CloudinaryStatusResponse:
    """Vérifier la configuration et le statut de Cloudinary"""
    try:
        # Essayer d'obtenir des informations sur le compte
        cloudinary.api.usage()
        return CloudinaryStatusResponse(
            status="success",
            message="Connexion à Cloudinary établie avec succès"
        )
    except Exception as e:
        return CloudinaryStatusResponse(
            status="error",
            message=f"Erreur de connexion à Cloudinary: {str(e)}"
        )

@router.post("/generate-signature")
def generate_signature(request: GenerateSignatureRequest) -> GenerateSignatureResponse:
    """Générer une signature pour l'upload sécurisé côté client"""
    timestamp = int(time.time())
    
    # Préparer les paramètres pour la signature
    params = {
        "timestamp": timestamp,
        "folder": request.folder,
    }
    
    # Ajouter l'ID public s'il est fourni
    if request.public_id:
        params["public_id"] = request.public_id
    
    # Générer la signature
    api_secret = db.secrets.get("CLOUDINARY_API_SECRET")
    params_str = "&".join([f"{k}={v}" for k, v in sorted(params.items())])
    signature = hmac.new(api_secret.encode('utf-8'), params_str.encode('utf-8'), hashlib.sha1).hexdigest()
    
    return GenerateSignatureResponse(
        signature=signature,
        timestamp=timestamp,
        cloud_name=db.secrets.get("CLOUDINARY_CLOUD_NAME"),
        api_key=db.secrets.get("CLOUDINARY_API_KEY"),
        folder=request.folder,
        public_id=request.public_id if request.public_id else None
    )
