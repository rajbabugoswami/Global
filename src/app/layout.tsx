import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import { SessionProvider } from "@/components/providers/SessionProvider";

import { prisma } from "@/lib/prisma";

import { Toaster } from "sonner";

const manrope = Manrope({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
  title: "GlobalConnect - All-in-One Global Communication Platform",
  description: "Connect with the World. Chat, Call, and Share. One platform. Every country. Free communication.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let adsenseConfig = "";
  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
    if (settings && settings.adsEnabled && settings.adsenseConfig) {
      adsenseConfig = settings.adsenseConfig;
    }
  } catch (error) {
    console.error("Failed to load global ads config", error);
  }

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {adsenseConfig ? (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseConfig}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        ) : null}
      </head>
      <body className={`${manrope.className} bg-gray-50 dark:bg-[#050510] text-gray-900 dark:text-gray-100 antialiased`}>
        <SessionProvider>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Toaster position="bottom-right" theme="dark" />
        </SessionProvider>
      </body>
    </html>
  );
}
