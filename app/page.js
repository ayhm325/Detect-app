import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
import WorkflowSection from "./components/WorkflowSection";
import Footer from "./components/Footer";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans relative" dir="rtl" lang="ar">
      <div className="fixed inset-0 -z-20 select-none pointer-events-none" aria-hidden="true">
        <Image src="/bg-hero.svg" alt="bg" fill priority sizes="100vw" className="w-full h-full object-cover" />
      </div>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <WorkflowSection />
      <Footer />
    </div>
  );
}
