export interface ResourceCost {
  resource_type: string;
  resource_name: string;
  estimated_cost: number;
  confidence_score: number;
}

export interface CategoryBreakdown {
  category: string;
  total_cost: number;
  resource_count: number;
}

export interface PredictionResult {
  total_estimated_cost: number;
  confidence_score: number;
  resources: ResourceCost[];
  category_breakdown: CategoryBreakdown[];
  processing_time: number;
}

export interface HealthStatus {
  status: string;
  backend: string;
  message?: string;
  backendHealth?: any;
}

export async function predictCost(files: File[]): Promise<PredictionResult> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("/api/predict", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to analyze files" }));
    throw new Error(error.detail || "Failed to analyze Terraform configuration");
  }

  return response.json();
}

export async function checkHealth(): Promise<HealthStatus> {
  const response = await fetch("/api/health");
  return response.json();
}
