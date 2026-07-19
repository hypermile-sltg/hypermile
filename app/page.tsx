'use client'

import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Sparkles, Paintbrush, Wrench, ChevronLeft, ChevronRight, CheckCircle2, Volume2, VolumeX } from "lucide-react"
import { toast } from 'sonner'
import Marquee from 'react-fast-marquee'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

// Firebase
import { db } from '../lib/firebase'
import { collection, onSnapshot, doc, setDoc, getDoc } from 'firebase/firestore'
import { LogoCloud } from '@/components/ui/logo-cloud-3'
import {
  HeroMediaSkeleton,
  PartnersSkeleton,
  PortfolioSlideSkeleton,
  PromoCardSkeleton,
  TestimonialSkeleton,
} from '@/components/ui/skeleton'
import { sortPortfolioNewestFirst } from '@/lib/portfolio'
import { getYouTubeId } from '@/lib/youtube'
import { getVideoEmbedUrl, getVideoType, getVideoThumbnail, isEmbeddable } from '@/lib/video'
import { PROMO_SECTION_ID } from '@/lib/promo-navigation'
import { useRestorePromoSection } from '@/hooks/useRestorePromoSection'



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
  'cat spray booth & repaint',
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
  videoUrl?: string
}

interface PromoItem {
  id: string
  badge: string
  title: string
  description: string
  imageUrl: string
  buttonText: string
  buttonUrl: string
  createdAt?: string | null
}

export default function Home() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [partnerLogos, setPartnerLogos] = useState<{ src: string; alt: string }[]>([])
  const [subtitleIndex, setSubtitleIndex] = useState(0)
  const [selectedImg, setSelectedImg] = useState<string | null>(null)
  const [portfolioImages, setPortfolioImages] = useState<Portfolio[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState<string>("")
  const [heroVideoUrl, setHeroVideoUrl] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const [promos, setPromos] = useState<PromoItem[]>([])
  const [fallbackPromo, setFallbackPromo] = useState<PromoItem | null>(null)
  const [loadingPromosCol, setLoadingPromosCol] = useState(true)
  const [loadingFallbackPromo, setLoadingFallbackPromo] = useState(true)
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const loadingPromos = loadingPromosCol || loadingFallbackPromo
  const homeVisible = useRestorePromoSection(!loadingPromos)

  const toggleMute = () => {
    if (!iframeRef.current) return
    const command = isMuted ? 'unMute' : 'mute'
    iframeRef.current.contentWindow?.postMessage(
      JSON.stringify({
        event: 'command',
        func: command,
        args: '',
      }),
      '*'
    )
    setIsMuted(!isMuted)
  }

  // Load hero video setting (Real-time)
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "hero"),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().videoUrl) {
          setHeroVideoUrl(docSnap.data().videoUrl)
        } else {
          setHeroVideoUrl("") // No video URL found, trigger fallback
        }
      },
      (error) => {
        console.error("Error fetching hero video:", error)
        setHeroVideoUrl("") // Error, trigger fallback
      }
    )
    return () => unsub()
  }, [])

  // Load promos collection (Real-time)
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "promos"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          badge: docSnap.data().badge || '',
          title: docSnap.data().title || '',
          description: docSnap.data().description || '',
          imageUrl: docSnap.data().imageUrl || '',
          buttonText: docSnap.data().buttonText || '',
          buttonUrl: docSnap.data().buttonUrl || '',
          createdAt: docSnap.data().createdAt || null,
        })) as PromoItem[]
        
        data.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return timeB - timeA
        })

        setPromos(data)
        setLoadingPromosCol(false)
      },
      (error) => {
        console.error("Error fetching promos collection:", error)
        setPromos([])
        setLoadingPromosCol(false)
      }
    )
    return () => unsub()
  }, [])

  // Load fallback promo setting (Real-time)
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "promo"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          setFallbackPromo({
            id: 'fallback-settings',
            badge: data.badge || 'Sertifikasi Global',
            title: data.title || 'Standar Dunia Kini Hadir Lebih Dekat! 🏆',
            description: data.description || '',
            imageUrl: data.imageUrl || '/promo-refinique.jpg',
            buttonText: data.buttonText || '',
            buttonUrl: data.buttonUrl || ''
          })
        }
        setLoadingFallbackPromo(false)
      },
      (error) => {
        console.error("Error fetching fallback promo:", error)
        setLoadingFallbackPromo(false)
      }
    )
    return () => unsub()
  }, [])
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
        setLoadingTestimonials(false)
      },
      (error) => {
        console.error("Error fetching testimonials:", error)
        setTestimonials([])
        setLoadingTestimonials(false)
      }
    )
    return () => unsub();
  }, []);

  // Load partner logos from Firestore
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "partners"),
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({
          src: docSnap.data().src || '',
          alt: docSnap.data().alt || '',
          createdAt: docSnap.data().createdAt || null,
        }))
        data.sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return timeB - timeA
        })
        setPartnerLogos(data)
        setLoadingPartners(false)
      },
      (error) => {
        console.error("Error fetching partners:", error)
        setPartnerLogos([])
        setLoadingPartners(false)
      }
    )
    return () => unsub()
  }, [])

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
    <div
      className={`bg-[#f8f9fa] text-gray-900 overflow-x-hidden min-h-screen ${
        homeVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
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
              <span className="text-red-600">HYPERMILE</span> <br />
              AUTO BODY <br />
              WORKS
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

          {/* Hero Video / Image */}
          <div className="relative w-full flex justify-center md:justify-end items-center mt-6 md:mt-0">
            <div className="relative w-full max-w-[500px] lg:max-w-[540px] aspect-video group">
              {/* Artisanal dotted border offset */}
              <div className="absolute -inset-3 border-2 border-dashed border-red-600/60 rounded-[32px] transition-all duration-500 group-hover:-inset-1.5" />
              
              {/* Media Container with solid borders */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-2 border-gray-900 shadow-2xl bg-black transition-transform duration-500">
                {heroVideoUrl === null ? (
                  <HeroMediaSkeleton />
                ) : getYouTubeId(heroVideoUrl) ? (
                  <>
                    <iframe
                      ref={iframeRef}
                      src={`https://www.youtube.com/embed/${getYouTubeId(heroVideoUrl)}?autoplay=1&mute=1&loop=1&playlist=${getYouTubeId(heroVideoUrl)}&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&enablejsapi=1`}
                      title="Hero Video"
                      allow="autoplay; encrypted-media"
                      className="absolute inset-0 w-full h-full border-0 pointer-events-none scale-105"
                    />
                    <button
                      onClick={toggleMute}
                      type="button"
                      aria-label={isMuted ? "Aktifkan suara" : "Matikan suara"}
                      className="absolute bottom-2 right-2 z-20 bg-black/50 hover:bg-red-600 backdrop-blur-sm border border-white/15 p-1.5 rounded-full text-white shadow-md hover:scale-110 active:scale-95 transition-all"
                    >
                      {isMuted ? (
                        <VolumeX className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-white" />
                      )}
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud Section */}
      <section className="section-full-width py-12 relative bg-[#f8f9fa] border-b border-gray-200/50">
        <div className="container mx-auto px-4 md:px-12 relative max-w-3xl">
          <h2 className="mb-5 text-center font-bold text-foreground text-xl tracking-tight md:text-2xl lg:text-3xl font-sans">
            <span className="text-muted-foreground font-normal">Dipercaya oleh</span>{" "}
            <span className="font-extrabold font-sporty text-gray-900">Brand & Partner Otomotif Terkemuka</span>
            <span className="text-red-600">.</span>
          </h2>
          <div className="mx-auto my-5 h-px max-w-sm bg-gray-200 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />

          {loadingPartners ? (
            <PartnersSkeleton />
          ) : (
            <LogoCloud logos={partnerLogos} />
          )}

          <div className="mt-5 h-px bg-gray-200 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="section-full-width py-12 relative bg-[#f8f9fa]">
        <div className="container mx-auto px-4 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div className="max-w-2xl text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-100/50 px-3.5 py-1.5 rounded-full font-sans inline-block">
                Galeri Portofolio
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold font-sporty tracking-tight mt-4 text-gray-900 leading-tight">
                Masterpiece Hypermile<span className="text-red-600">.</span>
              </h2>
              <p className="text-gray-600 text-sm md:text-base mt-4 leading-relaxed font-normal">
                Galeri hasil karya terbaik kami. Mulai dari pengerjaan body repair presisi, pengecatan menggunakan spray booth profesional, hingga detailing mendalam yang mengembalikan kilau sempurna mobil Anda.
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
            <PortfolioSlideSkeleton />
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
                {homePortfolio.map((img, index) => {
                  const hasVideo = !!(img.videoUrl && getVideoType(img.videoUrl))
                  const canEmbed = !!(img.videoUrl && isEmbeddable(img.videoUrl))
                  const autoThumb = (!img.url && img.videoUrl) ? getVideoThumbnail(img.videoUrl) : null
                  const displaySrc = img.url || autoThumb
                  return (
                  <SwiperSlide key={img.id}>
                    <div
                      className="cursor-pointer group relative aspect-[4/5] overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white"
                      onClick={() => {
                        if (canEmbed) {
                          setActiveVideoUrl(img.videoUrl!)
                        } else if (img.videoUrl) {
                          // TikTok: open in new tab for clean experience
                          window.open(img.videoUrl, '_blank', 'noopener,noreferrer')
                        } else {
                          setSelectedImg(img.url)
                        }
                      }}
                    >
                      <Image
                        src={displaySrc || img.url}
                        alt={img.title || 'Portfolio'}
                        fill
                        loading={index === 0 ? 'eager' : 'lazy'}
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 280px"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                        {img.title && (
                          <h4 className="text-white font-semibold text-base leading-tight">{img.title}</h4>
                        )}
                      </div>
                      {hasVideo && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="w-9 h-9 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-4 h-4 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </SwiperSlide>
                  )
                })}
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

        {/* Video Modal */}
        <AnimatePresence>
          {activeVideoUrl && (
            <motion.div
              className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideoUrl(null)}
            >
              <button
                type="button"
                onClick={() => setActiveVideoUrl(null)}
                aria-label="Tutup video"
                className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center shadow-lg transition z-10"
              >
                <span className="text-2xl font-bold select-none">×</span>
              </button>
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.85, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
              >
                {(() => {
                  const embedUrl = getVideoEmbedUrl(activeVideoUrl)
                  const type = getVideoType(activeVideoUrl)
                  if (!embedUrl) return (
                    <div className="flex items-center justify-center h-full text-white">URL Video tidak valid.</div>
                  )
                  return (
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title={`Video ${type ?? ''}`}
                    />
                  )
                })()}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Promo & News Section (PPG Refinique Certification) */}
      <section id={PROMO_SECTION_ID} className="section-full-width py-8 md:py-16 bg-[#f8f9fa] border-t border-gray-200/50 scroll-mt-24">
        <div className="container mx-auto px-4 md:px-12">
          {loadingPromos ? (
            <PromoCardSkeleton />
          ) : (() => {
            const activePromos = promos.length > 0
              ? promos
              : fallbackPromo
                ? [fallbackPromo]
                : []

            if (activePromos.length === 0) return null

            return (
              <Swiper
                key={activePromos.length}
                modules={[Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                loop={activePromos.length > 1}
                autoplay={activePromos.length > 1 ? { delay: 4000, disableOnInteraction: false } : false}
                pagination={activePromos.length > 1 ? { clickable: true } : false}
                className="promo-swiper !pb-8 md:!pb-12"
              >
                {activePromos.map((promo) => (
                  <SwiperSlide key={promo.id} className="!h-auto flex">
                    <Link
                      href={`/promo/${promo.id}`}
                      scroll
                      className="bg-zinc-950 text-white rounded-2xl md:rounded-3xl relative overflow-hidden p-4 sm:p-6 md:p-10 lg:p-12 border border-zinc-800 w-full h-full flex flex-col justify-center group/card transition-colors hover:border-zinc-600"
                    >
                      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center">
                        {promo.imageUrl && promo.imageUrl.trim() !== '' && promo.imageUrl.trim() !== '/' && (
                          <div className="lg:col-span-5 w-full flex justify-center">
                            <div className="relative w-full max-w-none sm:max-w-[280px] aspect-[16/9] sm:aspect-square lg:aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900">
                              <Image
                                src={promo.imageUrl}
                                alt={promo.title}
                                fill
                                sizes="(max-width: 640px) 100vw, 300px"
                                className="object-cover group-hover/card:scale-105 transition-transform duration-500"
                                unoptimized
                              />
                            </div>
                          </div>
                        )}
                        
                        <div className={promo.imageUrl ? "lg:col-span-7 flex flex-col items-start text-left" : "lg:col-span-12 flex flex-col items-center text-center mx-auto max-w-3xl"}>
                          {promo.badge && (
                            <span className="text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full font-sans mb-2 sm:mb-4 inline-block">
                              {promo.badge}
                            </span>
                          )}
                          
                          <h2 className="text-base sm:text-2xl lg:text-3xl font-extrabold mb-2 sm:mb-4 tracking-tight text-white leading-snug font-sporty">
                            {promo.title ? promo.title.replace(/\s+([^\s]+)$/, '\u00A0$1') : ''}
                          </h2>
                          
                          <p className="text-xs sm:text-base text-zinc-300 mb-3 sm:mb-6 leading-relaxed font-sans font-normal line-clamp-2 sm:line-clamp-3">
                            {promo.description}
                          </p>
                          
                          <span className="inline-flex items-center justify-center px-4 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm bg-red-600 group-hover/card:bg-red-700 text-white font-extrabold rounded-lg sm:rounded-xl shadow-xl transition-colors">
                            Baca selengkapnya
                          </span>
                        </div>
                      </div>
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>
            )
          })()}
        </div>
      </section>
      
      {/* Testimonials Section */}
      {loadingTestimonials ? (
        <section className="section-full-width relative bg-[#f8f9fa] no-scroll-y border-t border-gray-200">
          <TestimonialSkeleton />
        </section>
      ) : testimonials.length > 0 && (
        <section className="section-full-width py-24 text-center relative bg-[#f8f9fa] no-scroll-y border-t border-gray-200">
          <div className="container mx-auto px-4 mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-100/50 px-3.5 py-1.5 rounded-full font-sans inline-block">
              Testimoni Pelanggan
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-sporty tracking-tight mt-4 text-gray-900 leading-tight">
              Apa Kata Pemilik Kendaraan<span className="text-red-600">.</span>
            </h2>
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
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-100/50 px-3.5 py-1.5 rounded-full font-sans inline-block">
              Keunggulan Kami
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-sporty tracking-tight mt-4 text-gray-900 leading-tight">
              Mengapa Memilih Hypermile<span className="text-red-600">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Paintbrush className="h-6 w-6 text-red-600" />,
                title: "Fasilitas Spray Booth",
                desc: "Didukung fasilitas spray booth modern untuk hasil pengecatan yang bersih, merata, dan bebas debu.",
                bg: "bg-white shadow-sm"
              },
              {
                icon: <CheckCircle2 className="h-6 w-6 text-red-600" />,
                title: "Teknisi Berlisensi",
                desc: "Dikerjakan oleh teknisi berpengalaman dan bersertifikasi untuk memastikan kualitas pengerjaan terbaik.",
                bg: "bg-white shadow-sm"
              },
              {
                icon: <Sparkles className="h-6 w-6 text-red-600" />,
                title: "Bahan Premium",
                desc: "Menggunakan cat dan material berkualitas tinggi untuk hasil yang kuat, tahan lama, dan sesuai standar.",
                bg: "bg-white shadow-sm"
              },
              {
                icon: <Shield className="h-6 w-6 text-red-600" />,
                title: "Garansi 1 Tahun",
                desc: "Garansi hingga 1 tahun untuk layanan body repair dan body repaint sebagai jaminan kualitas pekerjaan.",
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
                <h4 className="text-lg font-bold mb-2 text-gray-900">{item.title}</h4>
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
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-100/50 px-3.5 py-1.5 rounded-full font-sans inline-block">
              FAQ
            </span>
            <h2 className="text-3xl md:text-5xl font-extrabold font-sporty tracking-tight mt-4 text-gray-900 leading-tight">
              Pertanyaan Umum<span className="text-red-600">.</span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {[
              {
                q: "Berapa lama pengerjaan cat per panel mobil?",
                a: "Untuk perbaikan ringan per panel (seperti bemper baret atau pintu penyok ringan), biasanya membutuhkan waktu 1 hingga 2 hari kerja. Ini sudah mencakup seluruh proses mulai dari pembersihan, pendempulan, epoxy dasar, pengecatan warna, pernis, hingga pengovenan."
              },
              {
                q: "Apa perbedaan Nano Coating dengan poles biasa?",
                a: "Poles biasa hanya memotong permukaan pernis untuk menghilangkan baret halus dan sifatnya sementara. Sedangkan Nano Ceramic Coating memberikan lapisan pelindung tambahan (kaca keras) di atas cat yang melindungi dari sinar matahari (UV), hujan asam, jamur, serta efek daun talas yang tahan lama."
              },
              {
                q: "Apakah workshop Hypermile melayani klaim asuransi?",
                a: "Saat ini kami fokus melayani perbaikan umum non-asuransi (pribadi), restorasi total, dan modifikasi bodi. Untuk informasi kemitraan asuransi tertentu, silakan langsung diskusikan dengan tim kami via WhatsApp."
              }
            ].map((faq, idx) => (
              <div key={idx} className="p-6 bg-white shadow-sm rounded-2xl border border-gray-200">
                <h4 className="font-bold text-gray-900 text-base md:text-lg mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="section-full-width py-20 bg-[#f8f9fa] text-center px-4 border-t border-gray-200">
        <span className="text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-100/50 px-3.5 py-1.5 rounded-full font-sans inline-block">
          Newsletter
        </span>
        <h2 className="text-3xl md:text-5xl font-extrabold font-sporty tracking-tight mt-4 mb-4 text-gray-900 leading-tight">
          Gabung ke Newsletter Kami<span className="text-red-600">.</span>
        </h2>
        <p className="mb-8 text-gray-600 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
          Dapatkan tips berkala merawat cat mobil agar tetap mengkilap, info promo khusus bulanan, dan update terbaru langsung ke inbox Anda.
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
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl transition-all duration-300 text-sm shadow-md shadow-red-600/10"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  )
}