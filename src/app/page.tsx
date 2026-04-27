import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Features } from "@/components/landing/Features";
import { UseCases } from "@/components/landing/UseCases";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="landing-root min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <UseCases />
      </main>
      <Footer />
    </div>
  );
}
