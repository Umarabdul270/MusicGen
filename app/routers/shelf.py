from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from ..dependencies import get_current_user, get_db
from ..policies.base import UserContext, Action, MaterialContext
from ..policies.engine import evaluate
from ..models.models import Material
from ..schemas import MaterialRead

router = APIRouter(prefix="/shelf", tags=["Shelf"])

@router.get("/", response_model=List[MaterialRead])
async def get_shelf(
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Auto-filter by user's department and level.
    """
    db_materials = db.query(Material).filter(
        Material.department_id == user.department_id,
        Material.level == user.level
    ).all()
    
    results = []
    for m in db_materials:
        m_context = MaterialContext(
            id=str(m.id),
            department_id=str(m.department_id),
            level=m.level,
            visibility_scope=m.visibility_scope
        )
        # For shelf, download is checked for the flag
        dl_decision = evaluate(user, Action.DOWNLOAD, m_context)
        
        m_read = MaterialRead.model_validate(m)
        m_read.download_allowed = dl_decision.allowed
        results.append(m_read)
        
    return results
