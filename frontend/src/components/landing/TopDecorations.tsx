import Image from "next/image";
import portdockWhale from "@/assets/portdock.png";

export default function TopDecorations() {
  return (
    <div className="absolute -top-24 left-0 w-full h-24 z-0 pointer-events-none hidden md:block">
      {/* Dashed connector lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {/* Line from Outline Cloud down to Dashboard */}
        <path d="M 120,60 L 120,100" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="6 6" fill="none" />
        {/* Line under Docker Whale */}
        <path d="M 220,85 L 230,70 L 350,70 L 360,85 L 360,100" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="6 6" fill="none" strokeLinejoin="round" />
        {/* Line from Solid Cloud down */}
        <path d="M 480,75 L 480,100" stroke="#bfdbfe" strokeWidth="2" strokeDasharray="6 6" fill="none" />
      </svg>

      {/* 1. Outline Cloud (Left) */}
      <div className="absolute top-4 left-[80px]">
        <svg width="80" height="50" viewBox="0 0 80 50" fill="none">
          <path d="M 25 45 A 12 12 0 0 1 25 21 A 18 18 0 0 1 55 21 A 12 12 0 0 1 55 45 Z" stroke="#bfdbfe" strokeWidth="3" fill="#ffffff" strokeLinejoin="round" strokeLinecap="round"/>
          <line x1="25" y1="45" x2="55" y2="45" stroke="#bfdbfe" strokeWidth="3" strokeLinecap="round"/>
        </svg>
      </div>

      {/* 2. Docker Whale (Center-Left) */}
      <div className="absolute top-0 left-[240px] animate-[float_6s_ease-in-out_infinite]">
        <Image
          src={portdockWhale}
          alt="Docker whale"
          width={96}
          height={80}
          quality={100}
          className="h-20 w-auto object-contain drop-shadow-xl"
        />
      </div>

      {/* 3. Solid Cloud (Center-Right) */}
      <div className="absolute top-2 left-[420px]">
        <svg width="120" height="70" viewBox="0 0 120 70" fill="none">
          <circle cx="35" cy="45" r="20" fill="#eff6ff"/>
          <circle cx="60" cy="30" r="25" fill="#eff6ff"/>
          <circle cx="85" cy="45" r="15" fill="#eff6ff"/>
          <rect x="35" y="25" width="50" height="40" fill="#eff6ff"/>
        </svg>
      </div>

      {/* 4. Server Rack (Right) */}
      <div className="absolute top-2 right-[20px]">
        <svg width="60" height="80" viewBox="0 0 60 80" fill="none">
          {/* Top Server */}
          <rect x="0" y="0" width="60" height="20" rx="4" fill="#ffffff" stroke="#93c5fd" strokeWidth="2"/>
          <circle cx="10" cy="10" r="2" fill="#3b82f6"/>
          <circle cx="16" cy="10" r="2" fill="#3b82f6"/>
          <circle cx="22" cy="10" r="2" fill="#3b82f6"/>
          <line x1="35" y1="10" x2="50" y2="10" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round"/>
          
          {/* Middle Server */}
          <rect x="0" y="25" width="60" height="20" rx="4" fill="#ffffff" stroke="#93c5fd" strokeWidth="2"/>
          <circle cx="10" cy="35" r="2" fill="#3b82f6"/>
          <circle cx="16" cy="35" r="2" fill="#3b82f6"/>
          <circle cx="22" cy="35" r="2" fill="#3b82f6"/>
          <line x1="35" y1="35" x2="50" y2="35" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round"/>

          {/* Bottom Server */}
          <rect x="0" y="50" width="60" height="20" rx="4" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="2"/>
          <circle cx="10" cy="60" r="2" fill="#94a3b8"/>
          <circle cx="16" cy="60" r="2" fill="#94a3b8"/>
          <circle cx="22" cy="60" r="2" fill="#94a3b8"/>
          <line x1="35" y1="60" x2="50" y2="60" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      
      {/* Floating Sparkles / Dots */}
      <div className="absolute w-1 h-1 bg-blue-200 rounded-full" style={{ left: 200, top: 20 }} />
      <div className="absolute w-1.5 h-1.5 bg-blue-200 rounded-full" style={{ left: 400, top: 10 }} />
      <div className="absolute w-1 h-1 bg-blue-200 rounded-full" style={{ left: 600, top: 40 }} />
    </div>
  );
}
