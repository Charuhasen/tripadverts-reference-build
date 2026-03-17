import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DOOH Impression Tracker",
  description: "Smart Digital Out-of-Home impression tracking with face detection and gaze analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground relative min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>

      </body>
    </html>
  );
}
