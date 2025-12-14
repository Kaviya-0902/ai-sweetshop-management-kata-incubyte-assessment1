from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
from database import get_db
from models import User
from schemas import UserCreate, UserLogin, MessageResponse, TokenResponse

SECRET_KEY = "SECRET123"
ALGORITHM = "HS256"

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Initialize bcrypt context - use schemes without deprecated to avoid initialization issues
# The deprecated="auto" causes issues with Python 3.14 and newer bcrypt versions
pwd_context = CryptContext(schemes=["bcrypt"])

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

@router.post("/register", response_model=MessageResponse, status_code=201)
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Validate role
    if user.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'admin'")
    
    new_user = User(
        username=user.username,
        password=hash_password(user.password),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    return {"message": "User registered successfully"}

@router.post("/login", response_model=TokenResponse)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode(
        {"sub": db_user.username, "role": db_user.role},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "username": db_user.username,
        "role": db_user.role,
    }
