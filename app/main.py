from fastapi import FastAPI
from app.routes import scan_routes

app = FastAPI(title="Legal Metrology Compliance Checker")

app.include_router(scan_routes.router)

@app.get("/")
def root():
    return {"status": "backend is running"}