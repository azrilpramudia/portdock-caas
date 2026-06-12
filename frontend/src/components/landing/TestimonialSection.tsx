import { LANDING_TESTIMONIALS } from "@/constants/landing";
import { Star } from "lucide-react";

export default function TestimonialSection() {
  return (
    <section className="py-24 px-6 bg-white" id="testimonials">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-3">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-[#0f172a] mb-6 tracking-tight">
            Dipercaya oleh Developer Hebat
          </h2>
          <div className="w-12 h-0.5 bg-blue-500/80 rounded-full mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LANDING_TESTIMONIALS.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex gap-1 mb-6 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-slate-600 text-[15px] leading-relaxed mb-8 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-[#0f172a] text-sm">{testimonial.name}</h4>
                  <p className="text-slate-500 text-xs">{testimonial.role} at {testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
