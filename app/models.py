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
    image_path = Column(String, nullable=False)  # where the uploaded image is stored
    status = Column(String, nullable=False, default="pending")  # pending / recapture_needed / processing / done
    consent_given = Column(Boolean, nullable=False, default=False)
    coarse_location = Column(String, nullable=True)  # e.g. "Delhi" or a pincode, never GPS coords
    created_at = Column(DateTime, default=datetime.utcnow)

    # one scan belongs to one user, and has many clause results
    owner = relationship("User", back_populates="scans")
    results = relationship("ScanResult", back_populates="scan")


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)
    clause = Column(String, nullable=False)  # e.g. "6(1)(a)", "6(2)"
    extracted_text = Column(String, nullable=True)  # exact text OCR pulled for this clause
    pass_fail = Column(Boolean, nullable=True)  # True=pass, False=fail, None=not yet checked
    confidence = Column(Float, nullable=True)  # OCR/rule-engine confidence score
    needs_review = Column(Boolean, nullable=False, default=False)  # flagged for human review

    scan = relationship("Scan", back_populates="results")