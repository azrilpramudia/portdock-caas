import Link from "next/link";
import Image from "next/image";
import portdockLogo from "@/assets/portdock.png";
import { FaGithub, FaDiscord, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#0b1120] dark:bg-background text-slate-300 py-16 px-6 border-t border-slate-800 dark:border-slate-800/80 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2 lg:col-span-4">
            <Link href="/" className="flex items-center gap-2.5 mb-6">
              <Image 
                src={portdockLogo} 
                alt="Portdock icon" 
                height={48}
                width={56}
                quality={100}
                className="h-10 w-auto object-contain -translate-y-1"
              />
              <span className="font-bold text-[1.35rem] leading-none tracking-tight select-none">
                <span className="text-white">Port</span><span className="text-blue-500">Dock</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-[280px]">
              Platform otomatisasi deployment berbasis Docker yang cepat, aman, dan mudah digunakan.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <FaGithub className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <FaDiscord className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors">
                <FaTwitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-xs tracking-wider mb-6">PRODUCT</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/features" className="hover:text-blue-400 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Documentation</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Changelog</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-xs tracking-wider mb-6">RESOURCES</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Guides</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">API Reference</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Support</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-xs tracking-wider mb-6">COMPANY</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><Link href="/about" className="hover:text-blue-400 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-semibold text-xs tracking-wider mb-6">STAY UPDATED</h4>
            <p className="text-slate-400 text-[13px] mb-5 leading-relaxed">
              Dapatkan update terbaru tentang fitur dan release Portdock.
            </p>
            <form className="flex w-full" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full min-w-0 bg-white text-slate-900 text-[13px] rounded-l-md px-3 py-2.5 outline-none"
                required
              />
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-r-md px-4 py-2.5 transition-colors whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-slate-800/80 text-center text-slate-500 text-sm">
          <p>© 2026 Portdock. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
