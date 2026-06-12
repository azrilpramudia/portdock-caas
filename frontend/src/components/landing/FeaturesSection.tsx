import { LANDING_FEATURES } from "@/constants/landing";

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6 bg-white" id="features">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-3">
            Features
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-[#0f172a] mb-6 tracking-tight">
            Semua yang Anda Butuhkan untuk Deployment
          </h2>
          <div className="w-12 h-0.5 bg-blue-500/80 rounded-full"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LANDING_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-8 rounded-2xl bg-white border border-slate-100/80 shadow-[0_2px_20px_-8px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.08)] hover:border-slate-200/60 transition-all duration-300 flex items-start gap-5 group"
            >
              <div
                className={`w-[52px] h-[52px] ${feature.bg} rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm`}
              >
                <feature.icon className={`w-6 h-6 ${feature.color}`} strokeWidth={2.5} />
              </div>
              <div className="pt-1">
                <h3 className="text-base font-bold mb-1.5 text-slate-800">{feature.title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
