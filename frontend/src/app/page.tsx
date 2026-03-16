"use client";

import React, { useState } from "react";
import { 
  DollarSign, 
  Github, 
  Zap, 
  AlertCircle, 
  Cloud, 
  Shield, 
  BarChart3, 
  Users, 
  Clock,
  CheckCircle,
  TrendingUp,
  Server,
  Database,
  Globe,
  ArrowRight,
  BookOpen,
  Code,
  FileText
} from "lucide-react";
import FileUploader from "@/components/FileUploader";
import CostDashboard from "@/components/CostDashboard";
import { predictCost, type PredictionResult } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
            <Badge variant="secondary" className="mb-4">
              <Zap className="h-3.5 w-3.5 mr-2" />
              ML-Powered Cost Prediction
            </Badge>
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
          <Card className="mb-8 border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-destructive">Analysis Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Make sure the backend API is running at{" "}
                    <Badge variant="outline" className="text-xs">http://localhost:8000</Badge>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Dashboard */}
        {result && <CostDashboard result={result} />}

        {/* How It Works Section */}
        {!result && !error && (
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Get accurate cost predictions in three simple steps
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-primary/10 text-primary w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8" />
                  </div>
                  <CardTitle className="mb-2">1. Upload Files</CardTitle>
                  <CardDescription>
                    Drag and drop your Terraform configuration files (.tf) or browse to select them
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-primary/10 text-primary w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Zap className="h-8 w-8" />
                  </div>
                  <CardTitle className="mb-2">2. AI Analysis</CardTitle>
                  <CardDescription>
                    Our ML model parses your infrastructure and extracts resource features
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="rounded-full bg-primary/10 text-primary w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8" />
                  </div>
                  <CardTitle className="mb-2">3. Get Insights</CardTitle>
                  <CardDescription>
                    Receive detailed cost breakdowns with confidence scores and visualizations
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Supported Resources Section */}
        {!result && !error && (
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Supported AWS Resources</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Comprehensive support for major AWS infrastructure components
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Server className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">EC2 Instances</span>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Database className="h-5 w-5 text-purple-500" />
                  <span className="font-medium">RDS Databases</span>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Cloud className="h-5 w-5 text-green-500" />
                  <span className="font-medium">S3 Buckets</span>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Globe className="h-5 w-5 text-cyan-500" />
                  <span className="font-medium">Load Balancers</span>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Shield className="h-5 w-5 text-orange-500" />
                  <span className="font-medium">EBS Volumes</span>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Globe className="h-5 w-5 text-pink-500" />
                  <span className="font-medium">VPC & Networking</span>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">Lambda Functions</span>
                </CardContent>
              </Card>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-3">
                  <Database className="h-5 w-5 text-red-500" />
                  <span className="font-medium">DynamoDB</span>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Key Features Section */}
        {!result && !error && (
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Key Features</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Everything you need for accurate infrastructure cost estimation
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-blue-100 text-blue-600 p-2">
                      <Clock className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Real-time Analysis</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get instant cost predictions without waiting for cloud provider pricing APIs
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-green-100 text-green-600 p-2">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">High Accuracy</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    ML-powered predictions with confidence scoring for reliable estimates
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-purple-100 text-purple-600 p-2">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Visual Insights</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Interactive charts and breakdowns for better cost understanding
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-orange-100 text-orange-600 p-2">
                      <Shield className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Secure & Private</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    All analysis happens locally - your infrastructure data never leaves your system
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-cyan-100 text-cyan-600 p-2">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Cost Optimization</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Identify cost drivers and optimize resources before deployment
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-pink-100 text-pink-600 p-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">Team Collaboration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Share cost predictions with your team for better budget planning
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Use Cases Section */}
        {!result && !error && (
          <section className="mt-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Who Uses This</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built for teams that need predictable infrastructure costs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Code className="h-6 w-6 text-blue-500" />
                    <CardTitle className="text-lg">DevOps Engineers</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    Validate infrastructure costs before deployment and avoid budget surprises
                  </CardDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Pre-deployment cost validation</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Resource optimization insights</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-purple-500" />
                    <CardTitle className="text-lg">Platform Teams</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-3">
                    Implement cost controls and provide visibility across the organization
                  </CardDescription>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Budget forecasting and planning</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Cost governance and policies</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {!result && !error && (
          <section className="mt-20">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-0">
              <CardContent className="p-8 md:p-12 text-center">
                <CardTitle className="text-3xl mb-4">Ready to Predict Your Costs?</CardTitle>
                <CardDescription className="text-base max-w-2xl mx-auto mb-8">
                  Upload your Terraform files now and get instant cost predictions with detailed breakdowns
                </CardDescription>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={() => document.getElementById('file-upload')?.scrollIntoView({ behavior: 'smooth' })}
                    size="lg"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Start Analyzing
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                  <Button variant="outline" size="lg">
                    <BookOpen className="h-5 w-5 mr-2" />
                    View Documentation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary p-2">
                  <DollarSign className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold">Terraform Cost Predictor</h3>
                  <p className="text-xs text-muted-foreground">ML-powered cost estimation</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Predict infrastructure costs before deployment with our ML-powered platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Examples</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Tutorials</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub
                  </a>
                </li>
                <li><a href="#" className="hover:text-foreground transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Terraform Cost Predictor. Built with Next.js, FastAPI, and ML.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
