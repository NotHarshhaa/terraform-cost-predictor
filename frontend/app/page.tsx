"use client";

import { useState } from "react";
import { 
  DollarSign, 
  Zap, 
  AlertCircle, 
  Cloud, 
  BarChart3, 
  Server,
  Database,
  Globe,
  ArrowRight,
  BookOpen,
  FileText} from "lucide-react";
import FileUploader from "@/components/file-uploader";
import CostDashboard from "@/components/cost-dashboard";
import LandingPage from "@/components/landing-page";
import { predictCost, type PredictionResult } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
  </svg>
);

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

  const handleClearAll = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
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
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="https://github.com/NotHarshhaa/terraform-cost-predictor"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubIcon className="h-5 w-5" />
            </a>
          </div>
        </div>
      </header>

      <main className={result || error ? "container mx-auto px-4 py-8 max-w-5xl" : ""}>
        {!result && !error && (
          <LandingPage 
            fileUploadSection={
              <section id="file-upload-section" className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30">
                <div className="container mx-auto px-4 max-w-5xl">
                  <div className="text-center mb-8">
                    <Badge variant="secondary" className="mb-4">
                      <Zap className="h-3.5 w-3.5 mr-2" />
                      Start Your Analysis
                    </Badge>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Try It Now</h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                      Upload your Terraform files and get instant ML-powered cost predictions
                    </p>
                  </div>
                  <FileUploader onAnalyze={handleAnalyze} onClear={handleClearAll} isLoading={isLoading} />
                </div>
              </section>
            }
          />
        )}

        {(result || error) && (
          <div className="mb-8">
            <FileUploader onAnalyze={handleAnalyze} onClear={handleClearAll} isLoading={isLoading} />
          </div>
        )}

        {error && (
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Analysis Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please check your Terraform files and try again.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {result && <CostDashboard result={result} />}
      </main>

      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Terraform Cost Predictor. Built with Next.js, FastAPI, and ML.</p>
        </div>
      </footer>
    </div>
  );
}
