from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from typing import Dict, List

from ..dependencies import get_current_user, get_db
from ..policies.base import UserContext, Action, MaterialContext
from ..policies.engine import evaluate
from ..models.models import Material
from ..schemas import DepartmentLibraryResponse, MaterialRead

router = APIRouter(prefix="/library", tags=["Library"])

@router.get("/{department_id}", response_model=DepartmentLibraryResponse)
async def get_department_library(
    department_id: UUID,
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Requirement: Ensure user.department_id matches
    if str(department_id) != user.department_id:
        raise HTTPException(status_code=403, detail="Access denied to other department libraries.")
    
    db_materials = db.query(Material).filter(
        Material.department_id == department_id
    ).order_by(Material.level).all()
    
    grouped_materials: Dict[int, List[MaterialRead]] = {}
    
    for m in db_materials:
        m_context = MaterialContext(
            id=str(m.id),
            department_id=str(m.department_id),
            level=m.level,
            visibility_scope=m.visibility_scope
        )
        
        # Check download flag
        dl_decision = evaluate(user, Action.DOWNLOAD, m_context)
        
        m_read = MaterialRead.model_validate(m)
        m_read.download_allowed = dl_decision.allowed
        
        if m.level not in grouped_materials:
            grouped_materials[m.level] = []
        grouped_materials[m.level].append(m_read)
        
    return DepartmentLibraryResponse(
        department_id=department_id,
        levels=grouped_materials
    )
