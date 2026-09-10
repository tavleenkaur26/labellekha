from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")  # "user" or "inspector"

    # one user can have many scans
    scans = relationship("Scan", back_populates="owner")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path = Column(String, nullable=False)
    status = Column(String, nullable=False, default="pending")
    consent_given = Column(Boolean, nullable=False, default=False)
    coarse_location = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # NEW — overall compliance result from Role 1
    overall_status = Column(String, nullable=True)       # "compliant" / "non-compliant"
    needs_human_review = Column(Boolean, nullable=True)

    owner = relationship("User", back_populates="scans")
    results = relationship("ScanResult", back_populates="scan")


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    clause = Column(String, nullable=False)
    title = Column(String, nullable=True)          # NEW
    extracted_text = Column(String, nullable=True)  # this stores "evidence" now
    pass_fail = Column(Boolean, nullable=True)
    confidence = Column(String, nullable=True)       # CHANGED: was Float, now String ("high"/"low"/"not_evaluated")
    note = Column(String, nullable=True)             # NEW
    needs_review = Column(Boolean, nullable=False, default=False)

    scan = relationship("Scan", back_populates="results")