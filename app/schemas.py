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
    consent_given: bool
    passed_count: Optional[int]
    total_checks: Optional[int]
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
    role: Optional[str] = "user"


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


class RuleViolationDetail(BaseModel):
    clause: str
    title: str
    is_rule_6: bool
    violations_count: int
    pass_count: int
    not_evaluated_count: int
    low_confidence_count: int
    percentage_of_total_violations: float


class RegionMetric(BaseModel):
    region: str
    total_scans: int
    compliant_count: int
    non_compliant_count: int
    compliance_rate: float
    total_violations: int
    top_violation: Optional[str] = None


class BrandMetric(BaseModel):
    brand: str
    total_scans: int
    compliant_count: int
    non_compliant_count: int
    compliance_rate: float
    total_violations: int


class CategoryMetric(BaseModel):
    category: str
    total_scans: int
    compliant_count: int
    non_compliant_count: int
    compliance_rate: float
    total_violations: int


class FilterOptionsResponse(BaseModel):
    regions: List[str] = []
    brands: List[str] = []
    categories: List[str] = []
    rules: List[str] = []
    statuses: List[str] = []


class HumanReviewItem(BaseModel):
    scan_id: int
    brand: Optional[str] = None
    category: Optional[str] = None
    coarse_location: Optional[str] = None
    overall_status: Optional[str] = None
    status: str
    needs_human_review: bool
    created_at: datetime
    review_reasons: List[str] = []
    passed_count: Optional[int] = None
    total_checks: Optional[int] = None
    results: List[ScanResultOut] = []

    class Config:
        from_attributes = True


class PriorityQueueItem(BaseModel):
    scan_id: int
    brand: Optional[str] = None
    category: Optional[str] = None
    coarse_location: Optional[str] = None
    overall_status: Optional[str] = None
    created_at: datetime
    priority_level: str  # "CRITICAL", "HIGH", "MEDIUM", "LOW"
    priority_score: int
    priority_reasons: List[str] = []
    violation_count: int
    has_low_confidence: bool
    needs_human_review: bool
    results: List[ScanResultOut] = []

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    total_scans: int
    compliant_count: int
    non_compliant_count: int
    recapture_needed_count: int = 0
    compliance_rate: float
    needs_human_review_count: int
    total_violations: int
    violations_by_rule: dict[str, int]
    rule_analytics: List[RuleViolationDetail] = []
    most_violated_rule: Optional[dict] = None
    region_analytics: List[RegionMetric] = []
    brand_analytics: List[BrandMetric] = []
    category_analytics: List[CategoryMetric] = []
    violations_by_brand: dict[str, int]
    violations_by_category: dict[str, int]
    violations_by_area: dict[str, int]
    available_filters: Optional[FilterOptionsResponse] = None