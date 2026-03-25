import { NextRequest, NextResponse } from 'next/server';
import { parseTerraformFiles, extractResourceDetails } from '@/lib/parser';
import { estimateCost } from '@/lib/estimator';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { detail: 'No files uploaded' },
        { status: 400 }
      );
    }

    // Read and parse Terraform files
    const tfFiles: Record<string, string> = {};
    
    for (const file of files) {
      if (!file.name.endsWith('.tf')) {
        continue;
      }
      const content = await file.text();
      tfFiles[file.name] = content;
    }

    if (Object.keys(tfFiles).length === 0) {
      return NextResponse.json(
        { detail: 'No valid Terraform (.tf) files found in upload' },
        { status: 400 }
      );
    }

    // Parse Terraform files
    const parsed = await parseTerraformFiles(tfFiles);

    if (parsed.resources.length === 0) {
      return NextResponse.json({
        total_estimated_cost: 0,
        confidence_score: 0,
        resources: [],
        category_breakdown: [],
        processing_time: 0,
        model_type: 'Rule-based Cost Estimator',
        currency: 'USD',
        message: 'No AWS resources detected in the uploaded Terraform files.',
        parse_errors: parsed.errors,
      });
    }

    // Estimate costs
    const prediction = estimateCost(parsed.resources);

    return NextResponse.json({
      ...prediction,
      parse_errors: parsed.errors,
    });

  } catch (error: any) {
    console.error('Prediction API error:', error);
    return NextResponse.json(
      { 
        detail: error.message || 'Failed to analyze Terraform configuration' 
      },
      { status: 500 }
    );
  }
}
