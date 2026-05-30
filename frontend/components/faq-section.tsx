"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How accurate are the cost predictions?",
    answer: "Our ML model achieves 99.99% accuracy (R² score) with an average error of just $9.83 (RMSE). Predictions are extremely reliable and close to actual AWS costs.",
  },
  {
    question: "Which AWS resources are supported?",
    answer: "We support 25+ AWS resources including EC2, RDS, S3, EBS, Lambda, DynamoDB, EKS, ECS, Load Balancers, NAT Gateways, CloudFront, Route53, ElastiCache, and more.",
  },
  {
    question: "Is my Terraform configuration secure?",
    answer: "Absolutely! All processing happens within your own deployment. Your Terraform files are only sent to your own Next.js API routes — no data is shared with third parties.",
  },
  {
    question: "How does the ML model work?",
    answer: "We use a trained Random Forest model that extracts 20+ features from your Terraform files (like EC2 count, vCPU, memory, storage, etc.) and predicts costs based on real AWS pricing data.",
  },
  {
    question: "What's the confidence score?",
    answer: "The confidence score (75-95%) indicates how reliable the prediction is based on the completeness of your Terraform configuration. More detailed configs get higher confidence scores.",
  },
  {
    question: "Can I analyze multiple Terraform files?",
    answer: "Yes! You can upload multiple .tf files at once. The platform will parse all of them together and provide a combined cost estimate for your entire infrastructure.",
  },
  {
    question: "Is this free to use?",
    answer: "Yes, the platform is completely free and open-source. You can use it unlimited times without any restrictions or hidden costs.",
  },
  {
    question: "How often is the pricing data updated?",
    answer: "Our pricing data is based on current AWS pricing for the US East (N. Virginia) region. We regularly update the model with the latest AWS pricing information.",
  },
];

export default function FAQSection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-muted/30 -z-10" />

      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm mb-6">
            <HelpCircle className="h-3.5 w-3.5 text-primary" />
            <span className="text-muted-foreground">Got questions?</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about our ML-powered cost predictor
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
