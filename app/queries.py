from sqlalchemy.orm import Session
from app.models import Scan


def get_consented_scans(db: Session):
    """
    Returns a query of all scans where the user consented to their data
    being used in aggregate stats/dashboards/reports.

    Role 5 (Dashboard) and Role 6 (Search/Reports) should build on top of
    this query for any aggregate or cross-user view — never query the
    Scan table directly for stats without this filter.
    """
    return db.query(Scan).filter(Scan.consent_given == True)