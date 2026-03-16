"""
Terraform configuration parser.
Parses .tf files and extracts infrastructure resources.
"""

import hcl2
import json
import io
from typing import Dict, List, Any


# Known AWS resource types and their categories
RESOURCE_CATEGORIES = {
    "aws_instance": "EC2",
    "aws_launch_template": "EC2",
    "aws_autoscaling_group": "EC2",
    "aws_s3_bucket": "S3",
    "aws_s3_bucket_versioning": "S3",
    "aws_db_instance": "RDS",
    "aws_rds_cluster": "RDS",
    "aws_lb": "LoadBalancer",
    "aws_alb": "LoadBalancer",
    "aws_elb": "LoadBalancer",
    "aws_ebs_volume": "EBS",
    "aws_eip": "Networking",
    "aws_nat_gateway": "Networking",
    "aws_vpc": "Networking",
    "aws_subnet": "Networking",
    "aws_internet_gateway": "Networking",
    "aws_route_table": "Networking",
    "aws_security_group": "Networking",
    "aws_lambda_function": "Lambda",
    "aws_dynamodb_table": "DynamoDB",
    "aws_elasticache_cluster": "ElastiCache",
    "aws_cloudfront_distribution": "CloudFront",
    "aws_sqs_queue": "SQS",
    "aws_sns_topic": "SNS",
    "aws_ecs_cluster": "ECS",
    "aws_ecs_service": "ECS",
    "aws_ecs_task_definition": "ECS",
    "aws_eks_cluster": "EKS",
}


def parse_terraform_content(content: str) -> Dict[str, Any]:
    """Parse a single Terraform file content and extract resources."""
    try:
        parsed = hcl2.load(io.StringIO(content))
        return parsed
    except Exception as e:
        raise ValueError(f"Failed to parse Terraform file: {str(e)}")


def parse_terraform_files(files: Dict[str, str]) -> Dict[str, Any]:
    """
    Parse multiple Terraform files and extract all resources.
    files: dict of {filename: content}
    Returns combined parsed result.
    """
    all_resources = []
    all_variables = []
    all_data = []
    parse_errors = []

    for filename, content in files.items():
        try:
            parsed = parse_terraform_content(content)
            if "resource" in parsed:
                for resource_block in parsed["resource"]:
                    all_resources.append(resource_block)
            if "variable" in parsed:
                for var_block in parsed["variable"]:
                    all_variables.append(var_block)
            if "data" in parsed:
                for data_block in parsed["data"]:
                    all_data.append(data_block)
        except ValueError as e:
            parse_errors.append({"file": filename, "error": str(e)})

    return {
        "resources": all_resources,
        "variables": all_variables,
        "data": all_data,
        "errors": parse_errors,
    }


def extract_resources(parsed: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract individual resources with their type, name, and configuration.
    """
    resources = []

    for resource_block in parsed.get("resources", []):
        for resource_type, instances in resource_block.items():
            for instance in instances if isinstance(instances, list) else [instances]:
                if isinstance(instance, dict):
                    for resource_name, config in instance.items():
                        category = RESOURCE_CATEGORIES.get(resource_type, "Other")
                        res = {
                            "type": resource_type,
                            "name": resource_name,
                            "category": category,
                            "config": config if isinstance(config, dict) else {},
                        }
                        resources.append(res)

    return resources
