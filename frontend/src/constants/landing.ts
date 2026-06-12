import {
  CloudUpload,
  Monitor,
  Terminal,
  ShieldCheck,
  Box,
  Server,
  Globe,
  Rocket,
} from "lucide-react";
import { FaGithub, FaDocker } from "react-icons/fa";

export const LANDING_FEATURES = [
  {
    icon: CloudUpload,
    title: "Upload ZIP",
    description: "Upload file ZIP aplikasi Anda dan deploy secara otomatis.",
    color: "text-white",
    bg: "bg-[#1d4ed8]", // blue-700
  },
  {
    icon: FaGithub,
    title: "GitHub Deploy",
    description: "Hubungkan repository GitHub dan deploy otomatis dengan satu klik.",
    color: "text-white",
    bg: "bg-[#1f2937]", // gray-800 / black
  },
  {
    icon: FaDocker,
    title: "Docker Support",
    description: "Build image dan jalankan container Docker dengan mudah dan cepat.",
    color: "text-white",
    bg: "bg-[#2563eb]", // blue-600
  },
  {
    icon: Monitor,
    title: "Monitoring Real-time",
    description: "Pantau penggunaan CPU, RAM, Disk, dan Network secara real-time.",
    color: "text-white",
    bg: "bg-[#0d9488]", // teal-600
  },
  {
    icon: Terminal,
    title: "Web Terminal",
    description: "Akses terminal container atau server langsung dari browser Anda.",
    color: "text-white",
    bg: "bg-[#6366f1]", // indigo-500
  },
  {
    icon: ShieldCheck,
    title: "SSL Otomatis",
    description: "Dapatkan sertifikat SSL gratis secara otomatis untuk aplikasi Anda.",
    color: "text-white",
    bg: "bg-[#0f766e]", // teal-700
  },
];

export const LANDING_STEPS = [
  {
    icon: CloudUpload,
    step: "1",
    title: "Upload ZIP / GitHub",
    description: "Upload file ZIP atau hubungkan repository GitHub Anda.",
    color: "text-blue-600"
  },
  {
    icon: Box,
    step: "2",
    title: "Build Image",
    description: "Sistem akan build Docker Image secara otomatis.",
    color: "text-blue-600"
  },
  {
    icon: Server,
    step: "3",
    title: "Create Container",
    description: "Container dibuat dan dijalankan di server.",
    color: "text-blue-600"
  },
  {
    icon: Globe,
    step: "4",
    title: "Generate Domain",
    description: "Subdomain unik dibuat untuk aplikasi Anda.",
    color: "text-blue-600"
  },
  {
    icon: ShieldCheck,
    step: "5",
    title: "Enable SSL",
    description: "SSL otomatis aktif, aplikasi Anda siap diakses dengan HTTPS.",
    color: "text-blue-600"
  },
  {
    icon: Rocket,
    step: "6",
    title: "Application Online",
    description: "Aplikasi Anda online dan siap digunakan!",
    color: "text-green-500"
  },
];

export const LANDING_TESTIMONIALS = [
  {
    name: "Ahmad Rizki",
    role: "DevOps Engineer",
    company: "TechNusantara",
    content: "Portdock benar-benar mengubah cara tim kami mendeploy aplikasi. Yang tadinya butuh waktu berjam-jam setup server, sekarang bisa selesai dalam hitungan menit. Sangat luar biasa!",
    avatar: "AR"
  },
  {
    name: "Sarah Wijaya",
    role: "CTO",
    company: "InnoSoft",
    content: "Integrasi GitHub-nya sangat mulus. Setiap kali ada push ke main branch, aplikasi langsung ter-deploy otomatis. Fitur monitoring real-time nya juga sangat membantu memantau resource.",
    avatar: "SW"
  },
  {
    name: "Budi Santoso",
    role: "Fullstack Developer",
    company: "KreatifDigital",
    content: "Sebagai solo developer, Portdock menghemat waktu saya untuk urusan infrastruktur. Saya bisa lebih fokus ngoding dan biarkan Portdock yang urus deployment dan SSL-nya.",
    avatar: "BS"
  }
];

export const LANDING_PRICING = [
  {
    name: "Hobby",
    price: "Gratis",
    description: "Cocok untuk project pribadi dan eksperimen.",
    features: [
      "1 Project",
      "Upload ZIP Deployment",
      "Shared Subdomain",
      "Community Support",
      "Basic Monitoring"
    ],
    highlight: false,
    ctaText: "Mulai Gratis"
  },
  {
    name: "Pro",
    price: "Rp 99.000",
    period: "/ bulan",
    description: "Untuk tim kecil dan aplikasi production.",
    features: [
      "Unlimited Projects",
      "GitHub Auto Deploy",
      "Custom Domain + SSL",
      "Priority Support",
      "Advanced Monitoring",
      "Web Terminal Access"
    ],
    highlight: true,
    ctaText: "Berlangganan Pro"
  }
];

export const LANDING_FAQ = [
  {
    question: "Apakah Portdock benar-benar gratis?",
    answer: "Ya! Kami menyediakan paket Hobby yang 100% gratis selamanya untuk project pribadi Anda. Anda bisa upgrade ke paket Pro kapan saja jika membutuhkan resource lebih besar."
  },
  {
    question: "Bahasa pemrograman apa saja yang didukung?",
    answer: "Karena berbasis Docker, Portdock mendukung SEMUA bahasa pemrograman dan framework (Node.js, Python, PHP, Go, Ruby, Java, dll). Jika bisa di-Dockerize, bisa jalan di Portdock."
  },
  {
    question: "Apakah saya perlu bisa Docker untuk pakai Portdock?",
    answer: "Tidak wajib. Untuk fitur Upload ZIP, sistem kami akan secara otomatis mendeteksi bahasa aplikasi Anda dan membuatkan Dockerfile yang optimal tanpa perlu konfigurasi manual."
  },
  {
    question: "Bagaimana cara kerja fitur GitHub Deploy?",
    answer: "Cukup hubungkan akun GitHub Anda, pilih repository, dan Portdock akan mengaktifkan webhook. Setiap kali Anda melakukan push ke branch yang dipilih, aplikasi akan otomatis di-build dan deploy ulang."
  }
];
