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
  
  // Other Cloud Resources
  lambda_count: number;
  dynamodb_count: number;
  cloudfront_count: number;
  route53_count: number;
  elasticache_count: number;
  efs_count: number;
  monitoring_count: number;
  messaging_count: number;
  
  // Aggregate Features
  total_resources: number;
  infrastructure_complexity: number;
  estimated_monthly_cost: number;
}

// EC2 instance type specifications
const EC2_SPECS: Record<string, { vcpu: number; memory: number }> = {
  't2.nano': { vcpu: 1, memory: 0.5 },
  't2.micro': { vcpu: 1, memory: 1 },
  't2.small': { vcpu: 1, memory: 2 },
  't2.medium': { vcpu: 2, memory: 4 },
  't2.large': { vcpu: 2, memory: 8 },
  't2.xlarge': { vcpu: 4, memory: 16 },
  't2.2xlarge': { vcpu: 8, memory: 32 },
  't3.nano': { vcpu: 2, memory: 0.5 },
  't3.micro': { vcpu: 2, memory: 1 },
  't3.small': { vcpu: 2, memory: 2 },
  't3.medium': { vcpu: 2, memory: 4 },
  't3.large': { vcpu: 2, memory: 8 },
  't3.xlarge': { vcpu: 4, memory: 16 },
  't3.2xlarge': { vcpu: 8, memory: 32 },
  't3a.nano': { vcpu: 2, memory: 0.5 },
  't3a.micro': { vcpu: 2, memory: 1 },
  't3a.small': { vcpu: 2, memory: 2 },
  't3a.medium': { vcpu: 2, memory: 4 },
  't3a.large': { vcpu: 2, memory: 8 },
  'm5.large': { vcpu: 2, memory: 8 },
  'm5.xlarge': { vcpu: 4, memory: 16 },
  'm5.2xlarge': { vcpu: 8, memory: 32 },
  'm5.4xlarge': { vcpu: 16, memory: 64 },
  'm5.8xlarge': { vcpu: 32, memory: 128 },
  'm5a.large': { vcpu: 2, memory: 8 },
  'm5a.xlarge': { vcpu: 4, memory: 16 },
  'm5a.2xlarge': { vcpu: 8, memory: 32 },
  'c5.large': { vcpu: 2, memory: 4 },
  'c5.xlarge': { vcpu: 4, memory: 8 },
  'c5.2xlarge': { vcpu: 8, memory: 16 },
  'c5.4xlarge': { vcpu: 16, memory: 32 },
  'r5.large': { vcpu: 2, memory: 16 },
  'r5.xlarge': { vcpu: 4, memory: 32 },
  'r5.2xlarge': { vcpu: 8, memory: 64 },
  'r5.4xlarge': { vcpu: 16, memory: 128 },
};

// RDS instance type specifications
const RDS_SPECS: Record<string, { memory: number }> = {
  'db.t3.micro': { memory: 1 },
  'db.t3.small': { memory: 2 },
  'db.t3.medium': { memory: 4 },
  'db.t3.large': { memory: 8 },
  'db.t3.xlarge': { memory: 16 },
  'db.t3.2xlarge': { memory: 32 },
  'db.t2.micro': { memory: 1 },
  'db.t2.small': { memory: 2 },
  'db.t2.medium': { memory: 4 },
  'db.m5.large': { memory: 8 },
  'db.m5.xlarge': { memory: 16 },
  'db.m5.2xlarge': { memory: 32 },
  'db.r5.large': { memory: 16 },
  'db.r5.xlarge': { memory: 32 },
  'db.r5.2xlarge': { memory: 64 },
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
    cloudfront_count: 0,
    route53_count: 0,
    elasticache_count: 0,
    efs_count: 0,
    monitoring_count: 0,
    messaging_count: 0,
    total_resources: 0,
    infrastructure_complexity: 0,
    estimated_monthly_cost: 0,
  };

  for (const resource of resources) {
    const rawCount = resource.attributes._count;
    const count = typeof rawCount === 'number' ? rawCount : 1;
    if (count === 0) continue;

    features.total_resources += count;

    // EC2 Instances
    if (resource.type === 'aws_instance') {
      features.ec2_count += count;
      const instanceType = resource.attributes.instance_type || 't2.micro';
      const specs = EC2_SPECS[instanceType] || { vcpu: 2, memory: 4 };
      features.ec2_total_vcpu += specs.vcpu * count;
      features.ec2_total_memory += specs.memory * count;

      // Add root EBS volume to storage total
      if (resource.attributes.root_block_device) {
        features.ebs_volume_count += count;
        features.ebs_total_gb += (resource.attributes.root_block_device.volume_size || 30) * count;
      } else if (resource.attributes.volume_size) {
        features.ebs_volume_count += count;
        features.ebs_total_gb += (parseInt(resource.attributes.volume_size, 10) || 30) * count;
      }
    }

    // RDS Instances
    else if (resource.type === 'aws_db_instance') {
      features.rds_count += count;
      const instanceClass = resource.attributes.instance_class || 'db.t3.micro';
      const specs = RDS_SPECS[instanceClass] || { memory: 2 };
      features.rds_total_memory += specs.memory * count;
      const storage = parseInt(resource.attributes.allocated_storage, 10) || 20;
      features.rds_total_storage += storage * count;
      if (resource.attributes.multi_az) {
        features.rds_multi_az = 1;
      }
    }

    // EBS Volumes
    else if (resource.type === 'aws_ebs_volume') {
      features.ebs_volume_count += count;
      const size = parseInt(resource.attributes.size, 10) || 100;
      features.ebs_total_gb += size * count;
    }

    // S3 Buckets
    else if (resource.type === 'aws_s3_bucket') {
      features.s3_bucket_count += count;
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

    // VPC & Subnets
    else if (resource.type === 'aws_vpc') {
      features.has_vpc = 1;
    } else if (resource.type === 'aws_subnet') {
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

    // CloudFront
    else if (resource.type === 'aws_cloudfront_distribution') {
      features.cloudfront_count += count;
    }

    // Route53
    else if (resource.type === 'aws_route53_zone') {
      features.route53_count += count;
    }

    // ElastiCache
    else if (resource.type === 'aws_elasticache_cluster') {
      features.elasticache_count += count;
    }

    // EFS
    else if (resource.type === 'aws_efs_file_system') {
      features.efs_count += count;
    }

    // CloudWatch
    else if (resource.type === 'aws_cloudwatch_log_group') {
      features.monitoring_count += count;
    }

    // SNS / SQS
    else if (resource.type === 'aws_sns_topic' || resource.type === 'aws_sqs_queue') {
      features.messaging_count += count;
    }
  }

  // Calculate infrastructure complexity
  features.infrastructure_complexity = calculateComplexity(features);

  // Calculate baseline monthly cost
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
    features.has_vpc,
    features.lambda_count > 0 ? 1 : 0,
    features.dynamodb_count > 0 ? 1 : 0,
    features.cloudfront_count > 0 ? 1 : 0,
    features.elasticache_count > 0 ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  
  complexity += resourceTypes * 10;
  complexity += features.total_resources * 2;
  complexity += features.ec2_total_vcpu * 3;
  complexity += features.rds_count * 5;
  if (features.has_nat_gateway) complexity += 15;
  if (features.has_load_balancer) complexity += 10;
  if (features.rds_multi_az) complexity += 10;
  
  return complexity;
}

function calculateEstimatedCost(features: MLFeatures): number {
  let cost = 0;
  
  cost += (features.ec2_total_vcpu * 8.5) + (features.ec2_total_memory * 3.2);
  const rdsMultiplier = features.rds_multi_az ? 2.0 : 1.0;
  cost += ((features.rds_total_memory * 7.5) + (features.rds_total_storage * 0.115)) * rdsMultiplier;
  cost += features.ebs_total_gb * 0.08;
  cost += features.s3_total_gb * 0.023;
  if (features.has_nat_gateway) cost += 37.35;
  if (features.has_load_balancer) cost += 16.43;
  cost += features.lambda_count * 5;
  cost += features.dynamodb_count * 5.5;
  cost += features.cloudfront_count * 42.5;
  cost += features.route53_count * 0.90;
  cost += features.elasticache_count * 24.82;
  cost += features.efs_count * 30.0;
  cost += features.monitoring_count * 5.30;
  cost += features.messaging_count * 0.90;
  
  return parseFloat(cost.toFixed(2));
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
