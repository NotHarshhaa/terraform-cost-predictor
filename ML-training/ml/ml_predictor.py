"""
Production ML predictor using trained models.
Replaces the rule-based system with actual machine learning predictions.
"""

import pandas as pd
import numpy as np
import joblib
import json
import os
from typing import Dict, Any, List
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MLPredictor:
    """Production ML predictor for infrastructure cost estimation."""
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        self.model = None
        self.feature_columns = []
        self.metrics = {}
        self.is_loaded = False
        
        # Try to load the model
        self._load_model()
    
    def _load_model(self) -> bool:
        """Load the trained ML model."""
        try:
            model_path = os.path.join(self.model_dir, 'best_model.joblib')
            features_path = os.path.join(self.model_dir, 'features.json')
            metrics_path = os.path.join(self.model_dir, 'metrics.json')
            
            if not all(os.path.exists(p) for p in [model_path, features_path, metrics_path]):
                logger.warning("Trained model not found. Please run training first.")
                return False
            
            # Load model
            self.model = joblib.load(model_path)
            
            # Load feature columns
            with open(features_path, 'r') as f:
                self.feature_columns = json.load(f)
            
            # Load metrics
            with open(metrics_path, 'r') as f:
                self.metrics = json.load(f)
            
            self.is_loaded = True
            logger.info("ML model loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return False
    
    def predict_cost(self, features: Dict[str, Any], resource_details: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Predict infrastructure cost using trained ML model.
        
        Args:
            features: Extracted features from terraform configuration
            resource_details: Detailed resource information
            
        Returns:
            Prediction results with cost, confidence, and breakdown
        """
        if not self.is_loaded:
            logger.warning("ML model not loaded, falling back to rule-based estimation")
            return self._fallback_prediction(features, resource_details)
        
        try:
            # Convert features to ML format
            ml_features = self._convert_to_ml_features(features, resource_details)
            
            # Apply feature engineering
            ml_features = self._apply_feature_engineering(ml_features)
            
            # Make prediction
            prediction = self._predict_with_model(ml_features)
            
            # Generate detailed breakdown
            breakdown = self._generate_breakdown(resource_details)
            
            # Calculate confidence based on model performance and feature coverage
            confidence = self._calculate_confidence(features, resource_details)
            
            return {
                'estimated_monthly_cost': round(prediction['cost'], 2),
                'confidence_score': confidence,
                'breakdown': breakdown,
                'model_type': 'Trained Gradient Boosting Regressor',
                'currency': 'USD',
                'feature_importance': prediction.get('feature_importance', {}),
                'prediction_method': 'ml'
            }
            
        except Exception as e:
            logger.error(f"Error in ML prediction: {e}")
            return self._fallback_prediction(features, resource_details)
    
    def _convert_to_ml_features(self, features: Dict[str, Any], resource_details: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Convert terraform features to ML model features."""
        ml_features = {
            # Basic counts
            'ec2_count': features.get('ec2_count', 0),
            'rds_count': features.get('rds_count', 0),
            'ebs_volume_count': features.get('ebs_count', 0),
            's3_bucket_count': features.get('s3_count', 0),
            'has_nat_gateway': int(features.get('networking_count', 0) > 0),
            'has_load_balancer': int(features.get('lb_count', 0) > 0),
            
            # Resource specifications
            'ec2_total_memory': self._calculate_total_memory(resource_details, 'EC2'),
            'ec2_total_vcpu': self._calculate_total_vcpu(resource_details, 'EC2'),
            'rds_total_memory': self._calculate_total_memory(resource_details, 'RDS'),
            'rds_multi_az': int(features.get('rds_multi_az_count', 0) > 0),
            'ebs_total_gb': self._calculate_total_storage(resource_details, 'EBS'),
            's3_total_gb': self._estimate_s3_usage(resource_details),
            
            # Total resources
            'total_resources': len(resource_details) if resource_details else 1,
        }
        
        return ml_features
    
    def _apply_feature_engineering(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Apply the same feature engineering used during training."""
        df = pd.DataFrame([features])
        
        # Resource density features
        df['memory_per_vcpu'] = df['ec2_total_memory'] / (df['ec2_total_vcpu'] + 1)
        df['storage_per_resource'] = df['ebs_total_gb'] / (df['total_resources'] + 1)
        df['s3_per_ec2'] = df['s3_total_gb'] / (df['ec2_count'] + 1)
        
        # Complexity features
        df['has_database'] = (df['rds_count'] > 0).astype(int)
        df['has_storage'] = (df['ebs_volume_count'] > 0).astype(int)
        df['has_s3'] = (df['s3_bucket_count'] > 0).astype(int)
        
        # Cost drivers
        df['compute_score'] = df['ec2_total_vcpu'] * 10 + df['ec2_total_memory']
        df['storage_score'] = df['ebs_total_gb'] + df['s3_total_gb']
        df['networking_score'] = df['has_nat_gateway'] * 100 + df['has_load_balancer'] * 50
        
        # Interaction features
        df['ec2_rds_interaction'] = df['ec2_count'] * df['rds_count']
        df['compute_storage_ratio'] = df['compute_score'] / (df['storage_score'] + 1)
        
        # Log transformations
        df['log_total_resources'] = np.log1p(df['total_resources'])
        
        return df.iloc[0].to_dict()
    
    def _predict_with_model(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction using the trained ML model."""
        # Convert to DataFrame
        feature_df = pd.DataFrame([features])
        
        # Ensure all required features are present
        missing_features = set(self.feature_columns) - set(feature_df.columns)
        for feature in missing_features:
            feature_df[feature] = 0
        
        # Select only features used during training
        feature_df = feature_df[self.feature_columns]
        
        # Make prediction
        prediction = self.model.predict(feature_df)[0]
        
        # Get feature importance if available
        feature_importance = {}
        if hasattr(self.model.named_steps['model'], 'feature_importances_'):
            importances = self.model.named_steps['model'].feature_importances_
            feature_names = self.feature_columns
            importance_dict = dict(zip(feature_names, importances))
            # Return top 5 features
            feature_importance = dict(sorted(importance_dict.items(), 
                                          key=lambda x: x[1], reverse=True)[:5])
        
        return {
            'cost': max(0, prediction),  # Ensure non-negative
            'feature_importance': feature_importance
        }
    
    def _calculate_total_memory(self, resource_details: List[Dict[str, Any]], category: str) -> float:
        """Calculate total memory for a resource category."""
        total_memory = 0.0
        
        for resource in resource_details:
            if resource.get('category') == category:
                features = resource.get('features', {})
                if category == 'EC2':
                    # Estimate memory based on instance type
                    instance_type = features.get('instance_type', 't3.micro')
                    memory_map = {
                        'nano': 0.5, 'micro': 1.0, 'small': 2.0, 'medium': 4.0,
                        'large': 8.0, 'xlarge': 16.0, '2xlarge': 32.0
                    }
                    for size, memory in memory_map.items():
                        if size in instance_type:
                            total_memory += memory * features.get('instance_count', 1)
                            break
                elif category == 'RDS':
                    # RDS memory estimation
                    instance_type = features.get('instance_type', 'db.t3.micro')
                    memory_map = {
                        'micro': 1.0, 'small': 2.0, 'medium': 4.0,
                        'large': 8.0, 'xlarge': 16.0, '2xlarge': 32.0
                    }
                    for size, memory in memory_map.items():
                        if size in instance_type:
                            total_memory += memory
                            break
        
        return total_memory
    
    def _calculate_total_vcpu(self, resource_details: List[Dict[str, Any]], category: str) -> float:
        """Calculate total vCPU for a resource category."""
        total_vcpu = 0.0
        
        for resource in resource_details:
            if resource.get('category') == category:
                features = resource.get('features', {})
                if category == 'EC2':
                    # Estimate vCPU based on instance type
                    instance_type = features.get('instance_type', 't3.micro')
                    vcpu_map = {
                        'nano': 2, 'micro': 2, 'small': 2, 'medium': 2,
                        'large': 2, 'xlarge': 4, '2xlarge': 8
                    }
                    for size, vcpu in vcpu_map.items():
                        if size in instance_type:
                            total_vcpu += vcpu * features.get('instance_count', 1)
                            break
        
        return total_vcpu
    
    def _calculate_total_storage(self, resource_details: List[Dict[str, Any]], category: str) -> float:
        """Calculate total storage for a resource category."""
        total_storage = 0.0
        
        for resource in resource_details:
            if resource.get('category') == category:
                features = resource.get('features', {})
                if category == 'EBS':
                    total_storage += features.get('volume_size_gb', 20)
        
        return total_storage
    
    def _estimate_s3_usage(self, resource_details: List[Dict[str, Any]]) -> float:
        """Estimate S3 usage based on bucket count and typical usage patterns."""
        s3_count = sum(1 for r in resource_details if r.get('category') == 'S3')
        # Estimate average usage per bucket (could be made more sophisticated)
        estimated_usage_gb = s3_count * 100  # 100GB average per bucket
        return estimated_usage_gb
    
    def _generate_breakdown(self, resource_details: List[Dict[str, Any]]) -> Dict[str, float]:
        """Generate cost breakdown by resource category."""
        breakdown = {}
        
        # Simple heuristic breakdown based on resource types
        # In a real system, this could use separate models for each category
        category_costs = {
            'EC2': 0.4,    # 40% of total cost
            'RDS': 0.3,     # 30% of total cost
            'EBS': 0.15,    # 15% of total cost
            'S3': 0.05,     # 5% of total cost
            'Networking': 0.1  # 10% of total cost
        }
        
        # Count resources by category
        category_counts = {}
        for resource in resource_details:
            category = resource.get('category', 'Other')
            category_counts[category] = category_counts.get(category, 0) + 1
        
        # Allocate costs based on resource distribution
        total_resources = sum(category_counts.values())
        if total_resources > 0:
            for category, count in category_counts.items():
                base_percentage = category_costs.get(category, 0.05)
                # Adjust based on actual resource count
                adjusted_percentage = base_percentage * (count / max(1, total_resources / 5))
                breakdown[category] = round(adjusted_percentage * 100, 1)
        
        return breakdown
    
    def _calculate_confidence(self, features: Dict[str, Any], resource_details: List[Dict[str, Any]]) -> float:
        """Calculate prediction confidence score."""
        # Base confidence from model performance
        base_confidence = self.metrics.get('Gradient Boosting', {}).get('r2', 0.8) * 100
        
        # Adjust based on feature coverage
        known_resources = sum(1 for r in resource_details if r.get('category') != 'Other')
        total_resources = len(resource_details) if resource_details else 1
        coverage = known_resources / total_resources if total_resources > 0 else 0
        
        # Adjust confidence based on how well the infrastructure matches training data
        coverage_adjustment = coverage * 20  # Up to 20% adjustment
        
        # Adjust based on infrastructure complexity
        complexity_penalty = 0
        if total_resources > 50:
            complexity_penalty = 5  # Slightly lower confidence for very large infrastructures
        
        final_confidence = min(95.0, max(60.0, base_confidence + coverage_adjustment - complexity_penalty))
        
        return round(final_confidence, 1)
    
    def _fallback_prediction(self, features: Dict[str, Any], resource_details: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback rule-based prediction when ML model is not available."""
        # Simple rule-based estimation
        total_cost = 0.0
        breakdown = {}
        
        # Basic cost estimation rules
        if features.get('ec2_count', 0) > 0:
            ec2_cost = features['ec2_count'] * 50  # $50 per EC2 instance average
            breakdown['EC2'] = round(ec2_cost, 2)
            total_cost += ec2_cost
        
        if features.get('rds_count', 0) > 0:
            rds_cost = features['rds_count'] * 100  # $100 per RDS instance average
            breakdown['RDS'] = round(rds_cost, 2)
            total_cost += rds_cost
        
        if features.get('ebs_count', 0) > 0:
            ebs_cost = features['ebs_count'] * 10  # $10 per EBS volume average
            breakdown['EBS'] = round(ebs_cost, 2)
            total_cost += ebs_cost
        
        if features.get('s3_count', 0) > 0:
            s3_cost = features['s3_count'] * 5  # $5 per S3 bucket average
            breakdown['S3'] = round(s3_cost, 2)
            total_cost += s3_cost
        
        if features.get('lb_count', 0) > 0:
            lb_cost = features['lb_count'] * 25  # $25 per load balancer
            breakdown['LoadBalancer'] = round(lb_cost, 2)
            total_cost += lb_cost
        
        return {
            'estimated_monthly_cost': round(total_cost, 2),
            'confidence_score': 65.0,  # Lower confidence for fallback
            'breakdown': breakdown,
            'model_type': 'Rule-based Fallback',
            'currency': 'USD',
            'prediction_method': 'fallback'
        }
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about the loaded model."""
        if not self.is_loaded:
            return {
                'status': 'not_loaded',
                'message': 'No trained model found. Please run training first.'
            }
        
        try:
            with open(os.path.join(self.model_dir, 'metadata.json'), 'r') as f:
                metadata = json.load(f)
            
            return {
                'status': 'loaded',
                'model_type': metadata.get('model_type', 'Unknown'),
                'feature_count': len(self.feature_columns),
                'training_date': metadata.get('training_date', 'Unknown'),
                'performance': {
                    'r2_score': self.metrics.get('Gradient Boosting', {}).get('r2', 0),
                    'rmse': self.metrics.get('Gradient Boosting', {}).get('rmse', 0)
                }
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Error loading model info: {e}'
            }


# Global predictor instance
_predictor = None

def get_predictor() -> MLPredictor:
    """Get or create the global predictor instance."""
    global _predictor
    if _predictor is None:
        _predictor = MLPredictor()
    return _predictor
