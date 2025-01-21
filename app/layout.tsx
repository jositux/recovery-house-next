import type { Metadata } from 'next'
import { Fraunces, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from "@/components/ui/toaster"

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
})

const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
})

export const metadata: Metadata = {
  title: 'Recovery Care Solutions',
  description: 'Conectamos pacientes con casas de recuperación en todo el mundo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="font-dm-sans">
        <Header />
        <main>{children}</main>
        <Toaster />
        <Footer />
      </body>
    </html>
  )
}

