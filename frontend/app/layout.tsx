import type { Metadata } from "next";
import "./globals.css";
import { ThemeInitializer } from "@/components/theme-initializer";

export const metadata: Metadata = {
  title: "CareerOS — Talent Mobility Platform",
  description: "Talent mobility platform for candidates and employers — career paths, upskilling, and hiring."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" data-accent="gold" data-headingfont="source" suppressHydrationWarning>
      <body><ThemeInitializer />{children}</body>
    </html>
  );
}
