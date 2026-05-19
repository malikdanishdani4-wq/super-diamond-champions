import type { Metadata } from "next";
import { ThemeProvider } from "@/context/ThemeContext";
import { LanguageProvider } from "@/context/LanguageContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Super Diamond Champions Trophy | Pigeon Flying Championship Results",
  description: "View live pigeon flying championship results, rankings, and tournament standings. Super Diamond Champions Trophy — the premier pigeon competition platform.",
  keywords: ["pigeon flying", "pigeon championship", "competition results", "pigeon tournament", "Super Diamond Champions Trophy", "kabootar bazi"],
  openGraph: {
    title: "Super Diamond Champions Trophy",
    description: "The premier pigeon flying championship platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
