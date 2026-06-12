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
    <section className="py-24 px-6 bg-white dark:bg-[#020617] transition-colors duration-300" id="faq">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-blue-600 font-bold text-xs tracking-wider uppercase mb-3">
            FAQ
          </span>
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-[#0f172a] dark:text-white mb-6 tracking-tight transition-colors">
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
                  isOpen ? 'border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a] hover:border-slate-200 dark:hover:border-slate-700'
                }`}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => toggleFAQ(index)}
                >
                  <span className="font-semibold text-[15px] text-[#0f172a] dark:text-white pr-8 transition-colors">
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    isOpen ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rotate-180' : 'bg-slate-50 dark:bg-[#1e293b] text-slate-400 dark:text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>
                
                <div 
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'
                  }`}
                >
                  <p className="text-slate-600 dark:text-slate-300 text-[15px] leading-relaxed transition-colors">
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
