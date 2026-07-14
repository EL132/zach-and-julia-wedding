import type { Metadata } from "next";
import { Cardo, Inter } from "next/font/google";
import "./globals.css";
import SiteHeader from "./components/SiteHeader";

const primaryFont = Cardo({
  variable: "--font-cardo",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const secondaryFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html
      lang="en"
      className={`${primaryFont.variable} ${secondaryFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#F8F4EA] text-[#2D2923]">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
