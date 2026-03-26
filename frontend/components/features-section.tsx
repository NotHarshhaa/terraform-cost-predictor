import { Card, CardContent } from "@/components/ui/card";
import { 
  Brain, 
  Zap, 
  Shield, 
  TrendingUp, 
  Clock, 
  DollarSign,
  BarChart3,
  CheckCircle2
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "ML-Powered Predictions",
    description: "Trained Random Forest model with R²: 0.9999 accuracy for near-perfect cost estimates",
    color: "text-purple-500"
  },
  {
    icon: Zap,
    title: "Instant Results",
    description: "Get detailed cost breakdowns in seconds, not hours. No waiting, no hassle",
    color: "text-yellow-500"
  },
  {
    icon: DollarSign,
    title: "Save Money",
    description: "Avoid costly surprises by knowing your infrastructure costs before deployment",
    color: "text-green-500"
  },
  {
    icon: BarChart3,
    title: "Detailed Breakdown",
    description: "See costs by resource, category, and service with interactive visualizations",
    color: "text-blue-500"
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your Terraform files never leave your browser. All processing is client-side",
    color: "text-red-500"
  },
  {
    icon: TrendingUp,
    title: "Confidence Scores",
    description: "Know how reliable each prediction is with intelligent confidence scoring",
    color: "text-indigo-500"
  },
  {
    icon: Clock,
    title: "Real-Time Analysis",
    description: "Parse and analyze complex Terraform configurations in real-time",
    color: "text-orange-500"
  },
  {
    icon: CheckCircle2,
    title: "25+ AWS Resources",
    description: "Support for EC2, RDS, S3, Lambda, EKS, and many more AWS services",
    color: "text-teal-500"
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Built with cutting-edge ML technology to give you the most accurate 
            cost predictions for your Terraform infrastructure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="pt-6">
                  <div className={`rounded-lg bg-muted p-3 w-fit mb-4 ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
