"""
API routes for Terraform Cost Predictor.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
from parser.terraform_parser import parse_terraform_files, extract_resources
from features.feature_extractor import extract_features_from_resources
from model.cost_model import predict_cost

router = APIRouter()


@router.post("/predict")
async def predict_infrastructure_cost(files: List[UploadFile] = File(...)):
    """
    Upload Terraform files and predict infrastructure cost.
    Accepts multiple .tf files.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # Read file contents
    tf_files = {}
    for f in files:
        if not f.filename.endswith(".tf"):
            continue
        content = await f.read()
        tf_files[f.filename] = content.decode("utf-8")

    if not tf_files:
        raise HTTPException(
            status_code=400,
            detail="No valid Terraform (.tf) files found in upload"
        )

    # Parse Terraform files
    try:
        parsed = parse_terraform_files(tf_files)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Parsing error: {str(e)}")

    # Extract resources
    resources = extract_resources(parsed)

    if not resources:
        return {
            "estimated_monthly_cost": 0,
            "confidence_score": 0,
            "breakdown": {},
            "resources": [],
            "total_resources": 0,
            "model_type": "N/A",
            "currency": "USD",
            "message": "No AWS resources detected in the uploaded Terraform files.",
            "parse_errors": parsed.get("errors", []),
        }

    # Extract features
    extraction = extract_features_from_resources(resources)
    features = extraction["features"]
    resource_details = extraction["resource_details"]

    # Predict cost
    prediction = predict_cost(features, resource_details)

    return {
        **prediction,
        "resources": resource_details,
        "total_resources": features["total_resources"],
        "features": features,
        "parse_errors": parsed.get("errors", []),
    }


@router.post("/parse")
async def parse_terraform(files: List[UploadFile] = File(...)):
    """
    Parse Terraform files and return detected resources without cost prediction.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    tf_files = {}
    for f in files:
        if not f.filename.endswith(".tf"):
            continue
        content = await f.read()
        tf_files[f.filename] = content.decode("utf-8")

    if not tf_files:
        raise HTTPException(
            status_code=400,
            detail="No valid Terraform (.tf) files found in upload"
        )

    try:
        parsed = parse_terraform_files(tf_files)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Parsing error: {str(e)}")

    resources = extract_resources(parsed)

    return {
        "resources": resources,
        "total_resources": len(resources),
        "files_parsed": list(tf_files.keys()),
        "parse_errors": parsed.get("errors", []),
    }


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "terraform-cost-predictor"}
