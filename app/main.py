from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.database import engine, Base
from app.models import User, Scan, ScanResult  # Ensure all models are registered
from app.routes import scan_routes, auth_routes, dashboard_routes, search_routes

# Ensure database tables exist on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Legal Metrology Compliance Checker",
    swagger_ui_parameters={"persistAuthorization": True},
)

app.include_router(scan_routes.router)
app.include_router(auth_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(search_routes.router)

# Mount frontend/dist if built, enabling standalone browser access to the dashboard
FRONTEND_DIST = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/dashboard")
    @app.get("/dashboard/{catchall:path}")
    def serve_dashboard(catchall: str = ""):
        index_path = os.path.join(FRONTEND_DIST, "index.html")
        return FileResponse(index_path)

@app.get("/")
def root():
    return {"status": "backend is running"}