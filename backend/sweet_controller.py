from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Sweet
from schemas import SweetCreate, SweetUpdate, QuantityRequest, SweetResponse, MessageResponse
from dependencies import get_current_user, admin_only
from typing import List, Optional

router = APIRouter(prefix="/api/sweets", tags=["Sweets"])

@router.post("/", response_model=MessageResponse, status_code=201)
def add_sweet(sweet: SweetCreate, db: Session = Depends(get_db), user=Depends(admin_only)):
    new_sweet = Sweet(**sweet.dict())
    db.add(new_sweet)
    db.commit()
    db.refresh(new_sweet)
    return {"message": "Sweet added"}

@router.get("/", response_model=List[SweetResponse])
def get_sweets(db: Session = Depends(get_db)):
    return db.query(Sweet).all()


@router.get("/search", response_model=List[SweetResponse])
def search_sweets(
    name: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
    
):
    query = db.query(Sweet)
    if name:
        query = query.filter(Sweet.name.ilike(f"%{name}%"))
    if category:
        query = query.filter(Sweet.category == category)
    if min_price is not None:
        query = query.filter(Sweet.price >= min_price)
    if max_price is not None:
        query = query.filter(Sweet.price <= max_price)
    return query.all()

# Update sweet
@router.put("/{id}", response_model=MessageResponse)
def update_sweet(id: int, sweet: SweetUpdate, db: Session = Depends(get_db), user=Depends(admin_only)):
    db_sweet = db.query(Sweet).filter(Sweet.id == id).first()
    if not db_sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    for key, value in sweet.dict(exclude_unset=True).items():
        setattr(db_sweet, key, value)

    db.commit()
    return {"message": "Sweet updated"}

# Delete sweet
@router.delete("/{id}", response_model=MessageResponse)
def delete_sweet(id: int, db: Session = Depends(get_db), user=Depends(admin_only)):
    sweet = db.query(Sweet).filter(Sweet.id == id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")

    db.delete(sweet)
    db.commit()
    return {"message": "Sweet deleted"}

# Purchase sweet
@router.post("/{id}/purchase", response_model=MessageResponse)
def purchase_sweet(id: int, data: QuantityRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    sweet = db.query(Sweet).filter(Sweet.id == id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    if sweet.quantity < data.quantity:
        raise HTTPException(status_code=400, detail="Not enough stock")
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    sweet.quantity -= data.quantity
    db.commit()
    return {"message": "Sweet purchased"}
@router.post("/{id}/restock", response_model=SweetResponse)
def restock_sweet(id: int, data: QuantityRequest, db: Session = Depends(get_db), user=Depends(admin_only)):
    sweet = db.query(Sweet).filter(Sweet.id == id).first()
    if not sweet:
        raise HTTPException(status_code=404, detail="Sweet not found")
    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")

    sweet.quantity += data.quantity
    db.commit()
    db.refresh(sweet)
    return sweet
