import type { Metadata } from "next";
import "./globals.css";
import { HeaderWrapper } from "./components/HeaderWrapper";
import { Footer } from "./components/Footer";

export const metadata: Metadata = {
  title: "Discover Albania | Travel Experiences & Guides",
  description:
    "Plan your trip to Albania with curated vacation packages, expert travel guides, and personalized support from Discover Albania.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <HeaderWrapper />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}

