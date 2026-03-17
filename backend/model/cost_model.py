"""
ML-based cost prediction model for Terraform infrastructure.
Uses trained machine learning models for accurate cost estimation.
"""

import numpy as np
from typing import Dict, Any, List
import sys
import os

# Add the ml directory to the path to import our ML modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'ml'))

try:
    from ml_predictor import get_predictor
    ML_AVAILABLE = True
except ImportError:
    ML_AVAILABLE = False
    print("Warning: ML predictor not available, using rule-based fallback")


def predict_cost(features: Dict[str, Any], resource_details: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Predict infrastructure cost using trained ML models.
    
    Args:
        features: Extracted features from terraform configuration
        resource_details: Detailed resource information
        
    Returns:
        Prediction results with cost, confidence, and breakdown
    """
    if ML_AVAILABLE:
        # Use the trained ML predictor
        predictor = get_predictor()
        return predictor.predict_cost(features, resource_details)
    else:
        # Fallback to rule-based estimation
        return _rule_based_prediction(features, resource_details)


def _rule_based_prediction(features: Dict[str, Any], resource_details: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Rule-based cost estimation as fallback.
    This is the original implementation for when ML is not available.
    """
    
    # Base monthly costs (USD) for AWS resources - approximate
    BASE_COSTS = {
        "EC2": {
            "base_per_instance": 30.0,  # base cost per instance
            "tier_multiplier": 50.0,    # multiplied by instance tier
            "storage_per_gb": 0.10,     # EBS cost per GB
        },
        "RDS": {
            "base": 25.0,
            "tier_multiplier": 80.0,
            "storage_per_gb": 0.115,
            "multi_az_multiplier": 2.0,
        },
        "S3": {
            "base_per_bucket": 3.0,
            "versioning_extra": 2.0,
        },
        "LoadBalancer": {
            "alb": 22.0,
            "nlb": 22.0,
            "clb": 18.0,
        },
        "EBS": {
            "gp2_per_gb": 0.10,
            "gp3_per_gb": 0.08,
            "io1_per_gb": 0.125,
            "st1_per_gb": 0.045,
            "sc1_per_gb": 0.025,
            "iops_cost": 0.065,
        },
        "Networking": {
            "nat_gateway": 32.0,
            "eip": 3.6,
            "vpc": 0.0,
            "subnet": 0.0,
            "igw": 0.0,
            "route_table": 0.0,
            "security_group": 0.0,
        },
        "Lambda": {"base": 5.0},
        "DynamoDB": {"base": 10.0},
        "ElastiCache": {"base": 25.0},
        "CloudFront": {"base": 15.0},
        "SQS": {"base": 2.0},
        "SNS": {"base": 1.0},
        "ECS": {"base": 20.0},
        "EKS": {"base": 73.0},
        "Other": {"base": 5.0},
    }

    breakdown = {}
    total_cost = 0.0

    # EC2 cost estimation
    if features["ec2_count"] > 0:
        ec2_cost = 0.0
        for rd in resource_details:
            if rd["category"] == "EC2":
                feat = rd["features"]
                count = feat.get("instance_count", 1)
                tier = feat.get("instance_tier", 1.0)
                storage = feat.get("root_volume_size_gb", 8)
                instance_cost = (
                    BASE_COSTS["EC2"]["base_per_instance"]
                    + BASE_COSTS["EC2"]["tier_multiplier"] * tier
                    + BASE_COSTS["EC2"]["storage_per_gb"] * storage
                ) * count
                ec2_cost += instance_cost
        breakdown["EC2"] = round(ec2_cost, 2)
        total_cost += ec2_cost

    # RDS cost estimation
    if features["rds_count"] > 0:
        rds_cost = 0.0
        for rd in resource_details:
            if rd["category"] == "RDS":
                feat = rd["features"]
                tier = feat.get("rds_tier", 1.0)
                engine_mult = feat.get("engine_multiplier", 1.0)
                storage = feat.get("allocated_storage_gb", 20)
                multi_az = feat.get("multi_az", False)
                instance_cost = (
                    BASE_COSTS["RDS"]["base"]
                    + BASE_COSTS["RDS"]["tier_multiplier"] * tier * engine_mult
                    + BASE_COSTS["RDS"]["storage_per_gb"] * storage
                )
                if multi_az:
                    instance_cost *= BASE_COSTS["RDS"]["multi_az_multiplier"]
                rds_cost += instance_cost
        breakdown["RDS"] = round(rds_cost, 2)
        total_cost += rds_cost

    # S3 cost estimation
    if features["s3_count"] > 0:
        s3_cost = features["s3_count"] * BASE_COSTS["S3"]["base_per_bucket"]
        s3_cost += features["s3_versioning_count"] * BASE_COSTS["S3"]["versioning_extra"]
        breakdown["S3"] = round(s3_cost, 2)
        total_cost += s3_cost

    # Load Balancer cost
    if features["lb_count"] > 0:
        lb_cost = features["lb_count"] * BASE_COSTS["LoadBalancer"]["alb"]
        breakdown["LoadBalancer"] = round(lb_cost, 2)
        total_cost += lb_cost

    # EBS cost
    if features["ebs_count"] > 0:
        ebs_cost = 0.0
        for rd in resource_details:
            if rd["category"] == "EBS":
                feat = rd["features"]
                vol_type = feat.get("volume_type", "gp2")
                size = feat.get("volume_size_gb", 20)
                iops = feat.get("iops", 0)
                type_key = f"{vol_type}_per_gb"
                per_gb = BASE_COSTS["EBS"].get(type_key, BASE_COSTS["EBS"]["gp2_per_gb"])
                vol_cost = per_gb * size
                if iops > 0:
                    vol_cost += iops * BASE_COSTS["EBS"]["iops_cost"]
                ebs_cost += vol_cost
        breakdown["EBS"] = round(ebs_cost, 2)
        total_cost += ebs_cost

    # Networking cost
    if features["networking_count"] > 0:
        net_cost = 0.0
        for rd in resource_details:
            if rd["category"] == "Networking":
                rtype = rd["type"]
                if rtype == "aws_nat_gateway":
                    net_cost += BASE_COSTS["Networking"]["nat_gateway"]
                elif rtype == "aws_eip":
                    net_cost += BASE_COSTS["Networking"]["eip"]
                # VPC, subnet, IGW, etc. are free
        if net_cost == 0 and features["networking_count"] > 0:
            net_cost = 2.0  # minimal networking overhead
        breakdown["Networking"] = round(net_cost, 2)
        total_cost += net_cost

    # Other resource categories
    for rd in resource_details:
        cat = rd["category"]
        if cat not in ["EC2", "RDS", "S3", "LoadBalancer", "EBS", "Networking"]:
            if cat not in breakdown:
                breakdown[cat] = 0.0
            base = BASE_COSTS.get(cat, BASE_COSTS["Other"]).get("base", 5.0)
            breakdown[cat] = round(breakdown[cat] + base, 2)
            total_cost += base

    # Calculate confidence score based on resource coverage
    known_resources = sum(1 for r in resource_details if r["category"] != "Other")
    total_resources = len(resource_details) if resource_details else 1
    coverage = known_resources / total_resources if total_resources > 0 else 0

    # Confidence is higher when we know all resources
    confidence = min(0.95, 0.6 + (coverage * 0.35))

    # Add some ML-like variance based on feature complexity
    complexity_factor = 1.0
    if features["ec2_total_instances"] > 5:
        complexity_factor *= 0.97  # slight discount for scale
    if features["rds_multi_az_count"] > 0:
        complexity_factor *= 1.02  # slight premium for HA
    if features["load_balancer_enabled"]:
        complexity_factor *= 1.01

    total_cost *= complexity_factor

    return {
        "estimated_monthly_cost": round(total_cost, 2),
        "confidence_score": round(confidence * 100),
        "breakdown": breakdown,
        "model_type": "Rule-based (ML Fallback)",
        "currency": "USD",
    }


def get_model_info() -> Dict[str, Any]:
    """Get information about the prediction model."""
    if ML_AVAILABLE:
        predictor = get_predictor()
        return predictor.get_model_info()
    else:
        return {
            "status": "rule_based",
            "model_type": "Rule-based Estimation",
            "message": "ML model not available, using rule-based fallback"
        }
