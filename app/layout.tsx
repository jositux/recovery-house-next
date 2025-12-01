import "./globals.css";
import { Fraunces, DM_Sans } from "next/font/google";
import type { Metadata } from "next";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

// 🛑 Metadata ESTÁTICA y GLOBAL
export const metadata: Metadata = {
  // Los valores dinámicos serán SOBREESCRITOS por [lang]/layout.tsx
  title: {
    default: "Recovery Care Solutions",
    template: "%s | Recovery Care Solutions",
  },
  description: "Conectamos pacientes con casas de recuperación en todo el mundo",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 🛑 Mantener html y body aquí. lang='en' es un valor por defecto.
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <head>
        <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml" />
      </head>
      <body className="font-dm-sans">
        {children}
      </body>
    </html>
  );
}