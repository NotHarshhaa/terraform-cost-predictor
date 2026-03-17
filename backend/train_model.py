#!/usr/bin/env python3
"""
Training script for the Terraform Cost Predictor ML model.
Run this script to train the ML model with real data.
"""

import os
import sys
import argparse
from pathlib import Path

# Add the ml directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'ml'))

def main():
    parser = argparse.ArgumentParser(description='Train Terraform Cost Predictor ML model')
    parser.add_argument('--samples', type=int, default=10000, 
                       help='Number of training samples to generate (default: 10000)')
    parser.add_argument('--force-regenerate', action='store_true',
                       help='Force regeneration of training data')
    parser.add_argument('--hyperparameter-tuning', action='store_true',
                       help='Perform hyperparameter tuning')
    
    args = parser.parse_args()
    
    print("🚀 Terraform Cost Predictor ML Training")
    print("=" * 50)
    
    # Create necessary directories
    os.makedirs('data', exist_ok=True)
    os.makedirs('models', exist_ok=True)
    
    # Step 1: Data Collection
    print("\n📊 Step 1: Data Collection")
    print("-" * 30)
    
    from ml.data_collector import AWSPricingCollector
    
    # Check if training data exists
    training_data_path = 'data/training_data.csv'
    if args.force_regenerate or not os.path.exists(training_data_path):
        print("Generating new training data...")
        collector = AWSPricingCollector()
        
        # Save pricing data
        collector.save_pricing_data()
        
        # Generate training data
        training_data = collector.generate_training_data(args.samples)
        training_data.to_csv(training_data_path, index=False)
        print(f"✅ Generated {len(training_data)} training samples")
    else:
        print("✅ Using existing training data")
        import pandas as pd
        training_data = pd.read_csv(training_data_path)
        print(f"✅ Loaded {len(training_data)} existing samples")
    
    # Step 2: Model Training
    print("\n🤖 Step 2: Model Training")
    print("-" * 30)
    
    from ml.model_trainer import CostModelTrainer
    
    trainer = CostModelTrainer()
    
    # Prepare data
    X, y = trainer.prepare_data(training_data)
    
    # Train models
    results = trainer.train_models(X, y)
    
    # Step 3: Hyperparameter Tuning (optional)
    if args.hyperparameter_tuning:
        print("\n⚙️ Step 3: Hyperparameter Tuning")
        print("-" * 30)
        trainer.hyperparameter_tuning(X, y)
    
    # Step 4: Save Models
    print("\n💾 Step 4: Save Models")
    print("-" * 30)
    trainer.save_models()
    
    # Step 5: Generate Report
    trainer.generate_training_report(results)
    
    # Step 6: Test Prediction
    print("\n🧪 Step 6: Test Prediction")
    print("-" * 30)
    
    # Test with sample data
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
    
    sample_resources = [
        {'category': 'EC2', 'features': {'instance_type': 't3.large', 'instance_count': 3}},
        {'category': 'RDS', 'features': {'instance_type': 'db.t3.medium', 'multi_az': True}},
        {'category': 'EBS', 'features': {'volume_size_gb': 100, 'volume_type': 'gp3'}},
    ]
    
    prediction = trainer.predict(sample_features)
    print(f"Sample prediction: ${prediction['predicted_cost']:.2f}")
    print(f"Confidence: {prediction['confidence_score']:.1f}%")
    
    print("\n🎉 Training completed successfully!")
    print("=" * 50)
    print("The ML model is now ready for production use.")
    print("Start the backend API to use the trained model.")
    
    # Model info
    model_info = trainer.get_model_info() if hasattr(trainer, 'get_model_info') else {}
    if model_info:
        print(f"\n📈 Model Performance:")
        print(f"   R² Score: {model_info.get('performance', {}).get('r2_score', 'N/A')}")
        print(f"   RMSE: ${model_info.get('performance', {}).get('rmse', 'N/A')}")


if __name__ == "__main__":
    main()
