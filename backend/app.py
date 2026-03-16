"""
Terraform Cost Predictor - FastAPI Backend
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="Terraform Cost Predictor API",
    description="ML-powered infrastructure cost prediction from Terraform configurations",
    version="1.0.0",
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/")
async def root():
    return {
        "service": "Terraform Cost Predictor",
        "version": "1.0.0",
        "docs": "/docs",
    }
