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
import WhatsAppButton from '@/components/global/WhatsappButton' 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Hypermile Bodyworks – Body Repair & Detailing Premium',
  description: 'Hypermile Bodyworks adalah workshop spesialis cat oven, body repair, premium paint polish, dan nano ceramic coating di Salatiga dengan hasil presisi dan bergaransi.',
  keywords: ['Hypermile Bodyworks', 'Body Repair Salatiga', 'Cat Oven Salatiga', 'Salon Mobil Salatiga', 'Nano Ceramic Salatiga', 'Poles Mobil Salatiga'],
  openGraph: {
    title: 'Hypermile Bodyworks – Body Repair & Detailing Premium',
    description: 'Sempurnakan estetika dan kilau mobil Anda dengan layanan restorasi bodi dan coating bergaransi dari Hypermile Bodyworks.',
    url: 'https://hypermilebengkel.com',
    siteName: 'Hypermile Bodyworks',
    locale: 'id_ID',
    type: 'website',
    images: [
      {
        url: 'https://hypermilebengkel.com/hypermile.jpg',
        width: 1200,
        height: 630,
        alt: 'Hypermile Bodyworks - Body Repair & Detailing Premium',
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

              <main className="flex-1 pb-20">
                <ProgressbarProvider>{children}</ProgressbarProvider>
              </main>

              <Toaster position="top-center" closeButton />
              <Footer />
            </div>

            
            <WhatsAppButton />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
