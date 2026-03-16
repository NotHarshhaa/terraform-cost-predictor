"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CHART_COLORS = [
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#22c55e", // green
  "#f97316", // orange
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#eab308", // yellow
  "#ef4444", // red
  "#6366f1", // indigo
  "#14b8a6", // teal
];

interface CostChartProps {
  breakdown: Record<string, number>;
  type: "doughnut" | "bar";
}

export default function CostChart({ breakdown, type }: CostChartProps) {
  const labels = Object.keys(breakdown);
  const values = Object.values(breakdown);
  const colors = labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  if (type === "doughnut") {
    const data = {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderColor: colors.map((c) => c + "cc"),
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom" as const,
          labels: {
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => ` ${ctx.label}: $${ctx.raw.toLocaleString()}`,
          },
        },
      },
    };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cost Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <Doughnut data={data} options={options} />
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = {
    labels,
    datasets: [
      {
        label: "Monthly Cost ($)",
        data: values,
        backgroundColor: colors.map((c) => c + "99"),
        borderColor: colors,
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `$${ctx.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `$${value}`,
        },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Cost by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <Bar data={data} options={options} />
        </div>
      </CardContent>
    </Card>
  );
}
