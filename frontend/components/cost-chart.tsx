"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import type { CategoryBreakdown } from "@/services/api";

ChartJS.register(ArcElement, Tooltip, Legend);

interface CostChartProps {
  data: CategoryBreakdown[];
  totalCost?: number;
}

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#f97316",
];

export default function CostChart({ data, totalCost }: CostChartProps) {
  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        data: data.map((item) => item.total_cost),
        backgroundColor: COLORS.slice(0, data.length),
        borderColor: "transparent",
        borderWidth: 0,
        hoverBorderColor: "hsl(var(--foreground))",
        hoverBorderWidth: 2,
        spacing: 3,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "hsl(var(--card))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--muted-foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed || 0;
            const pct = totalCost ? ((value / totalCost) * 100).toFixed(1) : "0";
            return ` $${value.toFixed(2)}/mo (${pct}%)`;
          },
        },
      },
    },
  };

  const total = totalCost || data.reduce((s, d) => s + d.total_cost, 0);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Chart with center label */}
      <div className="relative h-[260px] w-[260px]">
        <Doughnut data={chartData} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
          <span className="text-2xl font-bold">
            ${total.toFixed(0)}
          </span>
          <span className="text-[10px] text-muted-foreground">/month</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 w-full max-w-sm">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-sm shrink-0"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span className="text-xs text-muted-foreground truncate">{item.category}</span>
            <span className="text-xs font-medium ml-auto">${item.total_cost.toFixed(0)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
