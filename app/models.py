from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
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

    scans = relationship("Scan", back_populates="owner")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    image_path = Column(String, nullable=False)

    status = Column(String, nullable=False, default="pending")
    consent_given = Column(Boolean, nullable=False, default=False)

    # Location must remain coarse, never raw GPS
    coarse_location = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Product information
    product_name = Column(String, nullable=True)
    brand = Column(String, nullable=True)
    category = Column(String, nullable=True)

    # Overall compliance result
    overall_status = Column(String, nullable=True)
    needs_human_review = Column(Boolean, nullable=True)

    # Summary counts
    passed_count = Column(Integer, nullable=True)
    total_checks = Column(Integer, nullable=True)

    owner = relationship("User", back_populates="scans")
    results = relationship("ScanResult", back_populates="scan")


class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"), nullable=False)

    clause = Column(String, nullable=False)
    title = Column(String, nullable=True)

    # Evidence extracted from OCR
    extracted_text = Column(String, nullable=True)

    # True = passed, False = failed
    pass_fail = Column(Boolean, nullable=True)

    # "high" / "low" / "not_evaluated"
    confidence = Column(String, nullable=True)

    note = Column(String, nullable=True)

    # True when this individual check requires review
    needs_review = Column(Boolean, nullable=False, default=False)

    scan = relationship("Scan", back_populates="results")