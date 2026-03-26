import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 -z-10" />
      
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Powered by ML Model with 99.99% Accuracy
          </Badge>

          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Predict AWS Costs Before You Deploy
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upload your Terraform files and get instant, ML-powered cost predictions with{" "}
            <span className="text-primary font-semibold">near-perfect accuracy</span>. 
            Save time, money, and avoid billing surprises.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button 
              size="lg" 
              className="group"
              onClick={() => {
                const uploadSection = document.getElementById('file-upload-section');
                uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => {
                const uploadSection = document.getElementById('file-upload-section');
                uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
            >
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">99.99%</div>
              <div className="text-sm text-muted-foreground">Model Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">$9.83</div>
              <div className="text-sm text-muted-foreground">Avg Error (RMSE)</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">25+</div>
              <div className="text-sm text-muted-foreground">AWS Resources</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">Instant</div>
              <div className="text-sm text-muted-foreground">Predictions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
