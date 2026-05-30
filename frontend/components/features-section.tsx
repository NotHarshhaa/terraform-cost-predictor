"use client";

import {
  Brain,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "ML-Powered Predictions",
    description: "Trained Random Forest model with R²: 0.9999 accuracy for near-perfect cost estimates",
    gradient: "from-purple-500 to-violet-600",
    bg: "bg-purple-500/10",
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get detailed cost breakdowns in seconds, not hours. No waiting, no hassle",
    gradient: "from-amber-500 to-orange-600",
    bg: "bg-amber-500/10",
  },
  {
    icon: DollarSign,
    title: "Save Money",
    description: "Avoid costly surprises by knowing your infrastructure costs before deployment",
    gradient: "from-emerald-500 to-green-600",
    bg: "bg-emerald-500/10",
  },
  {
    icon: BarChart3,
    title: "Detailed Breakdown",
    description: "See costs by resource, category, and service with interactive visualizations",
    gradient: "from-blue-500 to-indigo-600",
    bg: "bg-blue-500/10",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "All processing happens on your own server. No data is sent to third parties",
    gradient: "from-red-500 to-rose-600",
    bg: "bg-red-500/10",
  },
  {
    icon: TrendingUp,
    title: "Confidence Scores",
    description: "Know how reliable each prediction is with intelligent confidence scoring",
    gradient: "from-indigo-500 to-blue-600",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Clock,
    title: "Real-Time Analysis",
    description: "Parse and analyze complex Terraform configurations in real-time",
    gradient: "from-orange-500 to-red-600",
    bg: "bg-orange-500/10",
  },
  {
    icon: CheckCircle2,
    title: "25+ AWS Resources",
    description: "Support for EC2, RDS, S3, Lambda, EKS, and many more AWS services",
    gradient: "from-teal-500 to-cyan-600",
    bg: "bg-teal-500/10",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-muted/30 -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Why Choose Our Platform?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Built with cutting-edge ML technology for the most accurate cost predictions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl border bg-card p-6 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative">
                  {/* Icon */}
                  <div className={`rounded-xl ${feature.bg} p-3 w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 bg-gradient-to-br ${feature.gradient} bg-clip-text`} style={{ color: `var(--tw-gradient-from)` }} />
                  </div>

                  <h3 className="font-semibold mb-2 text-base">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
