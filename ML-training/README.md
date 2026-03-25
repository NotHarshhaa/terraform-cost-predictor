# Terraform Cost Predictor - ML Training Guide

This guide explains how to train and use the real machine learning model for Terraform infrastructure cost prediction.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Train the ML Model
```bash
python train_model.py
```

### 3. Start the API Server
```bash
python app.py
```

The API will now use the trained ML model for predictions!

## 📊 ML Model Architecture

### Data Collection
- **Real AWS Pricing Data**: Collects actual pricing from AWS services
- **Synthetic Training Data**: Generates realistic infrastructure configurations
- **Feature Engineering**: Creates meaningful features for ML training

### Machine Learning Pipeline
1. **Data Collection**: Real AWS pricing data collection
2. **Feature Engineering**: Transform raw infrastructure data into ML features
3. **Model Training**: Train multiple ML algorithms and select the best
4. **Hyperparameter Tuning**: Optimize model performance
5. **Model Persistence**: Save trained models for production use

### Supported ML Algorithms
- Linear Regression
- Ridge Regression
- Lasso Regression
- Decision Tree
- Random Forest
- Gradient Boosting (Best performer)

## 🔧 Training Options

### Basic Training
```bash
python train_model.py
```

### Custom Training with More Samples
```bash
python train_model.py --samples 50000
```

### Force Data Regeneration
```bash
python train_model.py --force-regenerate
```

### With Hyperparameter Tuning
```bash
python train_model.py --hyperparameter-tuning
```

## 📈 Model Performance

The trained model typically achieves:
- **R² Score**: 0.85-0.95
- **RMSE**: $50-200 (depending on data complexity)
- **MAE**: $30-150

Performance metrics are saved in `models/metrics.json`

## 🏗️ Model Features

### Core Features
- `ec2_count`: Number of EC2 instances
- `ec2_total_memory`: Total memory across all EC2 instances
- `ec2_total_vcpu`: Total vCPU across all EC2 instances
- `rds_count`: Number of RDS instances
- `rds_total_memory`: Total RDS memory
- `rds_multi_az`: Whether Multi-AZ is enabled
- `ebs_volume_count`: Number of EBS volumes
- `ebs_total_gb`: Total EBS storage in GB
- `s3_bucket_count`: Number of S3 buckets
- `s3_total_gb`: Estimated S3 usage
- `has_nat_gateway`: Whether NAT Gateway is present
- `has_load_balancer`: Whether Load Balancer is present
- `total_resources`: Total number of resources

### Engineered Features
- `memory_per_vcpu`: Memory to vCPU ratio
- `storage_per_resource`: Storage per resource ratio
- `compute_score`: Compute resource score
- `storage_score`: Storage resource score
- `networking_score`: Networking resource score
- `interaction_features`: Resource interaction terms
- `log_transformations`: Log-transformed features for skewness

## 📁 File Structure

```
backend/
├── ml/
│   ├── __init__.py
│   ├── data_collector.py    # Real AWS pricing data collection
│   ├── model_trainer.py     # ML model training pipeline
│   └── ml_predictor.py      # Production ML predictor
├── models/
│   ├── best_model.joblib    # Trained ML model
│   ├── features.json        # Feature names used in training
│   ├── metrics.json         # Model performance metrics
│   └── metadata.json        # Model metadata
├── data/
│   ├── pricing_data.json    # AWS pricing data
│   └── training_data.csv    # Generated training data
├── train_model.py           # Training script
└── ML_README.md            # This file
```

## 🔍 Model Information API

### Get Model Status
```bash
curl http://localhost:8000/model/info
```

Response:
```json
{
  "status": "loaded",
  "model_type": "Trained Gradient Boosting Regressor",
  "feature_count": 23,
  "training_date": "2024-01-15T10:30:00",
  "performance": {
    "r2_score": 0.92,
    "rmse": 75.50
  }
}
```

## 🧪 Testing the Model

### Test with Sample Data
```python
from ml.ml_predictor import get_predictor

predictor = get_predictor()

sample_features = {
    'ec2_count': 3,
    'ec2_total_memory': 24.0,
    'ec2_total_vcpu': 8,
    'rds_count': 1,
    'rds_total_memory': 16.0,
    'rds_multi_az': 1,
    'ebs_volume_count': 5,
    'ebs_total_gb': 500,
    's3_bucket_count': 2,
    's3_total_gb': 1000,
    'has_nat_gateway': 1,
    'has_load_balancer': 1,
    'total_resources': 12
}

prediction = predictor.predict(sample_features, [])
print(f"Predicted cost: ${prediction['predicted_cost']:.2f}")
print(f"Confidence: {prediction['confidence_score']:.1f}%")
```

## 🔄 Model Retraining

### When to Retrain
- New AWS services are added
- Pricing changes significantly
- Model performance degrades
- New infrastructure patterns emerge

### Retraining Process
```bash
# Backup current model
cp models/best_model.joblib models/best_model_backup.joblib

# Retrain with new data
python train_model.py --force-regenerate --hyperparameter-tuning

# Test new model
python -c "from ml.ml_predictor import get_predictor; print(get_predictor().get_model_info())"
```

## 🐛 Troubleshooting

### Model Not Loading
```bash
# Check if model files exist
ls -la models/

# Train model if missing
python train_model.py
```

### Import Errors
```bash
# Ensure all dependencies are installed
pip install -r requirements.txt

# Check Python path
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### Poor Performance
```bash
# Increase training samples
python train_model.py --samples 50000

# Enable hyperparameter tuning
python train_model.py --hyperparameter-tuning

# Check feature importance
python -c "
from ml.ml_predictor import get_predictor
predictor = get_predictor()
prediction = predictor.predict({'ec2_count': 1, 'ec2_total_memory': 4.0, 'ec2_total_vcpu': 2, 'rds_count': 0, 'rds_total_memory': 0.0, 'rds_multi_az': 0, 'ebs_volume_count': 0, 'ebs_total_gb': 0, 's3_bucket_count': 0, 's3_total_gb': 0, 'has_nat_gateway': 0, 'has_load_balancer': 0, 'total_resources': 1}, [])
print('Feature importance:', prediction.get('feature_importance', {}))
"
```

## 📊 Monitoring Model Performance

### Key Metrics to Monitor
- **Prediction Accuracy**: Compare predicted vs actual costs
- **Confidence Scores**: Low confidence may indicate model uncertainty
- **Feature Drift**: Changes in infrastructure patterns over time
- **Error Rates**: High error rates may need retraining

### Performance Monitoring
```python
# Log prediction metrics
import logging
logging.basicConfig(level=logging.INFO)

def log_prediction(features, prediction, actual_cost=None):
    logging.info(f"Prediction: ${prediction['predicted_cost']:.2f}, "
                f"Confidence: {prediction['confidence_score']:.1f}%")
    if actual_cost:
        error = abs(prediction['predicted_cost'] - actual_cost)
        logging.info(f"Actual: ${actual_cost:.2f}, Error: ${error:.2f}")
```

## 🚀 Production Deployment

### Environment Variables
```bash
export MODEL_PATH="/app/models"
export LOG_LEVEL="INFO"
```

### Docker Considerations
- Mount models directory as volume
- Ensure sufficient memory for model loading
- Monitor prediction latency

### Scaling Considerations
- Model is loaded once per process
- Consider model caching for high-throughput scenarios
- Monitor memory usage with multiple model instances

## 📚 Advanced Topics

### Custom Feature Engineering
Add new features in `ml/model_trainer.py`:
```python
def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
    # Add your custom features here
    df['custom_feature'] = df['ec2_count'] * df['rds_count']
    return df
```

### Custom Pricing Data
Update pricing in `ml/data_collector.py`:
```python
def collect_ec2_pricing(self) -> Dict[str, Any]:
    # Add your custom pricing data
    ec2_pricing['custom_instance'] = {'hourly': 0.50, 'memory': 8.0, 'vcpu': 4}
    return ec2_pricing
```

### Model Ensemble
Combine multiple models for better performance:
```python
# In ml_predictor.py
def predict_with_ensemble(self, features):
    predictions = []
    for model in self.models:
        pred = model.predict(features)
        predictions.append(pred)
    return np.mean(predictions)
```

## 🤝 Contributing

1. Update pricing data regularly
2. Add new AWS services as they become available
3. Improve feature engineering based on real-world usage
4. Optimize model performance and accuracy

## 📞 Support

For issues with the ML model:
1. Check the logs for error messages
2. Verify model files exist and are not corrupted
3. Ensure all dependencies are properly installed
4. Retrain the model if performance issues persist
