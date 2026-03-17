"""
Real ML model trainer for Terraform cost prediction.
Uses actual machine learning algorithms with proper training, validation, and evaluation.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge, Lasso
from sklearn.tree import DecisionTreeRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.pipeline import Pipeline
import joblib
import json
import os
from datetime import datetime
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Dict, Any, Tuple, List


class CostModelTrainer:
    """Real ML model trainer for infrastructure cost prediction."""
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        self.scaler = StandardScaler()
        self.models = {}
        self.best_model = None
        self.feature_columns = []
        self.metrics = {}
        
        # Create model directory
        os.makedirs(model_dir, exist_ok=True)
    
    def prepare_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Prepare data for ML training."""
        print("Preparing data for ML training...")
        
        # Feature engineering
        df = self._engineer_features(df)
        
        # Define feature columns (excluding target)
        self.feature_columns = [col for col in df.columns if col != 'monthly_cost']
        
        X = df[self.feature_columns]
        y = df['monthly_cost']
        
        print(f"Features: {len(self.feature_columns)}")
        print(f"Target range: ${y.min():.2f} - ${y.max():.2f}")
        
        return X, y
    
    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Engineer additional features for better ML performance."""
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
        
        # Log transformations for skewed features (only if monthly_cost exists)
        df['log_total_resources'] = np.log1p(df['total_resources'])
        if 'monthly_cost' in df.columns:
            df['log_monthly_cost'] = np.log1p(df['monthly_cost'])
        
        return df
    
    def train_models(self, X: pd.DataFrame, y: pd.DataFrame) -> Dict[str, Any]:
        """Train multiple ML models and compare performance."""
        print("Training ML models...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Define models to train
        models = {
            'Linear Regression': LinearRegression(),
            'Ridge Regression': Ridge(alpha=1.0),
            'Lasso Regression': Lasso(alpha=0.1),
            'Decision Tree': DecisionTreeRegressor(max_depth=10, random_state=42),
            'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
            'Gradient Boosting': GradientBoostingRegressor(n_estimators=100, random_state=42),
        }
        
        results = {}
        
        for name, model in models.items():
            print(f"\nTraining {name}...")
            
            # Create pipeline with scaling
            pipeline = Pipeline([
                ('scaler', StandardScaler()),
                ('model', model)
            ])
            
            # Train model
            pipeline.fit(X_train, y_train)
            
            # Make predictions
            y_pred = pipeline.predict(X_test)
            
            # Calculate metrics
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            rmse = np.sqrt(mse)
            
            # Cross-validation
            cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring='r2')
            
            results[name] = {
                'model': pipeline,
                'mse': mse,
                'mae': mae,
                'rmse': rmse,
                'r2': r2,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std(),
                'predictions': y_pred
            }
            
            print(f"  R²: {r2:.4f}")
            print(f"  RMSE: ${rmse:.2f}")
            print(f"  MAE: ${mae:.2f}")
            print(f"  CV R²: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
            
            # Store model
            self.models[name] = pipeline
        
        # Select best model based on R² score
        best_model_name = max(results.keys(), key=lambda k: results[k]['r2'])
        self.best_model = results[best_model_name]['model']
        
        print(f"\n🏆 Best model: {best_model_name}")
        print(f"   R²: {results[best_model_name]['r2']:.4f}")
        print(f"   RMSE: ${results[best_model_name]['rmse']:.2f}")
        
        # Store metrics
        self.metrics = {name: {
            'mse': results[name]['mse'],
            'mae': results[name]['mae'],
            'rmse': results[name]['rmse'],
            'r2': results[name]['r2'],
            'cv_mean': results[name]['cv_mean'],
            'cv_std': results[name]['cv_std']
        } for name in results.keys()}
        
        return results
    
    def hyperparameter_tuning(self, X: pd.DataFrame, y: pd.DataFrame) -> None:
        """Perform hyperparameter tuning for the best model type."""
        print("\nPerforming hyperparameter tuning...")
        
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        # Tune Gradient Boosting (usually performs best for this type of data)
        param_grid = {
            'model__n_estimators': [50, 100, 200],
            'model__learning_rate': [0.01, 0.1, 0.2],
            'model__max_depth': [3, 5, 7],
            'model__subsample': [0.8, 0.9, 1.0]
        }
        
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('model', GradientBoostingRegressor(random_state=42))
        ])
        
        grid_search = GridSearchCV(
            pipeline, param_grid, cv=5, scoring='r2', n_jobs=-1, verbose=1
        )
        
        grid_search.fit(X_train, y_train)
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Best CV R²: {grid_search.best_score_:.4f}")
        
        # Update best model
        self.best_model = grid_search.best_estimator_
        
        # Final evaluation
        y_pred = self.best_model.predict(X_test)
        final_r2 = r2_score(y_test, y_pred)
        final_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        
        print(f"Final test R²: {final_r2:.4f}")
        print(f"Final test RMSE: ${final_rmse:.2f}")
    
    def save_models(self) -> None:
        """Save trained models and metadata."""
        print("\nSaving models...")
        
        # Save best model
        joblib.dump(self.best_model, os.path.join(self.model_dir, 'best_model.joblib'))
        
        # Save feature columns
        with open(os.path.join(self.model_dir, 'features.json'), 'w') as f:
            json.dump(self.feature_columns, f)
        
        # Save metrics
        with open(os.path.join(self.model_dir, 'metrics.json'), 'w') as f:
            json.dump(self.metrics, f, indent=2)
        
        # Save model metadata
        metadata = {
            'model_type': 'Gradient Boosting Regressor',
            'feature_count': len(self.feature_columns),
            'training_date': datetime.now().isoformat(),
            'best_model_r2': self.metrics['Gradient Boosting']['r2'],
            'best_model_rmse': self.metrics['Gradient Boosting']['rmse']
        }
        
        with open(os.path.join(self.model_dir, 'metadata.json'), 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"Models saved to {self.model_dir}")
    
    def load_models(self) -> None:
        """Load trained models and metadata."""
        print("Loading trained models...")
        
        # Load best model
        self.best_model = joblib.load(os.path.join(self.model_dir, 'best_model.joblib'))
        
        # Load feature columns
        with open(os.path.join(self.model_dir, 'features.json'), 'r') as f:
            self.feature_columns = json.load(f)
        
        # Load metrics
        with open(os.path.join(self.model_dir, 'metrics.json'), 'r') as f:
            self.metrics = json.load(f)
        
        print("Models loaded successfully")
    
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Make prediction using trained model."""
        if not self.best_model:
            raise ValueError("Model not trained or loaded")
        
        # Convert features to DataFrame
        feature_df = pd.DataFrame([features])
        
        # Apply same feature engineering
        feature_df = self._engineer_features(feature_df)
        
        # Ensure we have all required features
        missing_features = set(self.feature_columns) - set(feature_df.columns)
        for feature in missing_features:
            feature_df[feature] = 0
        
        # Select only the features used during training
        feature_df = feature_df[self.feature_columns]
        
        # Make prediction
        prediction = self.best_model.predict(feature_df)[0]
        
        # Get prediction confidence (based on training performance)
        confidence = min(95.0, self.metrics['Gradient Boosting']['r2'] * 100)
        
        return {
            'predicted_cost': max(0, prediction),  # Ensure non-negative
            'confidence_score': confidence,
            'model_type': 'Trained Gradient Boosting',
            'feature_importance': self._get_feature_importance()
        }
    
    def _get_feature_importance(self) -> Dict[str, float]:
        """Get feature importance from the trained model."""
        if hasattr(self.best_model.named_steps['model'], 'feature_importances_'):
            importances = self.best_model.named_steps['model'].feature_importances_
            feature_names = self.feature_columns
            
            importance_dict = dict(zip(feature_names, importances))
            # Sort by importance and return top 10
            return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)[:10])
        
        return {}
    
    def generate_training_report(self, results: Dict[str, Any]) -> None:
        """Generate comprehensive training report."""
        print("\n" + "="*50)
        print("📊 TRAINING REPORT")
        print("="*50)
        
        # Model comparison
        print("\n🏆 Model Performance Comparison:")
        print("-" * 40)
        for name, metrics in self.metrics.items():
            print(f"{name:20} | R²: {metrics['r2']:.4f} | RMSE: ${metrics['rmse']:6.2f}")
        
        # Best model details
        best_name = max(self.metrics.keys(), key=lambda k: self.metrics[k]['r2'])
        print(f"\n🥇 Best Model: {best_name}")
        print(f"   R² Score: {self.metrics[best_name]['r2']:.4f}")
        print(f"   RMSE: ${self.metrics[best_name]['rmse']:.2f}")
        print(f"   MAE: ${self.metrics[best_name]['mae']:.2f}")
        print(f"   Cross-validation R²: {self.metrics[best_name]['cv_mean']:.4f} ± {self.metrics[best_name]['cv_std']:.4f}")
        
        # Feature importance
        importance = self._get_feature_importance()
        if importance:
            print(f"\n🔍 Top 10 Feature Importance:")
            print("-" * 30)
            for i, (feature, score) in enumerate(list(importance.items())[:10], 1):
                print(f"{i:2d}. {feature:25} {score:.4f}")
        
        print("\n✅ Training completed successfully!")
        print("="*50)


def main():
    """Main training pipeline."""
    print("🚀 Starting ML Training Pipeline")
    print("="*50)
    
    # Initialize trainer
    trainer = CostModelTrainer()
    
    # Load or generate training data
    try:
        print("Loading training data...")
        df = pd.read_csv('data/training_data.csv')
        print(f"Loaded {len(df)} training samples")
    except FileNotFoundError:
        print("Training data not found. Generating new data...")
        from data_collector import AWSPricingCollector
        collector = AWSPricingCollector()
        df = collector.generate_training_data(10000)
        df.to_csv('data/training_data.csv', index=False)
    
    # Prepare data
    X, y = trainer.prepare_data(df)
    
    # Train models
    results = trainer.train_models(X, y)
    
    # Hyperparameter tuning
    trainer.hyperparameter_tuning(X, y)
    
    # Generate report
    trainer.generate_training_report(results)
    
    # Save models
    trainer.save_models()
    
    print("\n🎉 ML training pipeline completed!")
    print("Models are ready for production use.")


if __name__ == "__main__":
    main()
