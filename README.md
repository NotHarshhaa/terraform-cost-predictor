# **Terraform Cost Predictor**

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
✅ **Instant results** - Get cost estimates in seconds  
✅ **Easy to use** - Just upload your Terraform files  
✅ **Detailed breakdown** - See costs by resource and category  
✅ **Confidence scores** - Know how reliable each prediction is  
✅ **Beautiful interface** - Modern UI with dark mode support  

---

## How to Use

1. **Upload Terraform Files** - Drag & drop or browse for `.tf` files
2. **Get Cost Prediction** - Click **Predict Cost** for instant ML-powered estimation
3. **View Results** - See cost breakdown, confidence scores, and resource details
4. **Explore Tabs** - Cost Breakdown, Visualization, and Resources
5. **Toggle Theme** - Use the switch in the header for dark/light mode

### Example Terraform Files

Try uploading these sample files:

**EC2 Instance (`ec2.tf`)**
```hcl
resource "aws_instance" "web" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.medium"
  tags = {
    Name = "WebServer"
  }
}
```

**RDS Database (`rds.tf`)**
```hcl
resource "aws_db_instance" "database" {
  engine         = "mysql"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  username       = "admin"
  password       = "password123"
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

## ML Model Training

The platform uses **trained machine learning models** for cost prediction. The `ML-training/` folder contains:

- **ML model training** scripts (Random Forest, Gradient Boosting)
- **Feature engineering** pipeline (26 engineered features)
- **Model evaluation** tools (R²: 0.9999, RMSE: $9.83)
- **Training data** generation (10,000+ samples)

---

## Supported AWS Resources

| Resource              | Category      | What We Analyze                   |
|----------------------|---------------|-----------------------------------|
| `aws_instance`       | EC2           | Instance type, count, memory, vCPU |
| `aws_db_instance`    | RDS           | Engine, storage, multi-AZ, memory |
| `aws_s3_bucket`      | S3            | Storage estimation and usage      |
| `aws_ebs_volume`     | EBS           | Size, type, IOPS, throughput      |
| `aws_lb`             | Load Balancer | Type and configuration            |
| `aws_nat_gateway`    | Networking    | Availability zone and usage       |
| `aws_eip`            | Networking    | Instance association              |
| `aws_lambda_function`| Lambda        | Memory, timeout, runtime          |
| `aws_dynamodb_table` | DynamoDB      | Read/write capacity               |
| `aws_ecs_cluster`    | Containers    | Services and task definitions     |
| `aws_eks_cluster`    | Containers    | Node groups and version           |

### What the ML Model Analyzes

The ML model extracts **26 engineered features** from your Terraform files:

- **Compute metrics** - vCPU count, memory, instance types
- **Storage analysis** - Total storage, IOPS, throughput
- **Database configuration** - Engine, multi-AZ, backup settings
- **Network resources** - Load balancers, NAT gateways, IPs
- **Complexity scores** - Infrastructure diversity and complexity
- **Cost ratios** - Storage-to-compute, database-to-compute ratios

---


## 🛠️ Author & Community

Built with passion and purpose by [**Harshhaa**](https://github.com/NotHarshhaa).  
Your ideas, feedback, and contributions are what make this project better.

Let’s shape the future of DevOps monitoring together! 🚀

**Connect & Collaborate:**  

* **GitHub:** [@NotHarshhaa](https://github.com/NotHarshhaa)  
* **Blog:** [ProDevOpsGuy](https://blog.prodevopsguy.xyz)  
* **Telegram Community:** [Join Here](https://t.me/prodevopsguy)  
* **LinkedIn:** [Harshhaa Vardhan Reddy](https://www.linkedin.com/in/harshhaa-vardhan-reddy/)  

---

## ⭐ How You Can Support

If you found this project useful:  

* ⭐ **Star** the repository to show your support  
* 📢 **Share** it with your friends and colleagues  
* 📝 **Open issues** or **submit pull requests** to help improve it

---

### 📢 Stay Connected

[![Follow Me](https://imgur.com/2j7GSPs.png)](https://github.com/NotHarshhaa)

Join the community, share your experience, and help us grow!
