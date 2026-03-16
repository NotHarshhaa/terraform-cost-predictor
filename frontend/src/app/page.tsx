"use client";

import React, { useState } from "react";
import { DollarSign, Github, Zap, AlertCircle } from "lucide-react";
import FileUploader from "@/components/FileUploader";
import CostDashboard from "@/components/CostDashboard";
import { predictCost, type PredictionResult } from "@/services/api";

export default function Home() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (files: File[]) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const prediction = await predictCost(files);
      setResult(prediction);
    } catch (err: any) {
      setError(err.message || "Failed to analyze Terraform configuration");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Terraform Cost Predictor</h1>
              <p className="text-xs text-muted-foreground">ML-powered infrastructure cost estimation</p>
            </div>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Hero Section */}
        {!result && !error && (
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="h-3.5 w-3.5" />
              ML-Powered Cost Prediction
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Predict Cloud Costs from
              <span className="text-primary"> Terraform</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload your Terraform configuration files and get instant cost estimates
              powered by machine learning. Know your infrastructure costs before deployment.
            </p>
          </div>
        )}

        {/* File Uploader */}
        <div className="mb-8">
          <FileUploader onAnalyze={handleAnalyze} isLoading={isLoading} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 rounded-lg border border-destructive/50 bg-destructive/5 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-destructive">Analysis Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure the backend API is running at{" "}
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs">http://localhost:8000</code>
              </p>
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {result && <CostDashboard result={result} />}

        {/* Features Section */}
        {!result && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="rounded-full bg-blue-100 text-blue-600 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Instant Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Upload Terraform files and get cost predictions in seconds
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="rounded-full bg-purple-100 text-purple-600 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Cost Breakdown</h3>
              <p className="text-sm text-muted-foreground">
                Detailed per-resource cost estimates with interactive charts
              </p>
            </div>
            <div className="text-center p-6 rounded-lg border bg-card">
              <div className="rounded-full bg-green-100 text-green-600 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">ML Confidence</h3>
              <p className="text-sm text-muted-foreground">
                Confidence scoring for prediction accuracy and reliability
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Terraform Cost Predictor &mdash; ML-powered infrastructure cost estimation
        </div>
      </footer>
    </div>
  );
}
