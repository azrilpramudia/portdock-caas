import { LANDING_TESTIMONIALS } from "@/constants/landing";
import { Star } from "lucide-react";

export default function TestimonialSection() {
  return (
    <section className="py-24 px-6 bg-white dark:bg-background transition-colors duration-300" id="testimonials">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-foreground mb-6 tracking-tight transition-colors">
            Dipercaya oleh Developer Hebat
          </h2>
          <div className="w-12 h-0.5 bg-blue-500/80 rounded-full mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LANDING_TESTIMONIALS.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-card rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex gap-1 mb-6 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed mb-8 italic transition-colors">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-lg transition-colors">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm transition-colors">{testimonial.name}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-xs transition-colors">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
