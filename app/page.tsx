'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination } from 'swiper/modules'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, Paintbrush, Wrench, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { toast } from 'sonner'
import Marquee from 'react-fast-marquee'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Firebase
import { db } from '../lib/firebase'
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore'
import { LogoCloud } from '@/components/ui/logo-cloud-3'
import { sortPortfolioNewestFirst } from '@/lib/portfolio'

const partnerLogos = [
  {
    src: "https://svgl.app/library/nvidia-wordmark-light.svg",
    alt: "Nvidia Logo",
  },
  {
    src: "https://svgl.app/library/supabase_wordmark_light.svg",
    alt: "Supabase Logo",
  },
  {
    src: "https://svgl.app/library/openai_wordmark_light.svg",
    alt: "OpenAI Logo",
  },
  {
    src: "https://svgl.app/library/turso-wordmark-light.svg",
    alt: "Turso Logo",
  },
  {
    src: "https://svgl.app/library/vercel_wordmark.svg",
    alt: "Vercel Logo",
  },
  {
    src: "https://svgl.app/library/github_wordmark_light.svg",
    alt: "GitHub Logo",
  },
  {
    src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg",
    alt: "Claude AI Logo",
  },
  {
    src: "https://svgl.app/library/clerk-wordmark-light.svg",
    alt: "Clerk Logo",
  },
]

const AnimatedCounter = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const [count, setCount] = useState(value)

  useEffect(() => {
    let start = 0
    const end = value
    setCount(0)

    const duration = 1500
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(start)
      }
    }, 16)

    return () => clearInterval(timer)
  }, [value])

  const isDecimal = value % 1 !== 0

  return (
    <span>
      {isDecimal ? count.toFixed(1) : Math.floor(count)}
      {suffix}
    </span>
  )
}

const subtitles = [
  'body repair & dempul',
  'cat oven & repaint',
  'detailing & coating',
]

interface Testimonial {
  message: string;
  name: string;
  photo: string;
  rating: number;
  role: string;
}

interface Portfolio {
  id: string
  title: string
  url: string
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [subtitleIndex, setSubtitleIndex] = useState(0)
  const [selectedImg, setSelectedImg] = useState<string | null>(null)
  const [portfolioImages, setPortfolioImages] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState<string>("")

  const HOME_PORTFOLIO_LIMIT = 6
  const homePortfolio = portfolioImages.slice(0, HOME_PORTFOLIO_LIMIT)

  const prevRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const swiperRef = useRef<any>(null)

  // Ambil data portfolio dari Firestore
  useEffect(() => {
    setIsLoading(true)
    const unsub = onSnapshot(
      collection(db, "portfolio"), 
      (snapshot) => {
        const data = sortPortfolioNewestFirst(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Portfolio[]
        )
        
        setPortfolioImages(data)
        setIsLoading(false)
      },
      (error) => {
        console.error("Error fetching portfolio:", error)
        setPortfolioImages([])
        setIsLoading(false)
      }
    )
    return () => unsub()
  }, [])

  // Load testimonials
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "testimonials"), 
      (snapshot) => {
        const data = snapshot.docs.map((doc) => doc.data() as Testimonial)
        setTestimonials(data)
      },
      (error) => {
        console.error("Error fetching testimonials:", error)
        setTestimonials([])
      }
    )
    return () => unsub();
  }, []);

  // Ganti subtitle otomatis
  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % subtitles.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [])

  const updateSwiperNavigation = useCallback((swiper: any) => {
    requestAnimationFrame(() => {
      if (swiper?.params?.navigation && swiper.navigation) {
        swiper.params.navigation.prevEl = prevRef.current
        swiper.params.navigation.nextEl = nextRef.current
        swiper.navigation.destroy()
        swiper.navigation.init()
        swiper.navigation.update()
      }
    })
  }, [])

  const handleSwiperInit = useCallback((swiper: any) => {
    swiperRef.current = swiper
    updateSwiperNavigation(swiper)
  }, [updateSwiperNavigation])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImg(null)
    }
    if (selectedImg) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedImg])

  // Newsletter handler
  const handleSubscribe = async () => {
    if (!email) {
      toast.error("Masukkan email terlebih dahulu.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Format email tidak valid.");
      return;
    }

    try {
      const emailDoc = await getDoc(doc(db, "newsletter", email));
      
      if (emailDoc.exists()) {
        toast.error("Email ini sudah terdaftar.");
        return;
      }

      await setDoc(doc(db, "newsletter", email), {
        email,
        createdAt: new Date(),
      });
      
      toast.success("Terima kasih sudah subscribe!");
      setEmail("");
    } catch (error) {
      console.error("Error menyimpan email:", error);
      toast.error("Gagal subscribe, coba lagi.");
    }
  }

  // Testimonial Card Component
  const TestimonialCard = ({ t, index }: { t: Testimonial; index: number }) => (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-md p-6 flex flex-col justify-between h-[260px] w-full text-left">
      {/* Rating & User Avatar */}
      <div className="flex items-center gap-3 mb-3">
        {t.photo ? (
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
            <Image
              src={t.photo}
              alt={`Foto ${t.name}`}
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-150 flex items-center justify-center flex-shrink-0 text-gray-800 font-bold border border-gray-200">
            {t.name?.[0]?.toUpperCase() || 'U'}
          </div>
        )}
        <div>
          <h4 className="font-extrabold text-gray-900 text-sm leading-tight">{t.name}</h4>
          <span className="text-xs text-gray-500 block mt-0.5">{t.role}</span>
        </div>
      </div>
      
      {/* Teks */}
      <div className="flex-1 flex items-center overflow-hidden">
        <p className="text-gray-700 italic text-sm line-clamp-4 leading-relaxed">
          &ldquo;{t.message}&rdquo;
        </p>
      </div>
      
      {/* Rating Star */}
      <div className="flex justify-start mt-3 text-red-600">
        {Array.from({ length: 5 }).map((_, idx) => (
          <svg
            key={idx}
            xmlns="http://www.w3.org/2000/svg"
            fill={idx < t.rating ? "currentColor" : "none"}
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.003 6.145h6.462c.969 0 1.371 1.24.588 1.81l-5.234 3.805 2.003 6.145c.3.921-.755 1.688-1.539 1.118l-5.233-3.804-5.233 3.804c-.783.57-1.838-.197-1.539-1.118l2.003-6.145-5.234-3.805c-.783-.57-.38-1.81.588-1.81h6.462l2.003-6.145z"
            />
          </svg>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8f9fa] text-gray-900 overflow-x-hidden min-h-screen">
      {/* Hero — min-h + svh (bukan dvh) agar tinggi stabil saat scroll mobile */}
      <section className="section-full-width relative flex items-center min-h-[calc(100svh-5rem)] md:min-h-[calc(100svh-6rem)] py-4 sm:py-6">
        <div className="container mx-auto px-4 md:px-12 w-full grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 md:gap-12 items-center relative z-10">
          {/* Text */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left justify-center">
            <div className="inline-flex items-center bg-gray-950 text-white px-3.5 py-1.5 rounded-lg border border-gray-800 shadow-md mb-4 sm:mb-5 gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest select-none">
              <span className="text-gray-400 font-sans">One-Stop</span>
              <span className="text-white font-sans">Auto Body Care</span>
            </div>
            
            <h1 className="mb-4 sm:mb-5 text-[1.75rem] leading-[1.15] sm:text-4xl md:text-5xl lg:text-6xl font-black font-sporty text-gray-900 tracking-tighter">
              Sempurnakan <span className="text-red-600">Estetika & Kilau</span> Mobil Anda
            </h1>
            
            <div className="mb-3 sm:mb-4">
              <div className="flex flex-wrap items-baseline justify-center md:justify-start gap-x-1.5 text-sm sm:text-base leading-normal">
                <span className="text-gray-600">Bengkel spesialis</span>
                <span className="relative inline-block text-red-600 font-semibold">
                  <span className="invisible whitespace-nowrap select-none" aria-hidden="true">
                    detailing & coating
                  </span>
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={subtitleIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="absolute left-0 top-0 whitespace-nowrap"
                    >
                      {subtitles[subtitleIndex]}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-x-2 md:gap-x-6 w-full text-center md:text-left border-t border-gray-200/60 pt-4 sm:pt-5 mt-0">
              <div>
                <p className="text-lg sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  <AnimatedCounter value={2000} suffix="+" />
                </p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-2 whitespace-nowrap">Pelanggan</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  <AnimatedCounter value={4000} suffix="+" />
                </p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-2 whitespace-nowrap">Kendaraan</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl md:text-3xl font-black text-red-600 tracking-tight">
                  <AnimatedCounter value={99} suffix="%" />
                </p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-2 whitespace-nowrap">Kepuasan</p>
              </div>
              <div>
                <p className="text-lg sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                  <AnimatedCounter value={2.1} suffix="x" />
                </p>
                <p className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mt-2 whitespace-nowrap">Repeat Order</p>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative w-full flex justify-center md:justify-end items-center h-[200px] sm:h-[240px] md:h-auto md:min-h-[420px] lg:min-h-[460px]">
            <div className="relative w-full max-w-[500px] lg:max-w-[540px] h-full md:aspect-[4/3] md:h-auto group">
              {/* Artisanal dotted border offset */}
              <div className="absolute inset-0 border-2 border-dashed border-red-600/60 rounded-3xl translate-x-4 translate-y-4 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2" />
              
              {/* Image Container with solid borders */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-gray-900 shadow-2xl bg-white p-2.5 transition-transform duration-500 group-hover:-translate-x-1 group-hover:-translate-y-1">
                <div className="relative w-full h-full rounded-2xl overflow-hidden">
                  <Image
                    src="/hero-car.png"
                    alt="Glossy dark sports car reflecting neon lights"
                    fill
                    priority
                    className="object-cover hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, 500px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-xl">
                    <div>
                      <p className="text-xs text-gray-300 font-sans">Featured Restoration</p>
                      <p className="text-sm font-bold text-white">Porsche 911 Nano Ceramic</p>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white bg-red-600 px-2 py-1 rounded font-sans">
                      Wet Look
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud Section */}
      <section className="section-full-width py-12 relative bg-[#f8f9fa] border-b border-gray-200/50">
        <div className="container mx-auto px-4 md:px-12 relative max-w-3xl">
          <h2 className="mb-5 text-center font-medium text-foreground text-xl tracking-tight md:text-3xl">
            <span className="text-muted-foreground">Trusted by brands & partners.</span>
            <br />
            <span className="font-semibold">Used by the leaders.</span>
          </h2>
          <div className="mx-auto my-5 h-px max-w-sm bg-gray-200 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

          <LogoCloud logos={partnerLogos} />

          <div className="mt-5 h-px bg-gray-200 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="section-full-width py-12 relative bg-[#f8f9fa]">
        <div className="container mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl">
              <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">Galeri Portofolio</span>
              <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-gray-900">Hasil Kerja Kami</h2>
              <p className="text-gray-600 text-sm mt-3 leading-relaxed">
                Kompilasi foto mobil klien yang telah selesai melewati proses detailing, poles, cat oven, maupun modifikasi bodi di workshop kami.
              </p>
            </div>
            {homePortfolio.length > 1 && (
              <div className="flex gap-3 mt-6 md:mt-0">
                <button
                  ref={prevRef}
                  aria-label="Sebelumnya"
                  className="bg-white hover:bg-red-600 hover:text-white border border-gray-200 text-gray-700 p-3.5 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  ref={nextRef}
                  aria-label="Selanjutnya"
                  className="bg-white hover:bg-red-600 hover:text-white border border-gray-200 text-gray-700 p-3.5 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div>
            </div>
          ) : homePortfolio.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
              Belum ada foto portfolio.
            </div>
          ) : (
            <>
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                slidesPerView={1}
                loop={homePortfolio.length > 1}
                pagination={{
                  clickable: true,
                  dynamicBullets: true,
                }}
                navigation={{
                  prevEl: prevRef.current,
                  nextEl: nextRef.current,
                }}
                onSwiper={handleSwiperInit}
                onInit={updateSwiperNavigation}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 20 },
                  1024: { slidesPerView: 3, spaceBetween: 24 },
                }}
                className="!pb-12"
              >
                {homePortfolio.map((img, index) => (
                  <SwiperSlide key={img.id}>
                    <div
                      className="cursor-pointer group relative aspect-[4/5] overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white"
                      onClick={() => setSelectedImg(img.url)}
                    >
                      <Image
                        src={img.url}
                        alt={img.title || 'Portfolio'}
                        fill
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 280px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                        {img.title && (
                          <h4 className="text-white font-extrabold text-base leading-tight mb-1">{img.title}</h4>
                        )}
                        <span className="text-xs text-red-400 font-bold font-sans">Klik untuk Perbesar</span>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>

              {portfolioImages.length > HOME_PORTFOLIO_LIMIT && (
                <div className="flex justify-center mt-2">
                  <Button asChild size="lg" className="rounded-full px-8">
                    <Link href="/gallery">Tampilkan Lebih Banyak</Link>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <AnimatePresence>
          {selectedImg && (
            <motion.div
              className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImg(null)}
            >
              <button
                type="button"
                onClick={() => setSelectedImg(null)}
                aria-label="Tutup preview"
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center shadow-lg transition z-10"
              >
                <span className="text-2xl font-bold select-none">×</span>
              </button>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl aspect-video"
              >
                <Image
                  src={selectedImg}
                  alt="Preview portfolio"
                  fill
                  className="rounded-xl shadow-2xl object-contain"
                  sizes="(max-width: 768px) 95vw, 1200px"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Promo & WhatsApp CTA Section */}
      <section className="section-full-width py-12 bg-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-500 text-white rounded-3xl relative overflow-hidden py-16 px-6 md:py-20 md:px-12 text-center shadow-xl">
            <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-black/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 max-w-4xl mx-auto">
              <span className="text-xs uppercase font-extrabold tracking-widest text-black bg-white px-3 py-1 rounded-full font-sans">
                Promo Terbatas Bulan Ini
              </span>
              <h2 className="text-4xl md:text-6xl font-black mt-4 mb-4 tracking-tight">
                Free Car Detailing untuk Cat Full Body
              </h2>
              <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-white/90 leading-relaxed">
                Dapatkan paket interior & engine bay detailing senilai <span className="font-extrabold text-black">Rp 1.000.000</span> secara gratis untuk setiap pemesanan cat siram full body oven.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/products" className="inline-block px-10 py-4 bg-black hover:bg-black/80 text-white font-extrabold rounded-xl shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  Ambil Promo Sekarang
                </Link>
                <a href="https://wa.me/6285900472233" target="_blank" rel="noopener noreferrer" className="inline-block px-8 py-4 bg-white text-red-600 font-extrabold rounded-xl shadow-xl hover:bg-white/90 transition-all">
                  Hubungi Admin WA
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="section-full-width py-24 text-center relative bg-[#f8f9fa] no-scroll-y border-t border-gray-200">
          <div className="container mx-auto px-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">Testimoni Pelanggan</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-gray-900">Apa Kata Pemilik Kendaraan</h2>
          </div>

          {/* Desktop - Marquee */}
          <div className="hidden md:block w-full testimonial-wrapper">
            <Marquee
              speed={35}
              gradient
              gradientColor="#f8f9fa"
              gradientWidth={100}
              pauseOnHover
              play
            >
              {testimonials.map((t, i) => (
                <div
                  key={`testimonial-desktop-${i}`}
                  className="mx-4 w-[340px] flex-shrink-0"
                  style={{ willChange: 'transform' }}
                >
                  <TestimonialCard t={t} index={i} />
                </div>
              ))}
            </Marquee>
          </div>

          {/* Mobile - Swiper */}
          <div className="block md:hidden px-4 testimonial-wrapper">
            <Swiper
              modules={[Pagination]}
              spaceBetween={16}
              slidesPerView={1}
              centeredSlides={true}
              loop={testimonials.length > 1}
              pagination={{
                clickable: true,
                dynamicBullets: true,
              }}
              className="testimonial-swiper !pb-10"
            >
              {testimonials.map((t, i) => (
                <SwiperSlide key={`testimonial-mobile-${i}`}>
                  <div className="mx-auto max-w-[340px] px-2">
                    <TestimonialCard t={t} index={i} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="section-full-width py-24 bg-[#f8f9fa] border-t border-gray-200">
        <div className="container mx-auto px-4 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">Keunggulan Kami</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-gray-900">Mengapa Memilih Hypermile</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Paintbrush className="h-6 w-6 text-red-600" />,
                title: "Fasilitas Oven Spray Booth",
                desc: "Pengecatan bebas debu, matang merata, menghasilkan lapisan cat orisinil yang kuat dan halus.",
                bg: "bg-white shadow-sm"
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-red-600" />,
                title: "Teknisi Painter Berlisensi",
                desc: "Painter berpengalaman khusus restorasi mobil sport, modifikasi kontes, hingga perbaikan harian.",
                bg: "bg-white shadow-sm"
              },
              {
                icon: <Sparkles className="h-6 w-6 text-red-600" />,
                title: "Bahan Premium Standar Kontes",
                desc: "Menggunakan pernis tebal tinggi (high solid) serta cat import berkualitas tinggi.",
                bg: "bg-white shadow-sm"
              },
              {
                icon: <Shield className="h-6 w-6 text-red-600" />,
                title: "Garansi Cat 1 Tahun",
                desc: "Jaminan kepuasan hasil pengerjaan. Kami siap cat ulang jika terjadi retak/belang dalam setahun.",
                bg: "bg-white shadow-sm"
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl border border-gray-200 hover:border-red-600/20 transition-all duration-300 ${item.bg}`}
              >
                <div className="p-3 w-fit rounded-xl bg-red-50 mb-4">
                  {item.icon}
                </div>
                <h4 className="text-xl font-bold mb-2 text-gray-900">{item.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-full-width py-24 bg-[#f8f9fa] border-t border-gray-200">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-extrabold mt-2 text-gray-900">Pertanyaan Umum</h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "Berapa lama proses pengecatan satu panel mobil?",
                a: "Pengecatan bodi ringan per panel biasanya membutuhkan waktu 1 s.d. 2 hari kerja, meliputi proses gosok sasis, dempul, epoxy primer, cat warna, pernis, dan pemanggangan oven."
              },
              {
                q: "Apa bedanya Nano Ceramic dengan poles biasa?",
                a: "Poles biasa hanya memotong vernis untuk menghilangkan baret halus dan bertahan beberapa minggu. Nano ceramic mengikat secara kimiawi pada vernis cat, membentuk lapisan kaca keras yang melindungi dari asam, UV, baret halus, dan memberikan efek hydrophobic permanen."
              },
              {
                q: "Apakah bisa mengajukan klaim asuransi di Hypermile?",
                a: "Saat ini kami menerima perbaikan umum secara mandiri, restorasi, modifikasi, serta kerja sama rekanan asuransi tertentu. Silakan hubungi admin via WhatsApp untuk memverifikasi polis Anda."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 bg-[#f8f9fa] rounded-2xl border border-gray-200">
                <h4 className="font-extrabold text-gray-900 text-base md:text-lg mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-full-width py-20 bg-[#f8f9fa] text-center px-4 border-t border-gray-200">
        <span className="text-xs uppercase font-extrabold tracking-widest text-red-600 font-sans">Newsletter</span>
        <h2 className="text-3xl md:text-5xl font-black mt-2 mb-3 text-gray-900 tracking-tight">Dapatkan Info Promo & Tips Perawatan</h2>
        <p className="mb-8 text-gray-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Masukkan email Anda untuk menerima informasi diskon khusus pengecatan, tips poles mobil mandiri, dan jadwal event otomotif.
        </p>
        <form
          className="flex justify-center gap-2 flex-wrap max-w-sm mx-auto"
          onSubmit={e => {
            e.preventDefault();
            handleSubscribe();
          }}
        >
          <input
            type="email"
            placeholder="Alamat Email Anda"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all duration-300 text-sm shadow-md shadow-red-600/10 animate-pulse-slow"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  )
}