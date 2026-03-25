import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'healthy',
      service: 'terraform-cost-predictor',
      version: '2.0.0',
      mode: 'unified',
      message: 'All systems operational',
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        message: error.message || 'Service error'
      },
      { status: 503 }
    );
  }
}
