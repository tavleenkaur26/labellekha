from fastapi import FastAPI
from app.routes import scan_routes, auth_routes, dashboard_routes, search_routes

app = FastAPI(
    title="Legal Metrology Compliance Checker",
    swagger_ui_parameters={"persistAuthorization": True},
)

app.include_router(scan_routes.router)
app.include_router(auth_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(search_routes.router)

@app.get("/")
def root():
    return {"status": "backend is running"}