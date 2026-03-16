# Terraform Cost Predictor

**ML-powered platform** that analyzes Terraform infrastructure configurations and predicts the **estimated cloud cost before deployment**.

The system parses Terraform files, extracts infrastructure features, and uses a trained machine learning model to estimate the monthly cost of the infrastructure. The platform includes a **web interface**, allowing users to upload Terraform configurations and instantly view predicted infrastructure cost and resource breakdown.

---

## Features

- **Terraform Configuration Parsing** - Parses `.tf` files and extracts infrastructure resources (EC2, S3, RDS, Load Balancers, EBS, Networking, etc.)
- **Infrastructure Feature Extraction** - Converts Terraform configuration into ML-ready features
- **ML Cost Prediction** - Predicts estimated monthly infrastructure cost with confidence scoring
- **Infrastructure Cost Breakdown** - Provides cost estimates per resource category
- **Web Dashboard** - Interactive UI with file upload, resource detection, cost visualization, and breakdown charts

---

## Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS**
- **shadcn/ui** components
- **Chart.js** / react-chartjs-2
- **Lucide React** icons

### Backend
- **FastAPI** (Python)
- **python-hcl2** (Terraform parsing)
- **Scikit-learn**, Pandas, NumPy

### Containerization
- **Docker** + Docker Compose

---

## Project Structure

```
terraform-cost-predictor/
├── backend/
│   ├── api/
│   │   └── routes.py          # API endpoints
│   ├── parser/
│   │   └── terraform_parser.py # Terraform file parser
│   ├── features/
│   │   └── feature_extractor.py # ML feature extraction
│   ├── model/
│   │   └── cost_model.py      # Cost prediction model
│   ├── app.py                 # FastAPI application
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx     # Root layout
│   │   │   ├── page.tsx       # Main page
│   │   │   └── globals.css    # Global styles
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/ui components
│   │   │   ├── FileUploader.tsx
│   │   │   ├── CostDashboard.tsx
│   │   │   └── CostChart.tsx
│   │   ├── services/
│   │   │   └── api.ts         # API client
│   │   └── lib/
│   │       └── utils.ts       # Utility functions
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
├── examples/                  # Sample Terraform files
│   ├── ec2.tf
│   ├── rds.tf
│   ├── s3.tf
│   ├── networking.tf
│   └── variables.tf
├── docker-compose.yml
└── README.md
```

---

## Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.11+
- (Optional) **Docker** and Docker Compose

### 1. Start Backend API

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload
```

The API will be available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### 2. Start Frontend UI

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:3000`.

### 3. Docker (Alternative)

```bash
docker-compose up --build
```

---

## Usage

1. Open `http://localhost:3000` in your browser
2. Upload one or more `.tf` files (drag & drop or click to browse)
3. Click **Predict Cost**
4. View the predicted monthly cost, confidence score, and breakdown
5. Explore the **Cost Breakdown**, **Visualization**, and **Resources** tabs

### Example Files

Sample Terraform files are provided in the `examples/` directory:

```bash
examples/
├── ec2.tf          # EC2 instances (t3.medium x3, m5.large x2)
├── rds.tf          # RDS PostgreSQL (db.t3.medium, multi-AZ)
├── s3.tf           # S3 buckets
├── networking.tf   # VPC, subnets, NAT gateway, ALB
└── variables.tf    # Terraform variables
```

---

## API Endpoints

| Method | Endpoint        | Description                          |
|--------|----------------|--------------------------------------|
| POST   | `/api/predict`  | Upload .tf files and predict cost    |
| POST   | `/api/parse`    | Parse .tf files without prediction   |
| GET    | `/api/health`   | Health check                         |

---

## Supported AWS Resources

| Resource              | Category      |
|----------------------|---------------|
| `aws_instance`       | EC2           |
| `aws_db_instance`    | RDS           |
| `aws_s3_bucket`      | S3            |
| `aws_lb` / `aws_alb` | LoadBalancer  |
| `aws_ebs_volume`     | EBS           |
| `aws_nat_gateway`    | Networking    |
| `aws_vpc`            | Networking    |
| `aws_lambda_function`| Lambda        |
| `aws_dynamodb_table` | DynamoDB      |
| `aws_ecs_cluster`    | ECS           |
| `aws_eks_cluster`    | EKS           |
| ...and more          |               |

---

## License

MIT License
