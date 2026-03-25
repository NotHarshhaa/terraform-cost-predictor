import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const response = await fetch(`${BACKEND_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        detail: 'Failed to analyze files' 
      }));
      return NextResponse.json(
        { detail: error.detail || 'Failed to analyze Terraform configuration' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { 
        detail: error.message || 'Failed to connect to prediction service. Make sure the backend is running.' 
      },
      { status: 500 }
    );
  }
}
