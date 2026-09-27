import { TerraformResource } from './parser';
import { predictWithML, getFeatureImportance } from './ml-predictor';

// Enhanced AWS Pricing Data (US East - N. Virginia region, USD/month)
export const AWS_PRICING = {
  // EC2 Instance Types (monthly cost - 730 hours average)
  ec2: {
    't2.nano': 4.23,
    't2.micro': 8.47,
    't2.small': 16.79,
    't2.medium': 33.58,
    't2.large': 67.16,
    't2.xlarge': 134.32,
    't2.2xlarge': 268.64,
    't3.nano': 3.80,
    't3.micro': 7.59,
    't3.small': 15.18,
    't3.medium': 30.37,
    't3.large': 60.74,
    't3.xlarge': 121.47,
    't3.2xlarge': 242.93,
    't3a.nano': 3.43,
    't3a.micro': 6.84,
    't3a.small': 13.69,
    't3a.medium': 27.38,
    't3a.large': 54.75,
    't3a.xlarge': 109.50,
    't3a.2xlarge': 219.00,
    'm5.large': 70.08,
    'm5.xlarge': 140.16,
    'm5.2xlarge': 280.32,
    'm5.4xlarge': 560.64,
    'm5.8xlarge': 1121.28,
    'm5a.large': 62.78,
    'm5a.xlarge': 125.56,
    'm5a.2xlarge': 251.11,
    'c5.large': 62.05,
    'c5.xlarge': 124.10,
    'c5.2xlarge': 248.20,
    'c5.4xlarge': 496.40,
    'r5.large': 91.98,
    'r5.xlarge': 183.96,
    'r5.2xlarge': 367.92,
    'r5.4xlarge': 735.84,
  },
  // RDS Instance Types (monthly cost)
  rds: {
    'db.t3.micro': 14.97,
    'db.t3.small': 29.93,
    'db.t3.medium': 59.86,
    'db.t3.large': 119.72,
    'db.t3.xlarge': 239.45,
    'db.t3.2xlarge': 478.89,
    'db.t2.micro': 16.79,
    'db.t2.small': 33.58,
    'db.t2.medium': 67.16,
    'db.m5.large': 140.16,
    'db.m5.xlarge': 280.32,
    'db.m5.2xlarge': 560.64,
    'db.r5.large': 183.96,
    'db.r5.xlarge': 367.92,
    'db.r5.2xlarge': 735.84,
  },
  // Storage (per GB/month)
  storage: {
    ebs_gp3: 0.08,
    ebs_gp2: 0.10,
    ebs_io1: 0.125,
    ebs_io2: 0.125,
    ebs_st1: 0.045,
    ebs_sc1: 0.015,
    s3_standard: 0.023,
    s3_intelligent_tiering: 0.023,
    s3_standard_ia: 0.0125,
    s3_glacier: 0.004,
    rds_storage: 0.115,
    efs_standard: 0.30,
  },
  // Networking & Services (monthly cost)
  services: {
    nat_gateway: 32.85, // $0.045/hour * 730
    nat_gateway_data_processing: 0.045, // per GB
    load_balancer_alb: 16.43, // $0.0225/hour * 730
    load_balancer_nlb: 16.43,
    load_balancer_classic: 16.43,
    elastic_ip: 3.65, // unattached
    vpc: 0,
    internet_gateway: 0,
    subnet: 0,
    route_table: 0,
    security_group: 0,
    lambda_gb_second: 0.0000166667,
    lambda_requests: 0.0000002, // $0.20 per 1M requests
    // Monthly provisioned rates (hourly rate * 730 hours)
    dynamodb_rcu: 0.00013 * 730, // ~$0.0949 per RCU/month
    dynamodb_wcu: 0.00065 * 730, // ~$0.4745 per WCU/month
    cloudfront_data_transfer: 0.085, // per GB
    route53_hosted_zone: 0.50, // per zone per month
    route53_queries: 0.40, // per million queries
    elasticache_cache_node_t3_micro: 12.41,
    elasticache_cache_node_t3_small: 24.82,
    elasticache_cache_node_t3_medium: 49.64,
    elasticache_cache_node_m5_large: 116.80,
    elasticache_cache_node_r5_large: 153.30,
    sns_requests: 0.50, // per million
    sqs_requests: 0.40, // per million
    cloudwatch_metrics: 0.30, // per custom metric
  },
};

export interface ResourceCost {
  resource_type: string;
  resource_name: string;
  estimated_cost: number;
  confidence_score: number;
}

export interface CategoryBreakdown {
  category: string;
  total_cost: number;
  resource_count: number;
}

export interface CostPrediction {
  total_estimated_cost: number;
  confidence_score: number;
  resources: ResourceCost[];
  category_breakdown: CategoryBreakdown[];
  processing_time: number;
  model_type: string;
  currency: string;
  prediction_method: string;
  parse_errors?: string[];
}

/**
 * Rule-based Cost Estimation (deterministic breakdown per resource)
 */
export function estimateCost(resources: TerraformResource[]): CostPrediction {
  const startTime = Date.now();
  const resourceCosts: ResourceCost[] = [];
  const categoryMap = new Map<string, { total: number; count: number }>();

  for (const resource of resources) {
    const rawCount = resource.attributes._count;
    const count = typeof rawCount === 'number' ? rawCount : 1;
    
    // If resource is conditionally disabled (count = 0)
    if (count === 0) {
      resourceCosts.push({
        resource_type: resource.type,
        resource_name: resource.name,
        estimated_cost: 0,
        confidence_score: 1.0,
      });
      continue;
    }

    let cost = 0;
    let confidence = 0.85;
    let category = 'Other';

    // EC2 Instances
    if (resource.type === 'aws_instance') {
      category = 'EC2';
      const instanceType = resource.attributes.instance_type || 't2.micro';
      const baseCost = AWS_PRICING.ec2[instanceType as keyof typeof AWS_PRICING.ec2] || 50;
      let instanceCost = baseCost;

      // Add root EBS block device storage
      if (resource.attributes.root_block_device) {
        const rootSize = resource.attributes.root_block_device.volume_size || 30;
        const rootType = resource.attributes.root_block_device.volume_type || 'gp3';
        const priceKey = `ebs_${rootType}` as keyof typeof AWS_PRICING.storage;
        const storagePrice = AWS_PRICING.storage[priceKey] || AWS_PRICING.storage.ebs_gp3;
        instanceCost += rootSize * storagePrice;
      } else if (resource.attributes.volume_size) {
        const rootSize = parseInt(resource.attributes.volume_size, 10) || 30;
        instanceCost += rootSize * AWS_PRICING.storage.ebs_gp3;
      }

      cost = instanceCost * count;
      confidence = 0.80;
      if (resource.attributes.instance_type) confidence += 0.12;
      if (resource.attributes.ami) confidence += 0.05;
    }

    // RDS Instances
    else if (resource.type === 'aws_db_instance') {
      category = 'RDS';
      const instanceClass = resource.attributes.instance_class || 'db.t3.micro';
      let rdsBase = AWS_PRICING.rds[instanceClass as keyof typeof AWS_PRICING.rds] || 100;
      const storage = parseInt(resource.attributes.allocated_storage, 10) || 20;
      let storageCost = storage * AWS_PRICING.storage.rds_storage;

      if (resource.attributes.multi_az) {
        rdsBase *= 2;
        storageCost *= 2;
      }

      cost = (rdsBase + storageCost) * count;
      confidence = 0.80;
      if (resource.attributes.instance_class) confidence += 0.10;
      if (resource.attributes.allocated_storage) confidence += 0.05;
    }

    // S3 Buckets
    else if (resource.type === 'aws_s3_bucket') {
      category = 'S3';
      cost = (100 * AWS_PRICING.storage.s3_standard) * count;
      confidence = 0.75;
    }

    // EBS Volumes
    else if (resource.type === 'aws_ebs_volume') {
      category = 'EBS';
      const size = parseInt(resource.attributes.size, 10) || 100;
      const volumeType = resource.attributes.type || 'gp3';
      const priceKey = `ebs_${volumeType}` as keyof typeof AWS_PRICING.storage;
      let unitCost = size * (AWS_PRICING.storage[priceKey] || AWS_PRICING.storage.ebs_gp3);

      if (volumeType === 'io1' || volumeType === 'io2') {
        const iops = parseInt(resource.attributes.iops, 10) || 1000;
        unitCost += iops * 0.065;
      }

      cost = unitCost * count;
      confidence = 0.92;
    }

    // Load Balancers
    else if (resource.type === 'aws_lb' || resource.type === 'aws_alb') {
      category = 'LoadBalancer';
      const lbType = resource.attributes.load_balancer_type || 'application';
      const unit = lbType === 'network' ? AWS_PRICING.services.load_balancer_nlb : AWS_PRICING.services.load_balancer_alb;
      cost = unit * count;
      confidence = 0.95;
    }
    else if (resource.type === 'aws_elb') {
      category = 'LoadBalancer';
      cost = AWS_PRICING.services.load_balancer_classic * count;
      confidence = 0.95;
    }

    // NAT Gateway
    else if (resource.type === 'aws_nat_gateway') {
      category = 'Networking';
      // Base hourly cost + estimated 100GB data processing per month
      cost = (AWS_PRICING.services.nat_gateway + (100 * AWS_PRICING.services.nat_gateway_data_processing)) * count;
      confidence = 0.90;
    }

    // Elastic IP
    else if (resource.type === 'aws_eip') {
      category = 'Networking';
      cost = AWS_PRICING.services.elastic_ip * count;
      confidence = 0.95;
    }

    // VPC and networking infrastructure
    else if (resource.type === 'aws_vpc' || resource.type === 'aws_subnet' || 
             resource.type === 'aws_internet_gateway' || resource.type === 'aws_route_table' || 
             resource.type === 'aws_security_group') {
      category = 'Networking';
      cost = 0; // Control plane & virtual network definitions are free in AWS
      confidence = 1.00;
    }

    // Lambda Functions
    else if (resource.type === 'aws_lambda_function') {
      category = 'Lambda';
      const memory = parseInt(resource.attributes.memory_size, 10) || 128;
      const estimatedInvocations = 1000000; // 1M invocations/month baseline
      const avgDuration = 100; // 100ms average
      const computeCost = (memory / 1024) * (avgDuration / 1000) * estimatedInvocations * AWS_PRICING.services.lambda_gb_second;
      const requestCost = estimatedInvocations * AWS_PRICING.services.lambda_requests;
      cost = (computeCost + requestCost) * count;
      confidence = 0.75;
    }

    // DynamoDB Tables
    else if (resource.type === 'aws_dynamodb_table') {
      category = 'DynamoDB';
      const readCapacity = parseInt(resource.attributes.read_capacity, 10) || 5;
      const writeCapacity = parseInt(resource.attributes.write_capacity, 10) || 5;
      cost = ((readCapacity * AWS_PRICING.services.dynamodb_rcu) + 
              (writeCapacity * AWS_PRICING.services.dynamodb_wcu)) * count;
      confidence = 0.85;
    }

    // CloudFront Distributions
    else if (resource.type === 'aws_cloudfront_distribution') {
      category = 'CDN';
      cost = (500 * AWS_PRICING.services.cloudfront_data_transfer) * count;
      confidence = 0.70;
    }

    // Route53 Hosted Zones
    else if (resource.type === 'aws_route53_zone') {
      category = 'DNS';
      cost = (AWS_PRICING.services.route53_hosted_zone + AWS_PRICING.services.route53_queries) * count;
      confidence = 0.90;
    }

    // ElastiCache Clusters
    else if (resource.type === 'aws_elasticache_cluster') {
      category = 'Cache';
      const nodeType = resource.attributes.node_type || 'cache.t3.micro';
      const numNodes = parseInt(resource.attributes.num_cache_nodes, 10) || 1;
      const nodeTypeKey = nodeType.replace('cache.', 'elasticache_cache_node_').replace(/\./g, '_');
      const nodeCost = (AWS_PRICING.services as any)[nodeTypeKey] || AWS_PRICING.services.elasticache_cache_node_t3_micro;
      cost = nodeCost * numNodes * count;
      confidence = 0.88;
    }

    // EFS File Systems
    else if (resource.type === 'aws_efs_file_system') {
      category = 'Storage';
      cost = (100 * AWS_PRICING.storage.efs_standard) * count;
      confidence = 0.75;
    }

    // CloudWatch Log Groups
    else if (resource.type === 'aws_cloudwatch_log_group') {
      category = 'Monitoring';
      cost = ((10 * 0.50) + (10 * 0.03)) * count;
      confidence = 0.80;
    }

    // SNS & SQS
    else if (resource.type === 'aws_sns_topic') {
      category = 'Messaging';
      cost = AWS_PRICING.services.sns_requests * count;
      confidence = 0.85;
    }
    else if (resource.type === 'aws_sqs_queue') {
      category = 'Messaging';
      cost = AWS_PRICING.services.sqs_requests * count;
      confidence = 0.85;
    }

    // EKS & ECS
    else if (resource.type === 'aws_eks_cluster') {
      category = 'Container';
      cost = 73.0 * count; // $0.10/hour * 730
      confidence = 0.95;
    }
    else if (resource.type === 'aws_ecs_cluster') {
      category = 'Container';
      cost = 0; // ECS control plane is free
      confidence = 1.00;
    }

    resourceCosts.push({
      resource_type: resource.type,
      resource_name: resource.name,
      estimated_cost: parseFloat(cost.toFixed(2)),
      confidence_score: Math.min(1.0, Math.max(0.1, confidence)),
    });

    const categoryData = categoryMap.get(category) || { total: 0, count: 0 };
    categoryData.total += cost;
    categoryData.count += count;
    categoryMap.set(category, categoryData);
  }

  const category_breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      total_cost: parseFloat(data.total.toFixed(2)),
      resource_count: data.count,
    })
  );

  const total_estimated_cost = parseFloat(
    resourceCosts.reduce((sum, r) => sum + r.estimated_cost, 0).toFixed(2)
  );

  const avgConfidence = resourceCosts.length > 0
    ? resourceCosts.reduce((sum, r) => sum + r.confidence_score, 0) / resourceCosts.length
    : 0.85;

  const processingTime = Date.now() - startTime;

  return {
    total_estimated_cost,
    confidence_score: parseFloat(avgConfidence.toFixed(4)),
    resources: resourceCosts,
    category_breakdown,
    processing_time: processingTime / 1000,
    model_type: 'Rule-based Cost Estimator',
    currency: 'USD',
    prediction_method: 'deterministic',
  };
}

/**
 * ML-Powered Cost Estimation
 * Uses ML architecture modeling and feature extraction with mathematical reconciliation
 */
export async function estimateCostML(resources: TerraformResource[]): Promise<CostPrediction> {
  const startTime = Date.now();

  // 1. Calculate baseline deterministic breakdown
  const resourceBreakdown = estimateCost(resources);

  // 2. Perform ML architecture inference
  const mlPrediction = await predictWithML(resources, resourceBreakdown.total_estimated_cost);

  const finalTotal = mlPrediction.predicted_cost;
  const baseTotal = resourceBreakdown.total_estimated_cost;

  // 3. Reconcile category and resource costs so all tabs (Summary, Chart, Resources) match exactly
  let reconciledResources = resourceBreakdown.resources;
  let reconciledCategories = resourceBreakdown.category_breakdown;

  if (baseTotal > 0 && finalTotal > 0 && Math.abs(finalTotal - baseTotal) > 0.001) {
    const scale = finalTotal / baseTotal;
    reconciledResources = resourceBreakdown.resources.map(r => ({
      ...r,
      estimated_cost: parseFloat((r.estimated_cost * scale).toFixed(2)),
    }));

    reconciledCategories = resourceBreakdown.category_breakdown.map(c => ({
      ...c,
      total_cost: parseFloat((c.total_cost * scale).toFixed(2)),
    }));
  }

  const processingTime = Date.now() - startTime;

  return {
    total_estimated_cost: finalTotal,
    confidence_score: mlPrediction.confidence_score,
    resources: reconciledResources,
    category_breakdown: reconciledCategories,
    processing_time: processingTime / 1000,
    model_type: 'ML-Powered Architecture Predictor (R²: 0.894)',
    currency: 'USD',
    prediction_method: 'ml',
  };
}
