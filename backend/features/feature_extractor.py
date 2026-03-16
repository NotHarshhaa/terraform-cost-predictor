"""
Infrastructure feature extraction from parsed Terraform resources.
Converts Terraform configuration into ML-ready features.
"""

from typing import Dict, List, Any

# Instance type pricing tiers (relative cost multiplier)
INSTANCE_TYPE_TIERS = {
    "t2.nano": 0.1, "t2.micro": 0.2, "t2.small": 0.4, "t2.medium": 0.8,
    "t2.large": 1.5, "t2.xlarge": 3.0, "t2.2xlarge": 6.0,
    "t3.nano": 0.1, "t3.micro": 0.2, "t3.small": 0.35, "t3.medium": 0.7,
    "t3.large": 1.4, "t3.xlarge": 2.7, "t3.2xlarge": 5.5,
    "m5.large": 1.6, "m5.xlarge": 3.2, "m5.2xlarge": 6.4, "m5.4xlarge": 12.8,
    "m6i.large": 1.6, "m6i.xlarge": 3.2, "m6i.2xlarge": 6.4,
    "c5.large": 1.4, "c5.xlarge": 2.8, "c5.2xlarge": 5.6, "c5.4xlarge": 11.2,
    "r5.large": 2.1, "r5.xlarge": 4.2, "r5.2xlarge": 8.4,
    "g4dn.xlarge": 8.8, "p3.2xlarge": 50.0,
}

# RDS instance pricing tiers
RDS_INSTANCE_TIERS = {
    "db.t3.micro": 0.3, "db.t3.small": 0.6, "db.t3.medium": 1.2,
    "db.t3.large": 2.4, "db.t3.xlarge": 4.8,
    "db.m5.large": 2.8, "db.m5.xlarge": 5.6, "db.m5.2xlarge": 11.2,
    "db.r5.large": 4.2, "db.r5.xlarge": 8.4, "db.r5.2xlarge": 16.8,
}

# RDS engine cost multipliers
RDS_ENGINE_MULTIPLIERS = {
    "mysql": 1.0, "postgres": 1.05, "mariadb": 1.0,
    "aurora": 1.3, "aurora-mysql": 1.3, "aurora-postgresql": 1.35,
    "oracle-ee": 2.5, "sqlserver-ee": 3.0, "sqlserver-se": 2.0,
}


def _resolve_value(val: Any) -> Any:
    """Resolve HCL2 values (which may be wrapped in lists)."""
    if isinstance(val, list) and len(val) == 1:
        return val[0]
    return val


def extract_ec2_features(config: Dict[str, Any]) -> Dict[str, Any]:
    """Extract features from an EC2 instance resource."""
    instance_type = _resolve_value(config.get("instance_type", "t3.medium"))
    count = _resolve_value(config.get("count", 1))
    if isinstance(count, str):
        try:
            count = int(count)
        except ValueError:
            count = 1

    tier = INSTANCE_TYPE_TIERS.get(str(instance_type), 1.0)

    # Check for root block device
    root_volume_size = 8  # default
    root_block = config.get("root_block_device")
    if root_block:
        rbd = _resolve_value(root_block)
        if isinstance(rbd, dict):
            root_volume_size = _resolve_value(rbd.get("volume_size", 8))
        elif isinstance(rbd, list) and len(rbd) > 0:
            root_volume_size = _resolve_value(rbd[0].get("volume_size", 8))

    return {
        "instance_type": str(instance_type),
        "instance_count": int(count) if count else 1,
        "instance_tier": tier,
        "root_volume_size_gb": int(root_volume_size) if root_volume_size else 8,
    }


def extract_rds_features(config: Dict[str, Any]) -> Dict[str, Any]:
    """Extract features from an RDS instance resource."""
    instance_class = _resolve_value(config.get("instance_class", "db.t3.micro"))
    engine = _resolve_value(config.get("engine", "mysql"))
    allocated_storage = _resolve_value(config.get("allocated_storage", 20))
    multi_az = _resolve_value(config.get("multi_az", False))
    storage_type = _resolve_value(config.get("storage_type", "gp2"))

    tier = RDS_INSTANCE_TIERS.get(str(instance_class), 1.0)
    engine_mult = RDS_ENGINE_MULTIPLIERS.get(str(engine), 1.0)

    return {
        "instance_class": str(instance_class),
        "engine": str(engine),
        "allocated_storage_gb": int(allocated_storage) if allocated_storage else 20,
        "multi_az": bool(multi_az),
        "storage_type": str(storage_type),
        "rds_tier": tier,
        "engine_multiplier": engine_mult,
    }


def extract_s3_features(config: Dict[str, Any]) -> Dict[str, Any]:
    """Extract features from an S3 bucket resource."""
    versioning = False
    v_config = config.get("versioning")
    if v_config:
        v_config = _resolve_value(v_config)
        if isinstance(v_config, dict):
            versioning = _resolve_value(v_config.get("enabled", False))

    return {
        "versioning_enabled": bool(versioning),
    }


def extract_lb_features(config: Dict[str, Any]) -> Dict[str, Any]:
    """Extract features from a load balancer resource."""
    lb_type = _resolve_value(config.get("load_balancer_type", "application"))
    internal = _resolve_value(config.get("internal", False))

    return {
        "lb_type": str(lb_type),
        "internal": bool(internal),
    }


def extract_ebs_features(config: Dict[str, Any]) -> Dict[str, Any]:
    """Extract features from an EBS volume resource."""
    size = _resolve_value(config.get("size", 20))
    vol_type = _resolve_value(config.get("type", "gp2"))
    iops = _resolve_value(config.get("iops", 0))

    return {
        "volume_size_gb": int(size) if size else 20,
        "volume_type": str(vol_type),
        "iops": int(iops) if iops else 0,
    }


def extract_features_from_resources(resources: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Extract ML features from all detected resources.
    Returns a feature dictionary ready for model prediction.
    """
    features = {
        "total_resources": len(resources),
        "ec2_count": 0,
        "ec2_total_instances": 0,
        "ec2_avg_tier": 0.0,
        "ec2_total_storage_gb": 0,
        "rds_count": 0,
        "rds_avg_tier": 0.0,
        "rds_total_storage_gb": 0,
        "rds_multi_az_count": 0,
        "rds_avg_engine_mult": 0.0,
        "s3_count": 0,
        "s3_versioning_count": 0,
        "lb_count": 0,
        "ebs_count": 0,
        "ebs_total_size_gb": 0,
        "networking_count": 0,
        "other_count": 0,
        "load_balancer_enabled": 0,
    }

    ec2_tiers = []
    rds_tiers = []
    rds_engine_mults = []
    resource_details = []

    for res in resources:
        category = res.get("category", "Other")
        config = res.get("config", {})

        if category == "EC2":
            ec2_feat = extract_ec2_features(config)
            features["ec2_count"] += 1
            features["ec2_total_instances"] += ec2_feat["instance_count"]
            features["ec2_total_storage_gb"] += ec2_feat["root_volume_size_gb"] * ec2_feat["instance_count"]
            ec2_tiers.append(ec2_feat["instance_tier"])
            resource_details.append({
                "name": res["name"],
                "type": res["type"],
                "category": category,
                "features": ec2_feat,
            })

        elif category == "RDS":
            rds_feat = extract_rds_features(config)
            features["rds_count"] += 1
            features["rds_total_storage_gb"] += rds_feat["allocated_storage_gb"]
            if rds_feat["multi_az"]:
                features["rds_multi_az_count"] += 1
            rds_tiers.append(rds_feat["rds_tier"])
            rds_engine_mults.append(rds_feat["engine_multiplier"])
            resource_details.append({
                "name": res["name"],
                "type": res["type"],
                "category": category,
                "features": rds_feat,
            })

        elif category == "S3":
            s3_feat = extract_s3_features(config)
            features["s3_count"] += 1
            if s3_feat["versioning_enabled"]:
                features["s3_versioning_count"] += 1
            resource_details.append({
                "name": res["name"],
                "type": res["type"],
                "category": category,
                "features": s3_feat,
            })

        elif category == "LoadBalancer":
            lb_feat = extract_lb_features(config)
            features["lb_count"] += 1
            features["load_balancer_enabled"] = 1
            resource_details.append({
                "name": res["name"],
                "type": res["type"],
                "category": category,
                "features": lb_feat,
            })

        elif category == "EBS":
            ebs_feat = extract_ebs_features(config)
            features["ebs_count"] += 1
            features["ebs_total_size_gb"] += ebs_feat["volume_size_gb"]
            resource_details.append({
                "name": res["name"],
                "type": res["type"],
                "category": category,
                "features": ebs_feat,
            })

        elif category == "Networking":
            features["networking_count"] += 1
            resource_details.append({
                "name": res["name"],
                "type": res["type"],
                "category": category,
                "features": {},
            })

        else:
            features["other_count"] += 1
            resource_details.append({
                "name": res["name"],
                "type": res["type"],
                "category": category,
                "features": {},
            })

    # Compute averages
    if ec2_tiers:
        features["ec2_avg_tier"] = sum(ec2_tiers) / len(ec2_tiers)
    if rds_tiers:
        features["rds_avg_tier"] = sum(rds_tiers) / len(rds_tiers)
    if rds_engine_mults:
        features["rds_avg_engine_mult"] = sum(rds_engine_mults) / len(rds_engine_mults)

    return {
        "features": features,
        "resource_details": resource_details,
    }
