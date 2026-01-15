from enum import Enum
from typing import Optional, List
from pydantic import BaseModel

class Role(str, Enum):
    STUDENT = "student"
    LIBRARIAN = "librarian"
    ADMIN = "admin"

class Action(str, Enum):
    UPLOAD = "UPLOAD"
    VIEW_METADATA = "VIEW_METADATA"
    DOWNLOAD = "DOWNLOAD"
    DELETE = "DELETE"

class VisibilityScope(str, Enum):
    DEPARTMENT = "DEPARTMENT"
    GLOBAL_SEARCHABLE = "GLOBAL_SEARCHABLE"

class UserContext(BaseModel):
    user_id: str
    role: Role
    department_id: str
    level: int

class MaterialContext(BaseModel):
    id: str
    department_id: str
    level: int
    visibility_scope: VisibilityScope

class PolicyDecision(BaseModel):
    allowed: bool
    reason: str
