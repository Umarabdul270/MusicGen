from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional
from .policies.base import Role, VisibilityScope

class MaterialBase(BaseModel):
    title: str
    course_code: str
    level: int
    visibility_scope: VisibilityScope

class MaterialCreate(MaterialBase):
    pass

class MaterialRead(MaterialBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    uploaded_by: UUID
    created_at: datetime
    download_allowed: bool = False

class ShelfResponse(BaseModel):
    materials: List[MaterialRead]

class DepartmentLibraryResponse(BaseModel):
    department_id: UUID
    levels: dict[int, List[MaterialRead]]

class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    email: str
    role: Role
    department_id: UUID
    level: int
