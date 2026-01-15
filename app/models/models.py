import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, ForeignKey, Enum, DateTime, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum

from app.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    LIBRARIAN = "librarian"
    ADMIN = "admin"

class VisibilityScope(str, enum.Enum):
    LEVEL_ONLY = "LEVEL_ONLY"
    DEPARTMENT = "DEPARTMENT"
    GLOBAL_SEARCHABLE = "GLOBAL_SEARCHABLE"

class EnrollmentStatus(str, enum.Enum):
    ACTIVE = "active"
    CARRY_OVER = "carry_over"
    COMPLETED = "completed"

class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    code = Column(String, unique=True, nullable=False)

    users = relationship("User", back_populates="department")
    materials = relationship("Material", back_populates="department")
    courses = relationship("Course", back_populates="department")

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False)
    level = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="users")
    uploaded_materials = relationship("Material", back_populates="uploader")
    enrollments = relationship("Enrollment", back_populates="user")

    __table_args__ = (
        Index("idx_user_dept_level", "department_id", "level"),
    )

class Material(Base):
    __tablename__ = "materials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    course_code = Column(String, index=True)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False)
    level = Column(Integer, nullable=False)
    visibility_scope = Column(Enum(VisibilityScope), nullable=False, index=True)
    file_path = Column(String, nullable=False)
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    department = relationship("Department", back_populates="materials")
    uploader = relationship("User", back_populates="uploaded_materials")

    __table_args__ = (
        Index("idx_material_dept_level", "department_id", "level"),
    )

class Course(Base):
    __tablename__ = "courses"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_code = Column(String, unique=True, nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False)
    level = Column(Integer, nullable=False)
    title = Column(String, nullable=False)

    department = relationship("Department", back_populates="courses")
    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(EnrollmentStatus), nullable=False)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

    __table_args__ = (
        Index("idx_enrollment_user_course", "user_id", "course_id"),
    )
