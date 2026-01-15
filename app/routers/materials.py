from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from uuid import UUID

from ..dependencies import get_current_user, get_db
from ..policies.base import UserContext, Action, MaterialContext, VisibilityScope
from ..policies.engine import evaluate
from ..models.models import Material
from ..schemas import MaterialRead, MaterialCreate
from ..services.storage import save_file, stream_file

router = APIRouter(prefix="/materials", tags=["Materials"])

@router.post("/upload", response_model=MaterialRead, status_code=status.HTTP_201_CREATED)
async def upload_material(
    title: str = Form(...),
    course_code: str = Form(...),
    level: int = Form(...),
    visibility_scope: VisibilityScope = Form(...),
    file: UploadFile = File(...),
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Prepare context for policy check
    temp_material_context = MaterialContext(
        id="new", # Won't exist until saved
        department_id=user.department_id, # Target dept is user's dept for upload rule
        level=level,
        visibility_scope=visibility_scope
    )
    
    decision = evaluate(user, Action.UPLOAD, temp_material_context)
    if not decision.allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=decision.reason)

    path = save_file(file)
    
    db_material = Material(
        title=title,
        course_code=course_code,
        level=level,
        visibility_scope=visibility_scope,
        file_path=path,
        department_id=user.department_id,
        uploaded_by=user.user_id
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    
    return db_material

@router.get("/{id}", response_model=MaterialRead)
async def get_material_metadata(
    id: UUID,
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_material = db.query(Material).filter(Material.id == id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    material_context = MaterialContext(
        id=str(db_material.id),
        department_id=str(db_material.department_id),
        level=db_material.level,
        visibility_scope=db_material.visibility_scope
    )
    
    decision = evaluate(user, Action.VIEW_METADATA, material_context)
    if not decision.allowed:
        raise HTTPException(status_code=403, detail=decision.reason)
    
    # Check download permission for the response flag
    dl_decision = evaluate(user, Action.DOWNLOAD, material_context)
    
    result = MaterialRead.model_validate(db_material)
    result.download_allowed = dl_decision.allowed
    return result

@router.get("/{id}/download")
async def download_material(
    id: UUID,
    user: UserContext = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_material = db.query(Material).filter(Material.id == id).first()
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    material_context = MaterialContext(
        id=str(db_material.id),
        department_id=str(db_material.department_id),
        level=db_material.level,
        visibility_scope=db_material.visibility_scope
    )
    
    decision = evaluate(user, Action.DOWNLOAD, material_context)
    if not decision.allowed:
        raise HTTPException(status_code=403, detail=decision.reason)
    
    response = stream_file(db_material.file_path)
    if not response:
        raise HTTPException(status_code=404, detail="File content missing")
    return response
