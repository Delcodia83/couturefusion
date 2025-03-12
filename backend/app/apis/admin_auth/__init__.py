from fastapi import APIRouter, Depends
from pydantic import BaseModel
import databutton as db
from firebase_admin import auth
from app.auth import AuthorizedUser

router = APIRouter(prefix="/admin-auth")

# Check if a user has admin privileges
class AdminCheckResponse(BaseModel):
    is_admin: bool
    email: str

@router.get("/check-admin", response_model=AdminCheckResponse)
def check_admin(user: AuthorizedUser):
    """
    Check if the currently authenticated user has admin privileges
    """
    # Get user email from Firebase Auth
    try:
        user_record = auth.get_user(user.sub)
        email = user_record.email
        
        # In a production environment, we would check custom claims
        # For this implementation, we'll use a list of admin emails in storage
        try:
            admin_emails = db.storage.json.get("admin_emails", default={"emails": []})
        except Exception:
            # If the file doesn't exist, create it with default admin email
            admin_emails = {"emails": ["admin@couturefusion.com"]}
            db.storage.json.put("admin_emails", admin_emails)
        
        is_admin = email in admin_emails["emails"]
        
        return {"is_admin": is_admin, "email": email}
    except Exception as e:
        print(f"Error checking admin status: {e}")
        return {"is_admin": False, "email": ""}

# Set admin privileges for a user
class SetAdminRequest(BaseModel):
    email: str
    is_admin: bool

class SetAdminResponse(BaseModel):
    success: bool
    message: str

@router.post("/set-admin", response_model=SetAdminResponse)
def set_admin(request: SetAdminRequest, user: AuthorizedUser):
    """
    Set admin privileges for a user by email
    Only existing admins can do this operation
    """
    try:
        # First check if the current user is an admin
        current_user_check = check_admin(user)
        if not current_user_check["is_admin"]:
            return {"success": False, "message": "Permission denied: only admins can set admin privileges"}
        
        # Get admin emails list
        admin_emails = db.storage.json.get("admin_emails", default={"emails": []})
        
        # Update the admin status based on request
        if request.is_admin and request.email not in admin_emails["emails"]:
            admin_emails["emails"].append(request.email)
            message = f"Admin privileges granted to {request.email}"
        elif not request.is_admin and request.email in admin_emails["emails"]:
            admin_emails["emails"].remove(request.email)
            message = f"Admin privileges revoked from {request.email}"
        else:
            # Status already set correctly
            status = "admin" if request.is_admin else "non-admin"
            return {"success": True, "message": f"User {request.email} already has {status} status"}
        
        # Save updated admin emails list
        db.storage.json.put("admin_emails", admin_emails)
        
        return {"success": True, "message": message}
    except Exception as e:
        print(f"Error setting admin status: {e}")
        return {"success": False, "message": f"Error: {str(e)}"}

# Function to register a new admin from Firebase Authentication
class RegisterFirebaseAdminRequest(BaseModel):
    email: str

class RegisterFirebaseAdminResponse(BaseModel):
    success: bool
    message: str

@router.post("/register-firebase-admin", response_model=RegisterFirebaseAdminResponse)
def register_firebase_admin(request: RegisterFirebaseAdminRequest):
    """
    Register a new admin for accounts created through Firebase Authentication console
    This endpoint doesn't require authentication to allow Firebase automation
    """
    try:
        # Verify the user exists in Firebase
        try:
            user_record = auth.get_user_by_email(request.email)
        except Exception:
            return {"success": False, "message": f"User with email {request.email} not found in Firebase"}
        
        # Get admin emails list
        try:
            admin_emails = db.storage.json.get("admin_emails", default={"emails": []})
        except Exception:
            # If the file doesn't exist, create it with default admin email
            admin_emails = {"emails": ["admin@couturefusion.com"]}
        
        # Add the email as admin if not already
        if request.email not in admin_emails["emails"]:
            admin_emails["emails"].append(request.email)
            db.storage.json.put("admin_emails", admin_emails)
            return {"success": True, "message": f"Admin privileges granted to {request.email}"}
        else:
            return {"success": True, "message": f"User {request.email} is already an admin"}
    except Exception as e:
        print(f"Error registering Firebase admin: {e}")
        return {"success": False, "message": f"Error: {str(e)}"}