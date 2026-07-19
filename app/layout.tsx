import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { cn } from '@/lib/utils'
import { ThemeProvider } from '@/components/theme-provider'
import Header from '@/components/layout/Header'
import { Separator } from '@/components/ui/separator'
import Footer from '@/components/layout/Footer'
import ProgressbarProvider from '@/components/ProgressbarProvider'
import SessionProvider from '@/components/SessionProvider'
import { Toaster } from 'sonner'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import Chatbot from '@/components/global/Chatbot'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Hypermile Auto Bodyworks – Body Repair & Detailing Premium',
  description: 'Hypermile Auto Bodyworks adalah workshop spesialis cat spray booth, body repair, premium paint polish, dan nano ceramic coating di Salatiga dengan hasil presisi dan bergaransi.',
  keywords: ['Hypermile Auto Bodyworks', 'Body Repair Salatiga', 'Cat Spray Booth Salatiga', 'Salon Mobil Salatiga', 'Nano Ceramic Salatiga', 'Poles Mobil Salatiga'],
  icons: {
    icon: '/favicon.ico?v=2',
  },
  openGraph: {
    title: 'Hypermile Auto Bodyworks – Body Repair & Detailing Premium',
    description: 'Sempurnakan estetika dan kilau mobil Anda dengan layanan restorasi bodi dan coating bergaransi dari Hypermile Auto Bodyworks.',
    url: 'https://hypermilebengkel.com',
    siteName: 'Hypermile Auto Bodyworks',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: 'https://hypermilebengkel.com/hypermile.png',
        width: 1200,
        height: 630,
        alt: 'Hypermile Auto Bodyworks - Body Repair & Detailing Premium',
      },
    ],
  },
  alternates: {
    canonical: 'https://hypermilebengkel.com',
  },
  robots: {
    index: true,
    follow: true,
  },
}


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('bg-background font-sans antialiased', inter.variable)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          forcedTheme="light"
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <div id="web-wrapper" className="container flex min-h-screen flex-col">
              <Header />
              <Separator className="hidden md:block" />

              <main className="flex-1 pb-20 px-0">
                <ProgressbarProvider>{children}</ProgressbarProvider>
              </main>

              <Toaster position="top-center" closeButton />
              <Footer />
            </div>


            <Chatbot />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
