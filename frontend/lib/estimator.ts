import { TerraformResource } from './parser';

// AWS Pricing Data (simplified estimates in USD/month)
const AWS_PRICING = {
  // EC2 Instance Types (monthly cost)
  ec2: {
    't2.micro': 8.5,
    't2.small': 17,
    't2.medium': 34,
    't2.large': 68,
    't3.micro': 7.5,
    't3.small': 15,
    't3.medium': 30,
    't3.large': 60,
    'm5.large': 70,
    'm5.xlarge': 140,
    'm5.2xlarge': 280,
    'c5.large': 62,
    'c5.xlarge': 124,
    'r5.large': 92,
    'r5.xlarge': 184,
  },
  // RDS Instance Types (monthly cost)
  rds: {
    'db.t3.micro': 15,
    'db.t3.small': 30,
    'db.t3.medium': 60,
    'db.t3.large': 120,
    'db.m5.large': 140,
    'db.m5.xlarge': 280,
    'db.r5.large': 180,
    'db.r5.xlarge': 360,
  },
  // Storage (per GB/month)
  storage: {
    ebs_gp3: 0.08,
    ebs_gp2: 0.10,
    ebs_io1: 0.125,
    ebs_io2: 0.125,
    s3_standard: 0.023,
    rds_storage: 0.115,
  },
  // Other services (monthly cost)
  services: {
    nat_gateway: 32.4,
    load_balancer: 16.2,
    elastic_ip: 3.6,
    vpc: 0,
    lambda_gb_second: 0.0000166667,
    dynamodb_wcu: 0.47,
    dynamodb_rcu: 0.09,
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
}

export function estimateCost(resources: TerraformResource[]): CostPrediction {
  const startTime = Date.now();
  const resourceCosts: ResourceCost[] = [];
  const categoryMap = new Map<string, { total: number; count: number }>();

  for (const resource of resources) {
    let cost = 0;
    let confidence = 0.85; // Changed to decimal (0-1)
    let category = 'Other';

    // EC2 Instances
    if (resource.type === 'aws_instance') {
      category = 'EC2';
      const instanceType = resource.attributes.instance_type || 't2.micro';
      cost = AWS_PRICING.ec2[instanceType as keyof typeof AWS_PRICING.ec2] || 50;
      confidence = 0.90;
    }

    // RDS Instances
    else if (resource.type === 'aws_db_instance') {
      category = 'RDS';
      const instanceClass = resource.attributes.instance_class || 'db.t3.micro';
      cost = AWS_PRICING.rds[instanceClass as keyof typeof AWS_PRICING.rds] || 100;
      
      // Add storage cost
      const storage = parseInt(resource.attributes.allocated_storage) || 20;
      cost += storage * AWS_PRICING.storage.rds_storage;
      
      // Multi-AZ doubles the cost
      if (resource.attributes.multi_az) {
        cost *= 2;
      }
      confidence = 0.88;
    }

    // S3 Buckets
    else if (resource.type === 'aws_s3_bucket') {
      category = 'S3';
      // Estimate 100GB storage per bucket
      cost = 100 * AWS_PRICING.storage.s3_standard;
      confidence = 0.70;
    }

    // EBS Volumes
    else if (resource.type === 'aws_ebs_volume') {
      category = 'EBS';
      const size = parseInt(resource.attributes.size) || 100;
      const volumeType = resource.attributes.type || 'gp3';
      const priceKey = `ebs_${volumeType}` as keyof typeof AWS_PRICING.storage;
      cost = size * (AWS_PRICING.storage[priceKey] || AWS_PRICING.storage.ebs_gp3);
      confidence = 0.92;
    }

    // Load Balancers
    else if (resource.type === 'aws_lb' || resource.type === 'aws_alb' || resource.type === 'aws_elb') {
      category = 'LoadBalancer';
      cost = AWS_PRICING.services.load_balancer;
      confidence = 0.95;
    }

    // NAT Gateway
    else if (resource.type === 'aws_nat_gateway') {
      category = 'Networking';
      cost = AWS_PRICING.services.nat_gateway;
      confidence = 0.95;
    }

    // Elastic IP
    else if (resource.type === 'aws_eip') {
      category = 'Networking';
      cost = AWS_PRICING.services.elastic_ip;
      confidence = 0.95;
    }

    // VPC
    else if (resource.type === 'aws_vpc') {
      category = 'Networking';
      cost = AWS_PRICING.services.vpc;
      confidence = 1.00;
    }

    // Subnets, Internet Gateways (free resources)
    else if (resource.type === 'aws_subnet' || resource.type === 'aws_internet_gateway') {
      category = 'Networking';
      cost = 0;
      confidence = 1.00;
    }

    // Lambda Functions
    else if (resource.type === 'aws_lambda_function') {
      category = 'Lambda';
      // Estimate based on memory and invocations
      const memory = parseInt(resource.attributes.memory_size) || 128;
      const estimatedInvocations = 1000000; // 1M invocations/month
      const avgDuration = 100; // 100ms average
      cost = (memory / 1024) * (avgDuration / 1000) * estimatedInvocations * AWS_PRICING.services.lambda_gb_second;
      confidence = 0.65;
    }

    // DynamoDB Tables
    else if (resource.type === 'aws_dynamodb_table') {
      category = 'DynamoDB';
      const readCapacity = parseInt(resource.attributes.read_capacity) || 5;
      const writeCapacity = parseInt(resource.attributes.write_capacity) || 5;
      cost = (readCapacity * AWS_PRICING.services.dynamodb_rcu) + 
             (writeCapacity * AWS_PRICING.services.dynamodb_wcu);
      confidence = 0.80;
    }

    // ECS/EKS Clusters
    else if (resource.type === 'aws_ecs_cluster' || resource.type === 'aws_eks_cluster') {
      category = 'Container';
      cost = resource.type === 'aws_eks_cluster' ? 73 : 0; // EKS control plane cost
      confidence = 0.75;
    }

    resourceCosts.push({
      resource_type: resource.type,
      resource_name: resource.name,
      estimated_cost: parseFloat(cost.toFixed(2)),
      confidence_score: confidence,
    });

    // Update category totals
    const categoryData = categoryMap.get(category) || { total: 0, count: 0 };
    categoryData.total += cost;
    categoryData.count += 1;
    categoryMap.set(category, categoryData);
  }

  // Calculate category breakdown
  const category_breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries()).map(
    ([category, data]) => ({
      category,
      total_cost: parseFloat(data.total.toFixed(2)),
      resource_count: data.count,
    })
  );

  // Calculate totals
  const total_estimated_cost = parseFloat(
    resourceCosts.reduce((sum, r) => sum + r.estimated_cost, 0).toFixed(2)
  );

  const avgConfidence = resourceCosts.length > 0
    ? resourceCosts.reduce((sum, r) => sum + r.confidence_score, 0) / resourceCosts.length
    : 0;

  const processingTime = Date.now() - startTime;

  return {
    total_estimated_cost,
    confidence_score: parseFloat(avgConfidence.toFixed(1)),
    resources: resourceCosts,
    category_breakdown,
    processing_time: processingTime / 1000,
    model_type: 'Rule-based Cost Estimator',
    currency: 'USD',
    prediction_method: 'deterministic',
  };
}
