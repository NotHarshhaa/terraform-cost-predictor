#!/usr/bin/env python3
"""
Export trained scikit-learn models to ONNX format for browser compatibility
"""

import pickle
import numpy as np
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import os

def export_model_to_onnx():
    print("🔄 Exporting ML model to ONNX format...")
    print("=" * 50)
    
    # Load the trained model
    model_path = 'models/best_model.joblib'
    if not os.path.exists(model_path):
        print(f"❌ Model not found at {model_path}")
        print("Please train the model first using: python train_model.py")
        return
    
    import joblib
    model = joblib.load(model_path)
    
    print(f"✅ Loaded model: {type(model).__name__}")
    
    # Define input shape (20 features)
    initial_type = [('float_input', FloatTensorType([None, 20]))]
    
    # Convert to ONNX
    try:
        onnx_model = convert_sklearn(
            model,
            initial_types=initial_type,
            target_opset=12
        )
        
        # Save ONNX model
        onnx_path = 'models/cost_predictor.onnx'
        with open(onnx_path, 'wb') as f:
            f.write(onnx_model.SerializeToString())
        
        print(f"✅ Model exported to: {onnx_path}")
        
        # Get model size
        size_mb = os.path.getsize(onnx_path) / (1024 * 1024)
        print(f"📦 Model size: {size_mb:.2f} MB")
        
        # Test the ONNX model
        print("\n🧪 Testing ONNX model...")
        import onnxruntime as rt
        
        sess = rt.InferenceSession(onnx_path)
        input_name = sess.get_inputs()[0].name
        
        # Test with sample data
        test_input = np.array([[
            3.0,   # ec2_count
            24.0,  # ec2_total_memory
            8.0,   # ec2_total_vcpu
            1.0,   # rds_count
            16.0,  # rds_total_memory
            100.0, # rds_total_storage
            1.0,   # rds_multi_az
            5.0,   # ebs_volume_count
            500.0, # ebs_total_gb
            2.0,   # s3_bucket_count
            1000.0,# s3_total_gb
            1.0,   # has_nat_gateway
            1.0,   # has_load_balancer
            1.0,   # has_vpc
            2.0,   # subnet_count
            0.0,   # lambda_count
            0.0,   # dynamodb_count
            12.0,  # total_resources
            150.0, # infrastructure_complexity
            400.0  # estimated_monthly_cost
        ]], dtype=np.float32)
        
        prediction = sess.run(None, {input_name: test_input})[0]
        print(f"✅ Test prediction: ${prediction[0]:.2f}")
        
        print("\n🎉 Export completed successfully!")
        print("=" * 50)
        print("The ONNX model is ready for use in the browser.")
        print(f"Copy {onnx_path} to frontend/public/models/")
        
    except Exception as e:
        print(f"❌ Error during export: {e}")
        print("\nMake sure you have the required packages:")
        print("  pip install skl2onnx onnxruntime")

if __name__ == "__main__":
    export_model_to_onnx()
