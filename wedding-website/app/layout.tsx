import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import BotanicalBackground from "./components/BotanicalBackground";
import SiteHeader from "./components/SiteHeader";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Julia & Zach | Wedding",
  description: "Julia and Zach's wedding website for celebration details and guest information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8F4EA] text-[#2D2923]">
        <BotanicalBackground />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
