import { Card, CardContent } from "@/components/ui/card";
import { Upload, Cpu, BarChart3, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Terraform Files",
    description: "Drag & drop your .tf files or browse to select them. Supports multiple files and complex configurations.",
    step: "01"
  },
  {
    icon: Cpu,
    title: "ML Analysis",
    description: "Our trained Random Forest model extracts 20+ features and predicts costs with 99.99% accuracy.",
    step: "02"
  },
  {
    icon: BarChart3,
    title: "View Results",
    description: "Get detailed cost breakdowns, visualizations, and confidence scores for each resource.",
    step: "03"
  },
  {
    icon: CheckCircle,
    title: "Make Decisions",
    description: "Use insights to optimize your infrastructure and avoid costly surprises before deployment.",
    step: "04"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get accurate cost predictions in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative pt-8">
          {/* Connection lines for desktop */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -z-10" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Step number - positioned above card */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center font-bold text-base shadow-lg z-10">
                  {step.step}
                </div>
                
                <Card className="border-2 hover:border-primary transition-all hover:shadow-lg h-full">
                  <CardContent className="pt-10 pb-6 text-center">
                  
                  {/* Icon */}
                  <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-semibold mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
