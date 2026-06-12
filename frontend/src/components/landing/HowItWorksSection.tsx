import { LANDING_STEPS } from "@/constants/landing";
import { MoveRight } from "lucide-react";

export default function HowItWorksSection() {
  return (
    <section className="py-24 px-6 bg-[#f8fafc]/50 dark:bg-slate-900/30 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-3">
            Workflow
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-[#0f172a] dark:text-white mb-6 tracking-tight transition-colors">
            Alur Deployment yang Mudah dan Otomatis
          </h2>
          <div className="w-12 h-0.5 bg-blue-500/80 rounded-full mb-8"></div>
        </div>

        {/* Workflow Steps Container */}
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 md:gap-2 lg:gap-4 relative w-full mb-16">
          {LANDING_STEPS.map((step, index) => (
            <div key={step.step} className="flex flex-col items-center text-center relative w-full md:w-[15%] group z-10">
              {/* Circular Icon Container */}
              <div className="w-20 h-20 rounded-full bg-white dark:bg-[#0f172a] border border-blue-50 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none flex items-center justify-center mb-5 group-hover:-translate-y-2 transition-all duration-300 relative z-20">
                <step.icon className={`w-8 h-8 ${step.color}`} strokeWidth={2} />
              </div>
              
              {/* Text */}
              <h3 className="font-bold text-[#0f172a] dark:text-white text-[15px] mb-2 leading-tight transition-colors">
                {step.step}. {step.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[12px] leading-relaxed max-w-[150px] transition-colors">
                {step.description}
              </p>

              {/* Connecting Arrow (hidden on mobile, visible on desktop) */}
              {index < LANDING_STEPS.length - 1 && (
                <div className="hidden md:flex absolute top-10 left-[75%] w-[50%] lg:w-[60%] -translate-y-1/2 items-center justify-center z-0 text-blue-200/60 dark:text-slate-700 transition-colors">
                  <div className="h-[2px] w-full border-t-[2px] border-dashed border-blue-200/60 dark:border-slate-700 absolute transition-colors"></div>
                  <MoveRight className="w-4 h-4 absolute right-0 translate-x-1/2 text-blue-200/60 dark:text-slate-700 transition-colors" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
