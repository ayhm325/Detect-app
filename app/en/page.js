import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import FeaturesSection from "../components/FeaturesSection";
import WorkflowSection from "../components/WorkflowSection";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans relative">
      <img src="/bg-hero.svg" alt="bg" className="fixed inset-0 w-full h-full object-cover -z-20 select-none pointer-events-none" aria-hidden="true" />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <Footer />
    </div>
  );
}
