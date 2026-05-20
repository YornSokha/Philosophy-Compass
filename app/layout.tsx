import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Philosophy Compass",
  description: "Understand yourself through philosophical frameworks — not a reference site, a mirror.",
  openGraph: {
    title: "Philosophy Compass",
    description: "Discover your philosophical blend. Who am I, and how should I live?",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${newsreader.variable}`}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans">
        <Nav />
        {children}
      </body>
    </html>
  );
}
