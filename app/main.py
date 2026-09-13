import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app import models
from app.routes import (
    scan_routes,
    auth_routes,
    dashboard_routes,
    search_routes,
    report_routes,
)

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Legal Metrology Compliance Checker",
    swagger_ui_parameters={"persistAuthorization": True},
)

# Comma-separated list of allowed frontend origins, e.g.
# ALLOWED_ORIGINS="https://labellekha.vercel.app,http://localhost:5173"
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan_routes.router)
app.include_router(auth_routes.router)
app.include_router(dashboard_routes.router)
app.include_router(search_routes.router)
app.include_router(report_routes.router)


@app.get("/")
def root():
    return {"status": "backend is running"}