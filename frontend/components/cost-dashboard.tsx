"use client";

import React from "react";
import {
  DollarSign,
  Server,
  Database,
  HardDrive,
  Network,
  Shield,
  TrendingUp,
  BarChart3,
  Zap,
  Clock,
  Layers,
  ArrowUpRight,
  Globe,
  Radio,
  Cpu,
  Activity,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CostChart from "@/components/cost-chart";
import type { PredictionResult } from "@/services/api";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ec2: <Server className="h-5 w-5" />,
  compute: <Server className="h-5 w-5" />,
  storage: <HardDrive className="h-5 w-5" />,
  ebs: <HardDrive className="h-5 w-5" />,
  s3: <HardDrive className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  rds: <Database className="h-5 w-5" />,
  dynamodb: <Database className="h-5 w-5" />,
  networking: <Network className="h-5 w-5" />,
  loadbalancer: <Network className="h-5 w-5" />,
  security: <Shield className="h-5 w-5" />,
  lambda: <Zap className="h-5 w-5" />,
  container: <Layers className="h-5 w-5" />,
  cdn: <Globe className="h-5 w-5" />,
  dns: <Globe className="h-5 w-5" />,
  cache: <Cpu className="h-5 w-5" />,
  messaging: <Radio className="h-5 w-5" />,
  monitoring: <Activity className="h-5 w-5" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  ec2: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  compute: "from-blue-500/20 to-blue-600/5 border-blue-500/30",
  rds: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
  database: "from-purple-500/20 to-purple-600/5 border-purple-500/30",
  dynamodb: "from-indigo-500/20 to-indigo-600/5 border-indigo-500/30",
  s3: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  storage: "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30",
  ebs: "from-teal-500/20 to-teal-600/5 border-teal-500/30",
  networking: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  loadbalancer: "from-amber-500/20 to-amber-600/5 border-amber-500/30",
  lambda: "from-orange-500/20 to-orange-600/5 border-orange-500/30",
  container: "from-pink-500/20 to-pink-600/5 border-pink-500/30",
  cdn: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/30",
  dns: "from-sky-500/20 to-sky-600/5 border-sky-500/30",
  cache: "from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/30",
  messaging: "from-rose-500/20 to-rose-600/5 border-rose-500/30",
  monitoring: "from-violet-500/20 to-violet-600/5 border-violet-500/30",
};

interface CostDashboardProps {
  result: PredictionResult;
}

export default function CostDashboard({ result }: CostDashboardProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  // Normalize confidence score to 0.0 - 1.0 safely
  const confidenceDecimal = result.confidence_score > 1 ? result.confidence_score / 100 : result.confidence_score;
  const confidencePercent = (confidenceDecimal * 100).toFixed(1);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-emerald-500";
    if (score >= 0.6) return "text-amber-500";
    return "text-red-500";
  };

  const getConfidenceBg = (score: number) => {
    if (score >= 0.8) return "from-emerald-500/20 to-emerald-600/5 border-emerald-500/30";
    if (score >= 0.6) return "from-amber-500/20 to-amber-600/5 border-amber-500/30";
    return "from-red-500/20 to-red-600/5 border-red-500/30";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Model & Parse Warnings Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3">
            <Zap className="h-3 w-3 text-primary" />
            {result.model_type || "ML-Powered Predictor"}
          </Badge>
          {result.prediction_method && (
            <Badge variant="outline" className="text-xs uppercase tracking-wider">
              {result.prediction_method}
            </Badge>
          )}
        </div>
      </div>

      {result.parse_errors && result.parse_errors.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Parse Notices</p>
              <ul className="list-disc list-inside mt-1 text-xs space-y-0.5 opacity-90">
                {result.parse_errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {result.message && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2.5">
          <Info className="h-4 w-4 text-blue-500 shrink-0" />
          <span>{result.message}</span>
        </div>
      )}

      {/* Hero Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Cost Card */}
        <Card className="relative overflow-hidden border bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border-blue-500/20 shadow-lg shadow-blue-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Monthly Cost</CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {formatCurrency(result.total_estimated_cost)}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">Estimated monthly infrastructure cost</p>
            </div>
          </CardContent>
        </Card>

        {/* Confidence Card */}
        <Card className={`relative overflow-hidden border bg-gradient-to-br ${getConfidenceBg(confidenceDecimal)} shadow-lg`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Confidence Score</CardTitle>
            <div className="rounded-lg bg-emerald-500/10 p-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold tracking-tight ${getConfidenceColor(confidenceDecimal)}`}>
                {confidencePercent}%
              </span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {getConfidenceLabel(confidenceDecimal)}
              </Badge>
            </div>
            <div className="mt-3">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(100, confidenceDecimal * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resources Card */}
        <Card className="relative overflow-hidden border bg-gradient-to-br from-violet-500/10 to-purple-600/5 border-violet-500/20 shadow-lg shadow-violet-500/5">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resources Analyzed</CardTitle>
            <div className="rounded-lg bg-violet-500/10 p-2">
              <BarChart3 className="h-4 w-4 text-violet-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-violet-600 dark:text-violet-400">
              {result.resources.length}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Processed in {result.processing_time.toFixed(2)}s
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="chart">Visualization</TabsTrigger>
          <TabsTrigger value="resources">Resources ({result.resources.length})</TabsTrigger>
        </TabsList>

        {/* Cost Breakdown Tab */}
        <TabsContent value="breakdown" className="space-y-4 animate-in fade-in duration-300">
          <div className="grid gap-3">
            {result.category_breakdown.map((category, index) => {
              const key = category.category.toLowerCase();
              const gradient = CATEGORY_COLORS[key] || "from-gray-500/20 to-gray-600/5 border-gray-500/30";
              const icon = CATEGORY_ICONS[key] || <Server className="h-5 w-5" />;
              const percentage = result.total_estimated_cost > 0
                ? ((category.total_cost / result.total_estimated_cost) * 100).toFixed(1)
                : "0";

              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-xl border bg-gradient-to-r ${gradient} p-4 transition-all hover:scale-[1.005] hover:shadow-md`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-background/80 p-2.5 shadow-sm">
                        {icon}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{category.category}</p>
                        <p className="text-xs text-muted-foreground">
                          {category.resource_count} resource{category.resource_count !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(category.total_cost)}</p>
                      <p className="text-xs text-muted-foreground">{percentage}% of total</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 w-full rounded-full bg-background/50 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground/20 transition-all duration-700 ease-out"
                        style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* Chart Tab */}
        <TabsContent value="chart" className="animate-in fade-in duration-300">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Cost Distribution
              </CardTitle>
              <CardDescription>Monthly cost breakdown by infrastructure category</CardDescription>
            </CardHeader>
            <CardContent>
              <CostChart data={result.category_breakdown} totalCost={result.total_estimated_cost} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="animate-in fade-in duration-300">
          <div className="space-y-3">
            {result.resources.map((resource, index) => {
              const resConf = resource.confidence_score > 1 ? resource.confidence_score / 100 : resource.confidence_score;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                          {resource.resource_type}
                        </Badge>
                        <span className="font-medium truncate">{resource.resource_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                              style={{ width: `${resConf * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {(resConf * 100).toFixed(0)}% confidence
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right pl-4">
                      <div className="text-lg font-bold">{formatCurrency(resource.estimated_cost)}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider">per month</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
