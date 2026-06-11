import {
  Container,
  Rocket,
  BarChart3,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

export const LANDING_FEATURES = [
  {
    icon: Rocket,
    title: "Deploy Instan",
    description: "Deploy aplikasi dari ZIP atau GitHub dalam hitungan klik tanpa konfigurasi rumit.",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Container,
    title: "Docker Native",
    description: "Terintegrasi langsung dengan Docker Engine untuk manajemen container yang powerful.",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    icon: BarChart3,
    title: "Real-time Monitoring",
    description: "Pantau CPU, RAM, dan Network usage container Anda secara real-time dengan grafik interaktif.",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Shield,
    title: "Keamanan JWT",
    description: "Autentikasi aman dengan JWT dan enkripsi password menggunakan bcrypt.",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: Globe,
    title: "Manajemen Domain",
    description: "Konfigurasi domain kustom dan subdomain untuk setiap aplikasi Anda.",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: Zap,
    title: "Auto Dockerfile",
    description: "Portdock otomatis mendeteksi runtime dan membuat Dockerfile yang optimal.",
    color: "text-yellow-600",
    bg: "bg-yellow-50",
  },
];

export const LANDING_STEPS = [
  { step: "01", title: "Buat Project", description: "Pilih nama dan metode deployment" },
  { step: "02", title: "Upload / GitHub", description: "Upload ZIP atau connect ke repositori" },
  { step: "03", title: "Build Otomatis", description: "Docker image dibangun secara otomatis" },
  { step: "04", title: "Aplikasi Online", description: "Akses aplikasi melalui URL yang digenerate" },
];
