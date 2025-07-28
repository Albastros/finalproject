import CTASection from "@/components/landing/CTASection";
import FeatureGrid from "@/components/landing/FeatureGrid";
import HeroSection from "@/components/landing/HeroSection";
import Testimonials from "@/components/landing/Testimonials";
import CourseCategoriesSection from "@/components/landing/CourseCategoriesSection";
import InstructorsSection from "@/components/landing/InstructorsSection";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background w-full mx-auto">
      <main className="">
        <HeroSection />
        <FeatureGrid />
        <CourseCategoriesSection />
        <InstructorsSection />
        <Testimonials />
        <CTASection />
      </main>
    </div>
  );
}
