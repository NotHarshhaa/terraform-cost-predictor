import HeroSection from "./hero-section";
import FeaturesSection from "./features-section";
import HowItWorks from "./how-it-works";
import FAQSection from "./faq-section";
import CreatorSection from "./creator-section";
import CTASection from "./cta-section";

interface LandingPageProps {
  fileUploadSection?: React.ReactNode;
}

export default function LandingPage({ fileUploadSection }: LandingPageProps) {
  return (
    <div className="space-y-0">
      <HeroSection />
      <FeaturesSection />
      <HowItWorks />
      
      {/* File Upload Section - Positioned in the middle */}
      {fileUploadSection}
      
      <FAQSection />
      <CreatorSection />
      <CTASection />
    </div>
  );
}
