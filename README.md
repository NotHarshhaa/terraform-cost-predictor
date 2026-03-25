# Terraform Cost Predictor

**ML-powered platform** that analyzes Terraform infrastructure configurations and predicts **estimated cloud costs before deployment** using trained machine learning models.

The system parses Terraform files, extracts infrastructure features, and uses **trained ML models** with real AWS pricing data to estimate monthly costs with high accuracy. The platform features a **modern web interface** with dark mode, allowing users to upload Terraform configurations and instantly view predicted infrastructure costs and resource breakdowns.

---

## ✨ Key Features

- **🤖 ML-Powered Predictions** - Uses trained machine learning models for accurate cost estimation
- **🔍 Terraform Parsing** - Parses `.tf` files and extracts infrastructure resources
- **💰 Cost Estimation** - ML-based predictions with 85-95% confidence scores
- **📊 Visual Dashboard** - Interactive charts and cost breakdowns
- **🎨 Modern UI** - Beautiful interface with dark mode support
- **⚡ Single Deployment** - No separate backend required, everything runs in Next.js
- **🔒 No External Dependencies** - All ML logic runs in Next.js API routes

---

## 🎯 Supported AWS Resources

- **EC2 Instances** - All instance types (t2, t3, m5, c5, r5, etc.)
- **RDS Databases** - With storage, multi-AZ support
- **S3 Buckets** - Storage estimation
- **EBS Volumes** - All volume types (gp2, gp3, io1, io2)
- **Load Balancers** - ALB, ELB, NLB
- **NAT Gateways** - Networking costs
- **Lambda Functions** - Compute estimation
- **DynamoDB Tables** - Read/write capacity
- **ECS/EKS Clusters** - Container services
- And more...

---

## 🛠️ Tech Stack

### Application (Unified)
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **hcl2-parser** - Terraform HCL parsing
- **Chart.js** - Data visualization
- **next-themes** - Dark mode support

### ML Training (Optional)
- **Python** - ML model training scripts
- **Scikit-learn** - Machine learning models
- **Pandas & NumPy** - Data processing
- See `ML-training/` folder for details

---

## Architecture

This project uses an **ML-powered architecture with unified deployment**:
- **ML Models** - Trained machine learning models for accurate cost prediction
- **Terraform parsing** - TypeScript implementation using hcl2-parser
- **Feature extraction** - Converts Terraform configs to ML-ready features
- **Cost prediction** - ML-based estimation with confidence scoring
- **API Routes** - Serverless functions run ML models
- **Single deployment** - Deploy to Vercel, Netlify, or any Node.js host

### Benefits
✅ **ML-powered accuracy** - Uses trained models for better predictions  
✅ **Zero backend deployment** - All ML logic runs in Next.js  
✅ **One-click deployment** - Deploy to Vercel instantly  
✅ **No infrastructure** - Fully serverless  
✅ **Fast & lightweight** - No external API calls  
✅ **Easy maintenance** - Single codebase  

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm

### Development

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

**Access the application at `http://localhost:3000`**

That's it! No backend setup required.

### Production Deployment

#### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

#### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
npm run build
netlify deploy --prod
```

#### Docker Deployment

```bash
cd frontend
docker build -t terraform-cost-predictor .
docker run -p 3000:3000 terraform-cost-predictor
```

---

## Usage

1. **Open Application**: Navigate to `http://localhost:3000`
2. **Upload Files**: Drag & drop or browse for `.tf` files
3. **Get Prediction**: Click **Predict Cost** for instant cost estimation
4. **View Results**: See cost breakdown, confidence scores, and resource details
5. **Explore Tabs**: Cost Breakdown, Visualization, and Resources
6. **Toggle Theme**: Use the switch in the header for dark/light mode

### API Endpoints

Check application health:
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "healthy",
  "service": "terraform-cost-predictor",
  "version": "2.0.0",
  "mode": "unified"
}
```

---

## Cost Estimation

### How It Works

The application uses **ML-powered cost estimation** with trained models:

1. **Parse Terraform Files** - Extract resources using HCL parser
2. **Feature Extraction** - Convert Terraform configs to ML-ready features
3. **ML Prediction** - Apply trained models for cost estimation
4. **Confidence Scoring** - Provide confidence scores for predictions
5. **Generate Report** - Show breakdown by category and resource

### Accuracy

- **85-95% confidence** depending on resource type
- **ML-based predictions** using trained models
- **Real AWS pricing** data integrated into training
- **Feature engineering** for optimal predictions
- **Category breakdowns** - EC2, RDS, S3, networking, etc.

### Example Prediction

Upload a Terraform file with EC2 instance:

```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
}
```

Result:
```json
{
  "total_estimated_cost": 30.00,
  "confidence_score": 90,
  "resources": [{
    "resource_type": "aws_instance",
    "resource_name": "web",
    "estimated_cost": 30.00,
    "confidence_score": 90
  }],
  "category_breakdown": [{
    "category": "EC2",
    "total_cost": 30.00,
    "resource_count": 1
  }],
  "currency": "USD"
}
```

---

## ML Model Training

The platform uses **trained machine learning models** for cost prediction. The `ML-training/` folder contains:

- **ML model training** scripts (Random Forest, Gradient Boosting)
- **Feature engineering** pipeline (26 engineered features)
- **Model evaluation** tools (R²: 0.9999, RMSE: $9.83)
- **Training data** generation (10,000+ samples)

### Train Your Own Models

```bash
cd ML-training
pip install -r requirements.txt
python train_model.py --samples 10000
```

### Model Performance
- **🏆 Best Model**: Random Forest
- **📊 R² Score**: 0.9999 (Near Perfect!)
- **🎯 RMSE**: $9.83 (Excellent accuracy)
- **✅ Cross-validation**: 0.9986 ± 0.0018

See `ML-training/README.md` for detailed ML documentation.

---

## API Endpoints

All endpoints are available at `http://localhost:3000`:

| Method | Endpoint              | Description                          |
|--------|-----------------------|--------------------------------------|
| POST   | `/api/predict`        | Upload .tf files and get cost estimate |
| GET    | `/api/health`         | Application health check             |

### Example: Predict Cost

```bash
curl -X POST http://localhost:3000/api/predict \
  -F "files=@examples/ec2.tf" \
  -F "files=@examples/rds.tf"
```

---

## Supported AWS Resources

| Resource              | Category      | ML Features Extracted          |
|----------------------|---------------|--------------------------------|
| `aws_instance`       | EC2           | instance type, count, memory, vCPU |
| `aws_db_instance`    | RDS           | engine, storage, multi-AZ, memory |
| `aws_s3_bucket`      | S3            | versioning, estimated usage       |
| `aws_lb` / `aws_alb` | LoadBalancer  | load balancer type, count         |
| `aws_ebs_volume`     | EBS           | volume type, size, IOPS           |
| `aws_nat_gateway`    | Networking    | NAT gateway count                 |
| `aws_vpc`            | Networking    | VPC configuration                 |
| `aws_lambda_function`| Lambda        | function configuration            |
| `aws_dynamodb_table` | DynamoDB      | table capacity, storage           |
| `aws_ecs_cluster`    | ECS           | cluster configuration             |
| `aws_eks_cluster`    | EKS           | cluster configuration             |
| ...and more          |               |                                |

---

## ML Features

### Core Features (13)
- Resource counts (EC2, RDS, EBS, S3, etc.)
- Total memory, vCPU, storage
- Networking components
- Resource interactions

### Engineered Features (13)
- `memory_per_vcpu`: Memory to vCPU ratio
- `storage_per_resource`: Storage efficiency
- `compute_score`: Compute resource score
- `storage_score`: Storage resource score
- `networking_score`: Networking complexity
- `interaction_features`: Resource dependencies
- `log_transformations`: Handle skewed distributions

---

## 📚 Advanced ML Documentation

For detailed ML implementation, training procedures, and model management, see **[ML_README.md](backend/ML_README.md)**.

---

## License

MIT License
