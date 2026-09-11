from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime
import re


class ScanCreateResponse(BaseModel):
    scan_id: int
    status: str
    message: Optional[str] = None


class ScanResultOut(BaseModel):
    clause: str
    title: Optional[str]
    extracted_text: Optional[str]
    pass_fail: Optional[bool]
    confidence: Optional[str]
    note: Optional[str]
    needs_review: bool

    class Config:
        from_attributes = True


class ScanDetailResponse(BaseModel):
    scan_id: int
    status: str
    overall_status: Optional[str]
    needs_human_review: Optional[bool]
    coarse_location: Optional[str]
    brand: Optional[str]
    category: Optional[str]
    created_at: datetime
    results: List[ScanResultOut] = []

    class Config:
        from_attributes = True


class ScanListItem(BaseModel):
    scan_id: int
    status: str
    overall_status: Optional[str]
    coarse_location: Optional[str]
    brand: Optional[str]
    category: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Optional[str] = "user"  # "user" or "inspector"


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ScanCreateRequest(BaseModel):
    consent_given: bool
    coarse_location: Optional[str] = None

    @field_validator("coarse_location")
    @classmethod
    def reject_precise_coordinates(cls, v):
        if v is None:
            return v
        gps_pattern = r"^-?\d{1,3}\.\d+\s*,\s*-?\d{1,3}\.\d+$"
        if re.match(gps_pattern, v.strip()):
            raise ValueError(
                "coarse_location must be a locality/city/pincode, not GPS coordinates"
            )
        return v