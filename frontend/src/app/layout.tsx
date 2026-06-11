import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

import { APP_CONFIG } from "@/constants/config";

export const metadata: Metadata = {
  title: `${APP_CONFIG.name}`,
  description: APP_CONFIG.description,
  keywords: ["docker", "deployment", "container", "hosting", "devops"],
  authors: [{ name: APP_CONFIG.author }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className="font-poppins antialiased">
        <Providers>
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
