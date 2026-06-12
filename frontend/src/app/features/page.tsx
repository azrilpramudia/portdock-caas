"use client";

import Navbar from "@/components/shared/Navbar";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/shared/Footer";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-hidden">
      <Navbar />

      {/* Features Header / Hero */}
      <section className="relative pt-32 pb-10 overflow-hidden bg-gradient-to-b from-white via-blue-50/40 to-white dark:from-background dark:via-blue-950/20 dark:to-background transition-colors duration-300">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: "radial-gradient(circle, #2563eb 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-blue-100/60 dark:bg-blue-900/20 rounded-full blur-3xl transition-colors duration-300" />
          <div className="absolute bottom-0 -left-24 w-[400px] h-[400px] bg-blue-50/80 dark:bg-blue-900/10 rounded-full blur-3xl transition-colors duration-300" />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight transition-colors duration-300">
            Semua yang Anda Butuhkan <br className="hidden md:block" />
            <span className="text-blue-600">untuk Deployment</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto transition-colors duration-300">
            Platform komprehensif dengan alat mutakhir yang dirancang khusus untuk mempermudah alur kerja pengembangan Anda.
          </p>
        </div>
      </section>

      {/* Features Content */}
      <div className="relative z-10">
        <FeaturesSection hideHeader={true} className="px-6 pb-24 bg-transparent" />
      </div>

      <CTASection />
      <Footer />
    </div>
  );
}
