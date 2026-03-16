const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ResourceDetail {
  name: string;
  type: string;
  category: string;
  features: Record<string, any>;
}

export interface PredictionResult {
  estimated_monthly_cost: number;
  confidence_score: number;
  breakdown: Record<string, number>;
  resources: ResourceDetail[];
  total_resources: number;
  features: Record<string, any>;
  model_type: string;
  currency: string;
  message?: string;
  parse_errors: Array<{ file: string; error: string }>;
}

export async function predictCost(files: File[]): Promise<PredictionResult> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.json();
}
