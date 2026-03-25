import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          status: 'unhealthy',
          backend: 'unreachable',
          message: 'Backend service is not responding'
        },
        { status: 503 }
      );
    }

    const data = await response.json();
    return NextResponse.json({
      status: 'healthy',
      backend: 'connected',
      backendHealth: data
    });
  } catch (error: any) {
    return NextResponse.json(
      { 
        status: 'unhealthy',
        backend: 'error',
        message: error.message || 'Cannot connect to backend service'
      },
      { status: 503 }
    );
  }
}
