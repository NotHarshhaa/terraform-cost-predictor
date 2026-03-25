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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CostChart from "@/components/cost-chart";
import type { PredictionResult } from "@/services/api";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  compute: <Server className="h-5 w-5" />,
  storage: <HardDrive className="h-5 w-5" />,
  database: <Database className="h-5 w-5" />,
  networking: <Network className="h-5 w-5" />,
  security: <Shield className="h-5 w-5" />,
};

interface CostDashboardProps {
  result: PredictionResult;
}

export default function CostDashboard({ result }: CostDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600";
    if (score >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const getConfidenceLabel = (score: number) => {
    if (score >= 0.8) return "High";
    if (score >= 0.6) return "Medium";
    return "Low";
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(result.total_estimated_cost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Estimated infrastructure cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(result.confidence_score * 100).toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Progress value={result.confidence_score * 100} className="flex-1" />
              <Badge
                variant={result.confidence_score >= 0.8 ? "default" : "secondary"}
                className={getConfidenceColor(result.confidence_score)}
              >
                {getConfidenceLabel(result.confidence_score)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resources Analyzed</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{result.resources.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Processed in {result.processing_time.toFixed(2)}s
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <Tabs defaultValue="breakdown" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="breakdown">Cost Breakdown</TabsTrigger>
          <TabsTrigger value="resources">Resource Details</TabsTrigger>
        </TabsList>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Cost Distribution</CardTitle>
                <CardDescription>
                  Monthly cost breakdown by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CostChart data={result.category_breakdown} />
              </CardContent>
            </Card>

            {/* Category List */}
            <Card>
              <CardHeader>
                <CardTitle>Category Summary</CardTitle>
                <CardDescription>
                  Detailed breakdown by resource category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.category_breakdown.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {CATEGORY_ICONS[category.category.toLowerCase()] || (
                            <Server className="h-5 w-5" />
                          )}
                          <span className="font-medium capitalize">
                            {category.category}
                          </span>
                          <Badge variant="outline">{category.resource_count}</Badge>
                        </div>
                        <span className="font-bold">
                          {formatCurrency(category.total_cost)}
                        </span>
                      </div>
                      <Progress
                        value={
                          (category.total_cost / result.total_estimated_cost) * 100
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Resource-Level Costs</CardTitle>
              <CardDescription>
                Individual cost estimates for each resource
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {result.resources.map((resource, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {resource.resource_type}
                        </Badge>
                        <span className="font-medium">{resource.resource_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Confidence:
                        </span>
                        <Progress
                          value={resource.confidence_score * 100}
                          className="w-24 h-2"
                        />
                        <span className="text-xs font-medium">
                          {(resource.confidence_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {formatCurrency(resource.estimated_cost)}
                      </div>
                      <div className="text-xs text-muted-foreground">/month</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
