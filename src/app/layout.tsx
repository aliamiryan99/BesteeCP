import type { Metadata } from "next";
import { ToastHost } from "@/components/system/ToastHost";
import { ConvexClientProvider } from "./ConvexClientProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bestiee CP",
  description: "Admin dashboard panel to manage the barbers",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f97316" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link
          href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-vazir app-shell antialiased`} suppressHydrationWarning>
        <ConvexClientProvider>
          <ToastHost />
          {children}
        </ConvexClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
