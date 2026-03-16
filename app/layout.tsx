import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Anton, Geist, Geist_Mono, Inter_Tight } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Chat } from "@/app/_components/chat";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "GS.AI",
  description: "O app que vai transformar a forma como você treina.",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16-v2.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32-v2.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192-v2.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512-v2.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FIT.AI",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${interTight.variable} ${anton.variable} antialiased`}
      >
        <NuqsAdapter>
          {children}
          <Suspense>
            <Chat />
          </Suspense>
        </NuqsAdapter>
      </body>
    </html>
  );
}
