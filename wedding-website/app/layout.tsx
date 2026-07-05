import type { Metadata } from "next";
import { Cardo } from "next/font/google";
import "./globals.css";
import BotanicalBackground from "./components/BotanicalBackground";
import SiteHeader from "./components/SiteHeader";

const cardo = Cardo({
  variable: "--font-cardo",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Julia & Zach | Wedding",
  description: "Wedding details for Julia & Zach's celebration.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cardo.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#F8F4EA] text-[#2D2923]">
        <BotanicalBackground />
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
