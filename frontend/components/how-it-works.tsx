"use client";

import { Upload, Cpu, BarChart3, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Terraform Files",
    description: "Drag & drop your .tf files or browse to select them. Supports multiple files and complex configurations.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
  },
  {
    icon: Cpu,
    title: "ML Analysis",
    description: "Our trained Random Forest model extracts 20+ features and predicts costs with near-perfect accuracy.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
  },
  {
    icon: BarChart3,
    title: "View Results",
    description: "Get detailed cost breakdowns, visualizations, and confidence scores for each resource.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
  },
  {
    icon: CheckCircle,
    title: "Make Decisions",
    description: "Use insights to optimize your infrastructure and avoid costly surprises before deployment.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Get accurate cost predictions in 4 simple steps
          </p>
        </div>

        {/* Timeline layout */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 md:left-10 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="relative flex gap-6 md:gap-8 group">
                    {/* Step indicator */}
                    <div className="relative shrink-0">
                      <div className={`relative z-10 flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-2xl ${step.bg} ring-4 ${step.ring} transition-all group-hover:scale-105 group-hover:shadow-lg`}>
                        <Icon className={`h-7 w-7 md:h-8 md:w-8 ${step.color}`} />
                      </div>
                      {/* Step number */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                        {index + 1}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2 md:pt-4 pb-4">
                      <h3 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
