"use client";

import { LANDING_FAQ } from "@/constants/landing";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 bg-white" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-3">
            FAQ
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-[#0f172a] mb-6 tracking-tight">
            Pertanyaan yang Sering Diajukan
          </h2>
          <div className="w-12 h-0.5 bg-blue-500/80 rounded-full mb-8"></div>
        </div>

        <div className="space-y-4">
          {LANDING_FAQ.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-blue-100 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold text-[15px] text-[#0f172a] pr-8">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-600 text-[15px] leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
