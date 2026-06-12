import Link from "next/link";
import { ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTASection() {
  return (
    <section className="py-12 px-6 bg-[#f8fafc]/50 dark:bg-background pb-24 transition-colors duration-300">
      <div className="max-w-6xl mx-auto relative overflow-hidden bg-gradient-to-r from-blue-50/80 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 rounded-3xl border border-blue-100/50 dark:border-blue-900/50 shadow-sm p-12 md:p-16 flex flex-col md:flex-row items-center justify-center gap-12 transition-colors duration-300">
        {/* Decorative Rocket */}
        <div className="hidden md:flex relative w-48 h-48 items-center justify-center">
          <div className="absolute w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
          <Rocket className="w-32 h-32 text-blue-600 dark:text-blue-500 relative z-10 animate-[float_3s_ease-in-out_infinite]" strokeWidth={1.5} />
          {/* Simple CSS clouds simulation */}
          <div className="absolute bottom-4 left-4 w-16 h-12 bg-background/60 rounded-full blur-md transition-colors"></div>
          <div className="absolute bottom-0 right-0 w-24 h-16 bg-background/80 rounded-full blur-md transition-colors"></div>
        </div>

        {/* Text Content */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start max-w-xl z-10">
          <h2 className="text-3xl md:text-[2rem] font-bold mb-4 text-foreground tracking-tight transition-colors">
            Ready to Deploy Your Application?
          </h2>
          <p className="text-muted-foreground text-[15px] mb-8 leading-relaxed transition-colors">
            Bergabunglah dengan Portdock sekarang dan rasakan kemudahan deployment aplikasi berbasis Docker.
          </p>
          <Link href="/register">
            <Button
              id="btn-get-started-cta"
              size="lg"
              className="h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20 text-[15px] rounded-lg"
            >
              Get Started Now
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
