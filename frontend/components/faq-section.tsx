import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How accurate are the cost predictions?",
    answer: "Our ML model achieves 99.99% accuracy (R² score) with an average error of just $9.83 (RMSE). This means predictions are extremely reliable and close to actual AWS costs."
  },
  {
    question: "Which AWS resources are supported?",
    answer: "We support 25+ AWS resources including EC2, RDS, S3, EBS, Lambda, DynamoDB, EKS, ECS, Load Balancers, NAT Gateways, CloudFront, Route53, ElastiCache, and more."
  },
  {
    question: "Is my Terraform configuration secure?",
    answer: "Absolutely! All processing happens in your browser. Your Terraform files never leave your device or get uploaded to any server. We take your privacy and security seriously."
  },
  {
    question: "How does the ML model work?",
    answer: "We use a trained Random Forest model that extracts 20+ features from your Terraform files (like EC2 count, vCPU, memory, storage, etc.) and predicts costs based on real AWS pricing data."
  },
  {
    question: "What's the confidence score?",
    answer: "The confidence score (75-95%) indicates how reliable the prediction is based on the completeness of your Terraform configuration. More detailed configs get higher confidence scores."
  },
  {
    question: "Can I analyze multiple Terraform files?",
    answer: "Yes! You can upload multiple .tf files at once. The platform will parse all of them together and provide a combined cost estimate for your entire infrastructure."
  },
  {
    question: "Is this free to use?",
    answer: "Yes, the platform is completely free and open-source. You can use it unlimited times without any restrictions or hidden costs."
  },
  {
    question: "How often is the pricing data updated?",
    answer: "Our pricing data is based on current AWS pricing for the US East (N. Virginia) region. We regularly update the model with the latest AWS pricing information."
  }
];

export default function FAQSection() {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about our ML-powered cost predictor
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
