import os
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .database import Base
from .models.models import User
from .policies.base import UserContext, Role

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(
    db: Session = Depends(get_db),
    # In a real app, we'd use OAuth2PasswordBearer and verify JWT
    x_user_id: str = Header(None) 
) -> UserContext:
    if not x_user_id:
        # For MVP/Demo purposes, we might default or fail
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID header missing (Simulation of JWT auth)"
        )
    
    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return UserContext(
        user_id=str(user.id),
        role=user.role,
        department_id=str(user.department_id),
        level=user.level
    )
