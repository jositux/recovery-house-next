import type { Metadata } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PageTracker } from "react-page-tracker";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "Recovery Care Solutions",
  description:
    "Conectamos pacientes con casas de recuperación en todo el mundo",
  icons: {
    icon: "/favicon.svg", // Ruta del favicon SVG
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-dm-sans">
        <Header />
        <main className="max-auto relative z-0">
          <PageTracker />
          {children}
        </main>
       
        <Footer />
      </body>
    </html>
  );
}
