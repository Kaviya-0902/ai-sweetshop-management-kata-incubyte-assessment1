from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    password: str
    role: str

class UserLogin(BaseModel):
    username: str
    password: str

class SweetCreate(BaseModel):
    name: str
    category: str
    price: float
    quantity: int
    image_url: Optional[str] = None

class SweetUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None
    image_url: Optional[str] = None

class SweetResponse(BaseModel):
    id: int
    name: str
    category: str
    price: float
    quantity: int
    image_url: Optional[str] = None

    model_config = {"from_attributes": True}

class QuantityRequest(BaseModel):
    quantity: int

class MessageResponse(BaseModel):
    message: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: Optional[str] = None
    role: Optional[str] = None
