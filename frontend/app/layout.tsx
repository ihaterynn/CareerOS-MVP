import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerOS — Talent Mobility Platform",
  description: "Talent mobility platform for candidates and employers — career paths, upskilling, and hiring."
};

// Apply persisted theme/accent/heading-font synchronously, before first paint,
// to avoid a flash. All three are written by the shell/tweaks panel and read here.
const themeScript = `(function(){try{var d=document.documentElement;
d.setAttribute('data-theme', localStorage.getItem('cos_theme')||'light');
d.setAttribute('data-accent', localStorage.getItem('cos_accent')||'gold');
d.setAttribute('data-headingfont', localStorage.getItem('cos_headingfont')||'source');
}catch(e){}})();`;

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" data-accent="gold" data-headingfont="source" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
