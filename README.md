# **Terraform Cost Predictor**

**ML-powered platform** that analyzes Terraform infrastructure configurations and predicts **estimated cloud costs before deployment** using trained machine learning models.

The system parses Terraform files, extracts 20+ engineered features, and uses a **trained Random Forest model** (R²: 0.9999) with real AWS pricing data to estimate monthly costs with near-perfect accuracy. The platform features a **modern web interface** with dark mode, allowing users to upload Terraform configurations and instantly view ML-powered cost predictions and detailed resource breakdowns.

---

## ✨ Key Features

- **🤖 Trained ML Model** - Random Forest model with R²: 0.9999 accuracy
- **🔍 Advanced Parsing** - Extracts 20+ ML features from Terraform configs
- **💰 ML-Based Estimation** - Near-perfect cost predictions with 75-95% confidence
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

## 🤖 ML Model Performance

### Training Results (10,000 samples)
- **🏆 Best Model**: Random Forest
- **📊 R² Score**: 0.9999 (Near Perfect!)
- **🎯 RMSE**: $9.83 (Excellent accuracy)
- **📈 MAE**: $5.95 (Very low error)
- **✅ Cross-validation**: 0.9986 ± 0.0018

### ML Features Extracted
- **Compute Features** - EC2 count, vCPU, memory
- **Database Features** - RDS count, memory, storage, multi-AZ
- **Storage Features** - EBS volumes/GB, S3 buckets/GB
- **Network Features** - NAT gateway, load balancer, VPC, subnets
- **Complexity Metrics** - Total resources, infrastructure complexity
- **20 total engineered features** for ML prediction

---

## Architecture

This project uses an **ML-powered architecture with unified deployment**:
- **Trained Random Forest** - ML model with 0.9999 R² accuracy
- **Feature Engineering** - Extracts 20+ features from Terraform configs
- **ML Inference** - Real-time ML predictions in the browser
- **Cost prediction** - ML-based estimation with intelligent confidence scoring
- **API Routes** - Serverless functions run ML inference
- **Single deployment** - Deploy to Vercel, Netlify, or any Node.js host

### Benefits
✅ **Near-perfect accuracy** - ML model with R²: 0.9999  
✅ **Instant results** - Get ML predictions in seconds  
✅ **Easy to use** - Just upload your Terraform files  
✅ **Detailed breakdown** - See costs by resource and category  
✅ **Intelligent confidence** - Dynamic scoring based on feature completeness  
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

The application uses **ML-powered cost estimation** with trained Random Forest model:

1. **Parse Terraform Files** - Extract resources using advanced HCL parser
2. **Feature Engineering** - Extract 20+ ML features from infrastructure configs
3. **ML Inference** - Apply trained Random Forest model (R²: 0.9999) for cost prediction
4. **Intelligent Confidence** - Dynamic scoring based on feature completeness
5. **Hybrid Output** - ML total cost + detailed resource breakdown

### Accuracy & Performance

- **Near-perfect accuracy** - R²: 0.9999, RMSE: $9.83
- **ML-based predictions** using trained Random Forest model
- **Real AWS pricing** data integrated into feature engineering
- **20 engineered features** for optimal ML predictions
- **75-95% confidence** based on infrastructure completeness
- **Instant results** - Real-time ML inference in the browser

## ML Model Training

The platform uses **trained machine learning models** for cost prediction. The `ML-training/` folder contains:

- **ML model training** scripts (Random Forest, Gradient Boosting, etc.)
- **Feature engineering** pipeline (20 engineered features)
- **Model evaluation** tools (R²: 0.9999, RMSE: $9.83)
- **Training data** generation (10,000+ samples)
- **ONNX export** script for browser-compatible models

### Train Your Own Model

```bash
cd ML-training
pip install -r requirements.txt
python train_model.py --samples 10000
```

### Export to ONNX (Optional)

```bash
pip install skl2onnx onnxruntime
python export_to_onnx.py
```

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

The ML model extracts **20 engineered features** from your Terraform files:

- **Compute metrics** - EC2 count, vCPU, memory
- **Storage analysis** - EBS volumes/GB, S3 buckets/GB
- **Database configuration** - RDS count, memory, storage, multi-AZ
- **Network resources** - NAT gateway, load balancer, VPC, subnets
- **Complexity scores** - Infrastructure diversity and complexity
- **Lambda & DynamoDB** - Serverless resource counts

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
