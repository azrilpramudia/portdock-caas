"use client";

import Navbar from "@/components/shared/Navbar";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/shared/Footer";
import { Container, Heart, Lightbulb, Users, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-gray-900 dark:text-slate-200 transition-colors duration-300 overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-[100dvh] flex items-center pt-32 pb-20 overflow-hidden bg-linear-to-br from-white via-blue-50/40 to-white dark:from-[#020617] dark:via-blue-950/20 dark:to-[#020617] transition-colors duration-300">
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

        <div className="relative max-w-4xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full px-4 py-1.5 mx-auto transition-colors duration-300">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider transition-colors duration-300">Misi Kami</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight text-[#0f172a] dark:text-white tracking-tight transition-colors duration-300">
            Menyederhanakan Infrastruktur <br className="hidden md:block" />
            untuk Semua Developer
          </h1>
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto transition-colors duration-300">
            Kami percaya bahwa setiap developer harus fokus pada menulis kode yang hebat, bukan membuang waktu berjam-jam untuk mengkonfigurasi server dan deployment.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-24 px-6 bg-white dark:bg-[#020617] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#0f172a] dark:text-white mb-6 transition-colors duration-300">Cerita Kami</h2>
              <div className="w-12 h-0.5 bg-blue-500/80 rounded-full mb-8"></div>
              <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed transition-colors duration-300">
                <p>
                  Berawal dari rasa frustrasi menghadapi proses deployment aplikasi yang rumit dan memakan waktu, Portdock lahir dari sebuah ide sederhana: <strong>"Bagaimana jika deployment bisa semudah drag and drop?"</strong>
                </p>
                <p>
                  Sebagai tim developer, kami sering mengalami bottleneck saat harus mendeploy aplikasi baru. Mengonfigurasi VPS, setup Nginx, mengatur SSL Let's Encrypt, hingga mengelola Docker container secara manual sangatlah melelahkan dan rentan terhadap kesalahan manusia.
                </p>
                <p>
                  Oleh karena itu, kami membangun Portdock. Sebuah Platform as a Service (PaaS) berbasis Container as a Service (CaaS) yang otomatis, terjangkau, dan sangat mudah digunakan, bahkan untuk developer pemula sekalipun.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 rounded-[2rem] transform rotate-3 transition-colors duration-300"></div>
              <div className="relative bg-white dark:bg-[#0f172a] border border-slate-100 dark:border-slate-800 rounded-3xl p-10 shadow-xl shadow-blue-900/5 dark:shadow-none transition-colors duration-300">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div className="p-4">
                    <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">10k+</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">Aplikasi Terdeploy</div>
                  </div>
                  <div className="p-4">
                    <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">99.9%</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">Uptime Server</div>
                  </div>
                  <div className="p-4">
                    <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">5k+</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">Developer Aktif</div>
                  </div>
                  <div className="p-4">
                    <div className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mb-2 transition-colors duration-300">24/7</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors duration-300">Support Teknis</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 px-6 bg-slate-50/50 dark:bg-[#020617] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0f172a] dark:text-white mb-6 transition-colors duration-300">Nilai-Nilai Utama</h2>
            <div className="w-12 h-0.5 bg-blue-500/80 rounded-full mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#0f172a] p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 transition-colors duration-300">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-3 transition-colors duration-300">Kesederhanaan</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                Kami mengubah hal-hal yang rumit menjadi satu klik. Infrastruktur harus tidak terlihat dan tidak menyusahkan developer.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 transition-colors duration-300">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-3 transition-colors duration-300">Reliabilitas</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                Kepercayaan Anda adalah aset terbesar kami. Kami membangun arsitektur yang kuat agar aplikasi Anda selalu online 24/7.
              </p>
            </div>

            <div className="bg-white dark:bg-[#0f172a] p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none hover:shadow-md transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 transition-colors duration-300">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#0f172a] dark:text-white mb-3 transition-colors duration-300">Fokus pada Developer</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed transition-colors duration-300">
                Kami membangun alat yang kami sendiri ingin gunakan. Setiap fitur dirancang untuk mempercepat produktivitas tim teknis.
              </p>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </div>
  );
}
