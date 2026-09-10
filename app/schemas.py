from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ScanCreateResponse(BaseModel):
    scan_id: int
    status: str
    message: Optional[str] = None


class ScanResultOut(BaseModel):
    clause: str
    extracted_text: Optional[str]
    pass_fail: Optional[bool]
    confidence: Optional[float]
    needs_review: bool

    class Config:
        from_attributes = True


class ScanDetailResponse(BaseModel):
    scan_id: int
    status: str
    created_at: datetime
    results: List[ScanResultOut] = []

    class Config:
        from_attributes = True