import os
import pytest
from datetime import datetime, timedelta
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.main import app
from app.models import User, Scan, ScanResult
from app.auth import get_db, hash_password, create_access_token

# Use an in-memory or dedicated test database
TEST_DB_URL = "sqlite:///./test_compliance.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_db():
    """Recreates the test database schema before each test run."""
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_compliance.db"):
        try:
            os.remove("./test_compliance.db")
        except Exception:
            pass


def create_test_user(role="user", email="user@test.com", password="password123"):
    db = TestingSessionLocal()
    user = User(
        name="Test User" if role == "user" else "Inspector Sharma",
        email=email,
        hashed_password=hash_password(password),
        role=role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    token = create_access_token({"sub": str(user.id)})
    db.close()
    return user, token


def seed_test_scans(inspector_user, normal_user):
    """Seeds a variety of consented and non-consented scans."""
    db = TestingSessionLocal()

    # Scan 1: Consented, Compliant, Food & Snacks, Parle, Delhi
    scan1 = Scan(
        user_id=normal_user.id,
        image_path="test1.jpg",
        status="done",
        consent_given=True,
        coarse_location="Delhi",
        brand="Parle",
        category="Food & Snacks",
        overall_status="compliant",
        needs_human_review=False,
        passed_count=6,
        total_checks=6,
        created_at=datetime.utcnow() - timedelta(days=2),
    )
    db.add(scan1)
    db.commit()
    db.refresh(scan1)

    # 6 Rule 6 passes + 1 Rule 7 not_evaluated
    rules = [
        ("Rule 6(1)(a)", "Manufacturer Details", True, "high"),
        ("Rule 6(1)(b)", "Common Name", True, "high"),
        ("Rule 6(1)(c)", "Net Quantity", True, "high"),
        ("Rule 6(1)(d)", "Mfg Date", True, "high"),
        ("Rule 6(1)(e)", "MRP", True, "high"),
        ("Rule 6(2)", "Consumer Care", True, "high"),
        ("Rule 7", "Letter Height", None, "not_evaluated"),
    ]
    for clause, title, p, conf in rules:
        db.add(ScanResult(scan_id=scan1.id, clause=clause, title=title, pass_fail=p, confidence=conf))

    # Scan 2: Consented, Non-Compliant (violates 6(1)(e) MRP and 6(2) Consumer Care), Delhi, Parle
    scan2 = Scan(
        user_id=normal_user.id,
        image_path="test2.jpg",
        status="done",
        consent_given=True,
        coarse_location="Delhi",
        brand="Parle",
        category="Food & Snacks",
        overall_status="non-compliant",
        needs_human_review=True,
        passed_count=4,
        total_checks=6,
        created_at=datetime.utcnow() - timedelta(days=1),
    )
    db.add(scan2)
    db.commit()
    db.refresh(scan2)

    rules2 = [
        ("Rule 6(1)(a)", "Manufacturer Details", True, "high"),
        ("Rule 6(1)(b)", "Common Name", True, "low"),  # Low confidence
        ("Rule 6(1)(c)", "Net Quantity", True, "high"),
        ("Rule 6(1)(d)", "Mfg Date", True, "high"),
        ("Rule 6(1)(e)", "MRP", False, "low"),  # Violation
        ("Rule 6(2)", "Consumer Care", False, "low"),  # Violation
        ("Rule 7", "Letter Height", False, "low"),  # Rule 7 failed (font size)
    ]
    for clause, title, p, conf in rules2:
        db.add(ScanResult(scan_id=scan2.id, clause=clause, title=title, pass_fail=p, confidence=conf))

    # Scan 3: Consented, Non-Compliant, Mumbai, Lakme, Cosmetics
    scan3 = Scan(
        user_id=normal_user.id,
        image_path="test3.jpg",
        status="done",
        consent_given=True,
        coarse_location="Mumbai",
        brand="Lakme",
        category="Cosmetics & Personal Care",
        overall_status="non-compliant",
        needs_human_review=True,
        passed_count=5,
        total_checks=6,
        created_at=datetime.utcnow(),
    )
    db.add(scan3)
    db.commit()
    db.refresh(scan3)

    rules3 = [
        ("Rule 6(1)(a)", "Manufacturer Details", True, "high"),
        ("Rule 6(1)(b)", "Common Name", True, "low"),
        ("Rule 6(1)(c)", "Net Quantity", True, "high"),
        ("Rule 6(1)(d)", "Mfg Date", False, "low"),  # Violation
        ("Rule 6(1)(e)", "MRP", True, "high"),
        ("Rule 6(2)", "Consumer Care", True, "high"),
        ("Rule 7", "Letter Height", True, "low"),
    ]
    for clause, title, p, conf in rules3:
        db.add(ScanResult(scan_id=scan3.id, clause=clause, title=title, pass_fail=p, confidence=conf))

    # Scan 4: Recapture needed scan
    scan4 = Scan(
        user_id=normal_user.id,
        image_path="test4.jpg",
        status="recapture_needed",
        consent_given=True,
        coarse_location="Bengaluru",
        brand="Nestle",
        category="Food & Snacks",
        overall_status=None,
        needs_human_review=True,
        created_at=datetime.utcnow(),
    )
    db.add(scan4)

    # Scan 5: WITHOUT CONSENT — must be completely ignored by dashboard!
    scan5_unconsented = Scan(
        user_id=normal_user.id,
        image_path="test5_private.jpg",
        status="done",
        consent_given=False,  # NO CONSENT
        coarse_location="Private Location",
        brand="Secret Brand",
        category="Private Category",
        overall_status="non-compliant",
        needs_human_review=True,
        created_at=datetime.utcnow(),
    )
    db.add(scan5_unconsented)

    db.commit()
    db.close()


# ---------------------------------------------------------------------------
# 1. Authentication & Role Authorization Tests
# ---------------------------------------------------------------------------

def test_dashboard_unauthenticated_forbidden():
    """Unauthenticated users receive 401 Unauthorized."""
    response = client.get("/dashboard/stats")
    assert response.status_code == 401


def test_dashboard_normal_user_forbidden():
    """Regular users (role='user') receive 403 Forbidden."""
    _, token = create_test_user(role="user", email="citizen@test.com")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 403
    assert "Inspector access required" in response.json()["detail"]


def test_dashboard_inspector_allowed():
    """Inspectors (role='inspector') receive 200 OK."""
    _, token = create_test_user(role="inspector", email="inspector@gov.in")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200


# ---------------------------------------------------------------------------
# 2. Zero Scans Safe Handling
# ---------------------------------------------------------------------------

def test_dashboard_zero_scans_safe():
    """Dashboard handles empty database safely without ZeroDivisionError."""
    _, token = create_test_user(role="inspector", email="inspector_zero@gov.in")
    headers = {"Authorization": f"Bearer {token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_scans"] == 0
    assert data["compliant_count"] == 0
    assert data["non_compliant_count"] == 0
    assert data["compliance_rate"] == 0.0
    assert data["total_violations"] == 0
    assert data["most_violated_rule"] is None


# ---------------------------------------------------------------------------
# 3. Consent Respect & Core Metrics
# ---------------------------------------------------------------------------

def test_dashboard_respects_consent_and_computes_stats():
    """Dashboard strictly excludes unconsented scans and computes KPIs accurately."""
    inspector, insp_token = create_test_user(role="inspector", email="insp1@gov.in")
    user, _ = create_test_user(role="user", email="user1@test.com")
    seed_test_scans(inspector, user)

    headers = {"Authorization": f"Bearer {insp_token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # 4 consented scans seeded (1 compliant, 2 non-compliant, 1 recapture_needed)
    # The 5th scan had consent_given=False and MUST be ignored!
    assert data["total_scans"] == 4
    assert data["compliant_count"] == 1
    assert data["non_compliant_count"] == 2
    assert data["recapture_needed_count"] == 1

    # Eligible scans = 1 + 2 = 3. Compliance rate = (1 / 3) * 100 = 33.3%
    assert data["compliance_rate"] == 33.3

    # Unconsented brand and location must NOT appear in breakdowns
    assert "Secret Brand" not in data["violations_by_brand"]
    assert "Private Location" not in data["violations_by_area"]


# ---------------------------------------------------------------------------
# 4. 7 Rules Violation Analytics & Rule 7 Separation
# ---------------------------------------------------------------------------

def test_rule_violation_analytics_and_rule_7():
    """Verifies all 7 rules are present, accurately counted, and Rule 7 is flagged is_rule_6=False."""
    inspector, insp_token = create_test_user(role="inspector", email="insp2@gov.in")
    user, _ = create_test_user(role="user", email="user2@test.com")
    seed_test_scans(inspector, user)

    headers = {"Authorization": f"Bearer {insp_token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()

    # Verify 7 rules
    rule_analytics = {r["clause"]: r for r in data["rule_analytics"]}
    assert len(rule_analytics) == 7
    expected_clauses = [
        "Rule 6(1)(a)", "Rule 6(1)(b)", "Rule 6(1)(c)",
        "Rule 6(1)(d)", "Rule 6(1)(e)", "Rule 6(2)", "Rule 7"
    ]
    for c in expected_clauses:
        assert c in rule_analytics

    # Rule 7 distinction
    assert rule_analytics["Rule 7"]["is_rule_6"] is False
    assert rule_analytics["Rule 6(1)(e)"]["is_rule_6"] is True

    # Rule 6(1)(e), Rule 6(2), Rule 6(1)(d), Rule 7 violations counted
    assert rule_analytics["Rule 6(1)(e)"]["violations_count"] == 1
    assert rule_analytics["Rule 6(2)"]["violations_count"] == 1
    assert rule_analytics["Rule 6(1)(d)"]["violations_count"] == 1
    assert rule_analytics["Rule 7"]["violations_count"] == 1


# ---------------------------------------------------------------------------
# 5. Region Analytics
# ---------------------------------------------------------------------------

def test_region_analytics():
    """Region analytics correctly aggregates by coarse location without GPS coordinates."""
    inspector, insp_token = create_test_user(role="inspector", email="insp3@gov.in")
    user, _ = create_test_user(role="user", email="user3@test.com")
    seed_test_scans(inspector, user)

    headers = {"Authorization": f"Bearer {insp_token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()

    reg_map = {r["region"]: r for r in data["region_analytics"]}
    assert "Delhi" in reg_map
    assert reg_map["Delhi"]["total_scans"] == 2
    assert reg_map["Delhi"]["compliant_count"] == 1
    assert reg_map["Delhi"]["non_compliant_count"] == 1
    assert reg_map["Delhi"]["compliance_rate"] == 50.0

    assert "Mumbai" in reg_map
    assert reg_map["Mumbai"]["total_scans"] == 1
    assert reg_map["Mumbai"]["non_compliant_count"] == 1


# ---------------------------------------------------------------------------
# 6. Brand & Category Analytics
# ---------------------------------------------------------------------------

def test_brand_and_category_analytics():
    """Brand and category analytics reflect actual scan data."""
    inspector, insp_token = create_test_user(role="inspector", email="insp4@gov.in")
    user, _ = create_test_user(role="user", email="user4@test.com")
    seed_test_scans(inspector, user)

    headers = {"Authorization": f"Bearer {insp_token}"}
    response = client.get("/dashboard/stats", headers=headers)
    assert response.status_code == 200
    data = response.json()

    brand_map = {b["brand"]: b for b in data["brand_analytics"]}
    assert "Parle" in brand_map
    assert brand_map["Parle"]["total_scans"] == 2

    cat_map = {c["category"]: c for c in data["category_analytics"]}
    assert "Food & Snacks" in cat_map
    assert "Cosmetics & Personal Care" in cat_map


# ---------------------------------------------------------------------------
# 7. Adaptive Human Review Queue
# ---------------------------------------------------------------------------

def test_human_review_queue():
    """Human review queue surfaces scans with explainable triggers."""
    inspector, insp_token = create_test_user(role="inspector", email="insp5@gov.in")
    user, _ = create_test_user(role="user", email="user5@test.com")
    seed_test_scans(inspector, user)

    headers = {"Authorization": f"Bearer {insp_token}"}
    response = client.get("/dashboard/reviews", headers=headers)
    assert response.status_code == 200
    reviews = response.json()

    # Scans 1 (has Rule 7 uncalibrated), 2 (needs review), 3 (needs review), 4 (recapture)
    assert len(reviews) >= 3
    recapture_item = next((r for r in reviews if r["status"] == "recapture_needed"), None)
    assert recapture_item is not None
    assert any("recapture" in reason.lower() for reason in recapture_item["review_reasons"])


# ---------------------------------------------------------------------------
# 8. Explainable Inspection Priority Queue
# ---------------------------------------------------------------------------

def test_priority_queue_scoring_and_explanation():
    """Inspection priority queue assigns explainable scores and transparent reasons."""
    inspector, insp_token = create_test_user(role="inspector", email="insp6@gov.in")
    user, _ = create_test_user(role="user", email="user6@test.com")
    seed_test_scans(inspector, user)

    headers = {"Authorization": f"Bearer {insp_token}"}
    response = client.get("/dashboard/priority-queue", headers=headers)
    assert response.status_code == 200
    queue = response.json()

    assert len(queue) == 4
    # Highest priority item should be first
    first_item = queue[0]
    assert first_item["priority_score"] >= queue[-1]["priority_score"]
    assert first_item["priority_level"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    assert len(first_item["priority_reasons"]) > 0


# ---------------------------------------------------------------------------
# 9. Dashboard Dynamic Filters
# ---------------------------------------------------------------------------

def test_dashboard_filters():
    """Filtering by region, brand, or rule restricts stats correctly."""
    inspector, insp_token = create_test_user(role="inspector", email="insp7@gov.in")
    user, _ = create_test_user(role="user", email="user7@test.com")
    seed_test_scans(inspector, user)

    headers = {"Authorization": f"Bearer {insp_token}"}

    # Filter by region=Mumbai
    res_mumbai = client.get("/dashboard/stats?coarse_location=Mumbai", headers=headers)
    assert res_mumbai.status_code == 200
    mumbai_data = res_mumbai.json()
    assert mumbai_data["total_scans"] == 1
    assert mumbai_data["brand_analytics"][0]["brand"] == "Lakme"

    # Filter options endpoint
    res_options = client.get("/dashboard/filter-options", headers=headers)
    assert res_options.status_code == 200
    options = res_options.json()
    assert "Delhi" in options["regions"]
    assert "Mumbai" in options["regions"]
    assert "Parle" in options["brands"]
    assert "Rule 6(1)(a)" in options["rules"]


# ---------------------------------------------------------------------------
# 10. Existing Endpoints Non-Regression
# ---------------------------------------------------------------------------

def test_existing_endpoints_continue_working():
    """Ensures GET /scans and GET /scans/{id} continue working without regression."""
    inspector, insp_token = create_test_user(role="inspector", email="insp8@gov.in")
    user, user_token = create_test_user(role="user", email="user8@test.com")
    seed_test_scans(inspector, user)

    insp_headers = {"Authorization": f"Bearer {insp_token}"}
    user_headers = {"Authorization": f"Bearer {user_token}"}

    # Inspector sees all scans
    res_insp = client.get("/scans", headers=insp_headers)
    assert res_insp.status_code == 200
    assert len(res_insp.json()) >= 4

    # User sees their own scans
    res_user = client.get("/scans", headers=user_headers)
    assert res_user.status_code == 200
    assert len(res_user.json()) >= 4

    # GET /scans/{id}
    first_scan_id = res_insp.json()[0]["scan_id"]
    res_detail = client.get(f"/scans/{first_scan_id}", headers=insp_headers)
    assert res_detail.status_code == 200
    assert res_detail.json()["scan_id"] == first_scan_id
