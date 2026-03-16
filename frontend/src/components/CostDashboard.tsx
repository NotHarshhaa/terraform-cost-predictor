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
import CostChart from "@/components/CostChart";
import type { PredictionResult } from "@/services/api";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  EC2: <Server className="h-4 w-4" />,
  RDS: <Database className="h-4 w-4" />,
  S3: <HardDrive className="h-4 w-4" />,
  EBS: <HardDrive className="h-4 w-4" />,
  LoadBalancer: <Network className="h-4 w-4" />,
  Networking: <Network className="h-4 w-4" />,
  Lambda: <Server className="h-4 w-4" />,
  DynamoDB: <Database className="h-4 w-4" />,
  ECS: <Server className="h-4 w-4" />,
  EKS: <Server className="h-4 w-4" />,
};

const CATEGORY_COLORS: Record<string, string> = {
  EC2: "bg-blue-500",
  RDS: "bg-purple-500",
  S3: "bg-green-500",
  EBS: "bg-orange-500",
  LoadBalancer: "bg-pink-500",
  Networking: "bg-cyan-500",
  Lambda: "bg-yellow-500",
  DynamoDB: "bg-red-500",
  ECS: "bg-indigo-500",
  EKS: "bg-teal-500",
  Other: "bg-gray-500",
};

interface CostDashboardProps {
  result: PredictionResult;
}

export default function CostDashboard({ result }: CostDashboardProps) {
  const {
    estimated_monthly_cost,
    confidence_score,
    breakdown,
    resources,
    total_resources,
    model_type,
    parse_errors,
  } = result;

  const sortedBreakdown = Object.entries(breakdown).sort(([, a], [, b]) => b - a);
  const maxCost = sortedBreakdown.length > 0 ? sortedBreakdown[0][1] : 1;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Estimated Monthly Cost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              ${estimated_monthly_cost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">per month (USD)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Confidence Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{confidence_score}%</div>
            <Progress value={confidence_score} className="mt-2 h-2" />
            <p className="text-xs text-muted-foreground mt-1">{model_type}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Resources Detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{total_resources}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.keys(breakdown).length} resource categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="breakdown" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="breakdown" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Cost Breakdown
          </TabsTrigger>
          <TabsTrigger value="chart" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Visualization
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            Resources
          </TabsTrigger>
        </TabsList>

        {/* Cost Breakdown Tab */}
        <TabsContent value="breakdown">
          <Card>
            <CardHeader>
              <CardTitle>Cost Breakdown by Category</CardTitle>
              <CardDescription>
                Estimated monthly cost per infrastructure category
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedBreakdown.map(([category, cost]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`rounded-md p-1.5 text-white ${
                          CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
                        }`}
                      >
                        {CATEGORY_ICONS[category] || <Server className="h-4 w-4" />}
                      </div>
                      <span className="font-medium">{category}</span>
                    </div>
                    <span className="font-bold text-lg">${cost.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          CATEGORY_COLORS[category] || CATEGORY_COLORS.Other
                        }`}
                        style={{ width: `${(cost / maxCost) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {((cost / estimated_monthly_cost) * 100).toFixed(1)}% of total
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chart Tab */}
        <TabsContent value="chart">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CostChart breakdown={breakdown} type="doughnut" />
            <CostChart breakdown={breakdown} type="bar" />
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle>Detected Resources</CardTitle>
              <CardDescription>
                All infrastructure resources found in your Terraform configuration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {resources.map((resource, idx) => (
                  <div
                    key={`${resource.type}-${resource.name}-${idx}`}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`rounded-md p-1.5 text-white ${
                          CATEGORY_COLORS[resource.category] || CATEGORY_COLORS.Other
                        }`}
                      >
                        {CATEGORY_ICONS[resource.category] || <Server className="h-4 w-4" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{resource.name}</p>
                        <p className="text-xs text-muted-foreground">{resource.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{resource.category}</Badge>
                      {resource.features.instance_type && (
                        <Badge variant="secondary">{resource.features.instance_type}</Badge>
                      )}
                      {resource.features.instance_count && resource.features.instance_count > 1 && (
                        <Badge>x{resource.features.instance_count}</Badge>
                      )}
                      {resource.features.engine && (
                        <Badge variant="secondary">{resource.features.engine}</Badge>
                      )}
                      {resource.features.multi_az && (
                        <Badge className="bg-green-500">Multi-AZ</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Parse Errors */}
      {parse_errors && parse_errors.length > 0 && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Parse Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            {parse_errors.map((err, idx) => (
              <div key={idx} className="text-sm text-muted-foreground">
                <span className="font-medium">{err.file}:</span> {err.error}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
