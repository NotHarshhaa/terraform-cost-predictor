import { TerraformResource } from './parser';

/**
 * Feature extraction for ML model input
 * Converts Terraform resources into ML-ready feature vectors
 */

export interface MLFeatures {
  // EC2 Features
  ec2_count: number;
  ec2_total_memory: number;
  ec2_total_vcpu: number;
  
  // RDS Features
  rds_count: number;
  rds_total_memory: number;
  rds_total_storage: number;
  rds_multi_az: number;
  
  // Storage Features
  ebs_volume_count: number;
  ebs_total_gb: number;
  s3_bucket_count: number;
  s3_total_gb: number;
  
  // Networking Features
  has_nat_gateway: number;
  has_load_balancer: number;
  has_vpc: number;
  subnet_count: number;
  
  // Other Resources
  lambda_count: number;
  dynamodb_count: number;
  
  // Aggregate Features
  total_resources: number;
  infrastructure_complexity: number;
  estimated_monthly_cost: number;
}

// EC2 instance type specifications
const EC2_SPECS: Record<string, { vcpu: number; memory: number }> = {
  't2.micro': { vcpu: 1, memory: 1 },
  't2.small': { vcpu: 1, memory: 2 },
  't2.medium': { vcpu: 2, memory: 4 },
  't2.large': { vcpu: 2, memory: 8 },
  't2.xlarge': { vcpu: 4, memory: 16 },
  't2.2xlarge': { vcpu: 8, memory: 32 },
  't3.micro': { vcpu: 2, memory: 1 },
  't3.small': { vcpu: 2, memory: 2 },
  't3.medium': { vcpu: 2, memory: 4 },
  't3.large': { vcpu: 2, memory: 8 },
  't3.xlarge': { vcpu: 4, memory: 16 },
  't3.2xlarge': { vcpu: 8, memory: 32 },
  'm5.large': { vcpu: 2, memory: 8 },
  'm5.xlarge': { vcpu: 4, memory: 16 },
  'm5.2xlarge': { vcpu: 8, memory: 32 },
  'm5.4xlarge': { vcpu: 16, memory: 64 },
  'c5.large': { vcpu: 2, memory: 4 },
  'c5.xlarge': { vcpu: 4, memory: 8 },
  'c5.2xlarge': { vcpu: 8, memory: 16 },
  'r5.large': { vcpu: 2, memory: 16 },
  'r5.xlarge': { vcpu: 4, memory: 32 },
  'r5.2xlarge': { vcpu: 8, memory: 64 },
};

// RDS instance type specifications
const RDS_SPECS: Record<string, { memory: number }> = {
  'db.t3.micro': { memory: 1 },
  'db.t3.small': { memory: 2 },
  'db.t3.medium': { memory: 4 },
  'db.t3.large': { memory: 8 },
  'db.t2.micro': { memory: 1 },
  'db.t2.small': { memory: 2 },
  'db.t2.medium': { memory: 4 },
  'db.m5.large': { memory: 8 },
  'db.m5.xlarge': { memory: 16 },
  'db.r5.large': { memory: 16 },
  'db.r5.xlarge': { memory: 32 },
};

export function extractMLFeatures(resources: TerraformResource[]): MLFeatures {
  const features: MLFeatures = {
    ec2_count: 0,
    ec2_total_memory: 0,
    ec2_total_vcpu: 0,
    rds_count: 0,
    rds_total_memory: 0,
    rds_total_storage: 0,
    rds_multi_az: 0,
    ebs_volume_count: 0,
    ebs_total_gb: 0,
    s3_bucket_count: 0,
    s3_total_gb: 0,
    has_nat_gateway: 0,
    has_load_balancer: 0,
    has_vpc: 0,
    subnet_count: 0,
    lambda_count: 0,
    dynamodb_count: 0,
    total_resources: resources.length,
    infrastructure_complexity: 0,
    estimated_monthly_cost: 0,
  };

  for (const resource of resources) {
    const count = resource.attributes._count || 1;

    // EC2 Instances
    if (resource.type === 'aws_instance') {
      features.ec2_count += count;
      const instanceType = resource.attributes.instance_type || 't2.micro';
      const specs = EC2_SPECS[instanceType] || { vcpu: 1, memory: 1 };
      features.ec2_total_vcpu += specs.vcpu * count;
      features.ec2_total_memory += specs.memory * count;
    }

    // RDS Instances
    else if (resource.type === 'aws_db_instance') {
      features.rds_count += count;
      const instanceClass = resource.attributes.instance_class || 'db.t3.micro';
      const specs = RDS_SPECS[instanceClass] || { memory: 1 };
      features.rds_total_memory += specs.memory * count;
      features.rds_total_storage += (parseInt(resource.attributes.allocated_storage) || 20) * count;
      if (resource.attributes.multi_az) {
        features.rds_multi_az = 1;
      }
    }

    // EBS Volumes
    else if (resource.type === 'aws_ebs_volume') {
      features.ebs_volume_count += count;
      features.ebs_total_gb += (parseInt(resource.attributes.size) || 100) * count;
    }

    // S3 Buckets
    else if (resource.type === 'aws_s3_bucket') {
      features.s3_bucket_count += count;
      // Estimate 100GB per bucket
      features.s3_total_gb += 100 * count;
    }

    // NAT Gateway
    else if (resource.type === 'aws_nat_gateway') {
      features.has_nat_gateway = 1;
    }

    // Load Balancers
    else if (resource.type === 'aws_lb' || resource.type === 'aws_alb' || resource.type === 'aws_elb') {
      features.has_load_balancer = 1;
    }

    // VPC
    else if (resource.type === 'aws_vpc') {
      features.has_vpc = 1;
    }

    // Subnets
    else if (resource.type === 'aws_subnet') {
      features.subnet_count += count;
    }

    // Lambda Functions
    else if (resource.type === 'aws_lambda_function') {
      features.lambda_count += count;
    }

    // DynamoDB Tables
    else if (resource.type === 'aws_dynamodb_table') {
      features.dynamodb_count += count;
    }
  }

  // Calculate infrastructure complexity
  features.infrastructure_complexity = calculateComplexity(features);

  // Calculate estimated monthly cost (used as a feature)
  features.estimated_monthly_cost = calculateEstimatedCost(features);

  return features;
}

function calculateComplexity(features: MLFeatures): number {
  let complexity = 0;
  
  // Resource diversity
  const resourceTypes = [
    features.ec2_count > 0 ? 1 : 0,
    features.rds_count > 0 ? 1 : 0,
    features.ebs_volume_count > 0 ? 1 : 0,
    features.s3_bucket_count > 0 ? 1 : 0,
    features.has_nat_gateway,
    features.has_load_balancer,
    features.lambda_count > 0 ? 1 : 0,
    features.dynamodb_count > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  
  complexity += resourceTypes * 10;
  
  // Total resource count
  complexity += features.total_resources * 2;
  
  // Compute intensity
  complexity += features.ec2_total_vcpu * 3;
  complexity += features.rds_count * 5;
  
  // Networking complexity
  if (features.has_nat_gateway) complexity += 15;
  if (features.has_load_balancer) complexity += 10;
  
  return complexity;
}

function calculateEstimatedCost(features: MLFeatures): number {
  let cost = 0;
  
  // EC2 costs (rough estimate)
  cost += features.ec2_count * 30; // ~$30 per instance
  
  // RDS costs
  cost += features.rds_count * 60; // ~$60 per RDS instance
  cost += features.rds_total_storage * 0.115; // Storage cost
  
  // EBS costs
  cost += features.ebs_total_gb * 0.10; // GP2 pricing
  
  // S3 costs
  cost += features.s3_total_gb * 0.023; // Standard storage
  
  // NAT Gateway
  if (features.has_nat_gateway) cost += 32.85;
  
  // Load Balancer
  if (features.has_load_balancer) cost += 16.43;
  
  // Lambda (minimal)
  cost += features.lambda_count * 2;
  
  // DynamoDB (minimal)
  cost += features.dynamodb_count * 5;
  
  return cost;
}

export function featuresToArray(features: MLFeatures): number[] {
  return [
    features.ec2_count,
    features.ec2_total_memory,
    features.ec2_total_vcpu,
    features.rds_count,
    features.rds_total_memory,
    features.rds_total_storage,
    features.rds_multi_az,
    features.ebs_volume_count,
    features.ebs_total_gb,
    features.s3_bucket_count,
    features.s3_total_gb,
    features.has_nat_gateway,
    features.has_load_balancer,
    features.has_vpc,
    features.subnet_count,
    features.lambda_count,
    features.dynamodb_count,
    features.total_resources,
    features.infrastructure_complexity,
    features.estimated_monthly_cost,
  ];
}
