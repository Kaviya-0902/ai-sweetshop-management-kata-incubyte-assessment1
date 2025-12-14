from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer
from jose import jwt
from sqlalchemy.orm import Session
from database import get_db
from models import User

SECRET_KEY = "SECRET123"
ALGORITHM = "HS256"

security = HTTPBearer()

def get_current_user(token=Depends(security), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.username == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

def admin_only(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
