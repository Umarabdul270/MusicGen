import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Department, User, UserRole, VisibilityScope, Material
from app.database import Base
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/dbname")

def seed_data():
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    # Create tables if they don't exist (useful for testing)
    Base.metadata.create_all(engine)

    # Seed Departments
    cs_dept = Department(name="Computer Science", code="CS")
    bio_dept = Department(name="Biology", code="BIO")
    session.add_all([cs_dept, bio_dept])
    session.commit()

    # Seed Admin User
    admin = User(
        email="admin@school.edu",
        password_hash="hashed_password", # Use proper hashing in production
        role=UserRole.ADMIN,
        department_id=cs_dept.id,
        level=0
    )
    session.add(admin)
    session.commit()

    print("Database seeded successfully!")

if __name__ == "__main__":
    try:
        seed_data()
    except Exception as e:
        print(f"Error seeding database: {e}")
