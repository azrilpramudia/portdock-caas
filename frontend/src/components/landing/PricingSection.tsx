import { LANDING_PRICING } from "@/constants/landing";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PricingSection() {
  return (
    <section className="py-24 px-6 bg-slate-50/50 dark:bg-[#020617] transition-colors duration-300" id="pricing">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-3">
            Pricing
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-[#0f172a] dark:text-white mb-6 tracking-tight transition-colors">
            Paket Harga yang Transparan
          </h2>
          <div className="w-12 h-0.5 bg-blue-500/80 rounded-full mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {LANDING_PRICING.map((plan, index) => (
            <div 
              key={plan.name} 
              className={`relative bg-white dark:bg-[#0f172a] rounded-3xl p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none transition-transform duration-300 hover:-translate-y-1 flex flex-col ${
                plan.highlight ? 'border-2 border-blue-500' : 'border border-slate-100 dark:border-slate-800'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-sm">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white mb-2 transition-colors">{plan.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 h-10 transition-colors">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight transition-colors">{plan.price}</span>
                  {plan.period && <span className="text-slate-500 dark:text-slate-400 font-medium transition-colors">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
                      <Check className="w-3 h-3 text-blue-600 dark:text-blue-400 stroke-[3]" />
                    </div>
                    <span className="text-slate-600 dark:text-slate-300 text-[15px] transition-colors">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full h-12 mt-auto rounded-xl text-[15px] font-semibold transition-all ${
                  plan.highlight 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20' 
                    : 'bg-white dark:bg-transparent text-blue-600 border-2 border-blue-100 dark:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                {plan.ctaText}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
