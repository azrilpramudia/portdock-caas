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

import { APP_CONFIG, API_BASE_URL } from "@/constants/config";

export async function generateMetadata(): Promise<Metadata> {
  let siteName = APP_CONFIG.name;
  let siteDescription = APP_CONFIG.description;
  
  try {
    // Fetch directly from the backend API using absolute URL because this runs on Next.js server
    const res = await fetch(`${API_BASE_URL}/settings/public`, {
      next: { revalidate: 60 } // revalidate every minute
    });
    
    if (res.ok) {
      const data = await res.json();
      if (data.siteName) siteName = data.siteName;
      if (data.siteDescription) siteDescription = data.siteDescription;
    }
  } catch (error) {
    console.error("Failed to fetch public settings for metadata", error);
  }

  return {
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: siteDescription,
    keywords: ["docker", "deployment", "container", "hosting", "devops"],
    authors: [{ name: APP_CONFIG.author }],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable} suppressHydrationWarning>
      <body className="font-poppins antialiased">
        <Providers
          themeProps={{
            attribute: "class",
            defaultTheme: "system",
            enableSystem: true,
            disableTransitionOnChange: true,
          }}
        >
          {children}
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
