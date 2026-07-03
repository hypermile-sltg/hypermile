'use client'

import { useRef } from 'react'
import { Paintbrush, CheckCircle2, Sparkles, Shield } from 'lucide-react'
import { SectionBackdrop, FloatingOrbs } from './SectionBackdrop'
import { useGsapReveal } from '@/hooks/useGsapReveal'

const features = [
  {
    icon: Paintbrush,
    title: 'Fasilitas Spray Booth',
    desc: 'Didukung fasilitas spray booth modern untuk hasil pengecatan yang bersih, merata, dan bebas debu.',
  },
  {
    icon: CheckCircle2,
    title: 'Teknisi Berlisensi',
    desc: 'Dikerjakan oleh teknisi berpengalaman dan bersertifikasi untuk memastikan kualitas pengerjaan terbaik.',
  },
  {
    icon: Sparkles,
    title: 'Bahan Premium',
    desc: 'Menggunakan cat dan material berkualitas tinggi untuk hasil yang kuat, tahan lama, dan sesuai standar.',
  },
  {
    icon: Shield,
    title: 'Garansi 1 Tahun',
    desc: 'Garansi hingga 1 tahun untuk layanan body repair dan body repaint sebagai jaminan kualitas pekerjaan.',
  },
]

export function WhyChooseSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useGsapReveal(headerRef, '.gsap-reveal-header', {
    trigger: sectionRef,
    stagger: 0.1,
    variant: 'blur',
  })

  useGsapReveal(gridRef, '.gsap-reveal-card', {
    trigger: sectionRef,
    stagger: 0.14,
    variant: 'fadeUp',
    start: 'top 82%',
  })

  return (
    <section
      ref={sectionRef}
      className="section-full-width py-24 relative overflow-hidden border-t border-gray-200/60"
    >
      <SectionBackdrop variant="spotlight" />
      <FloatingOrbs />

      <div className="container mx-auto px-4 md:px-12 relative z-10">
        <div ref={headerRef} className="text-center max-w-2xl mx-auto mb-16">
          <span className="gsap-reveal-header text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-100/50 px-3.5 py-1.5 rounded-full font-sans inline-block">
            Keunggulan Kami
          </span>
          <h2 className="gsap-reveal-header text-3xl md:text-5xl font-extrabold font-sporty tracking-tight mt-4 text-gray-900 leading-tight">
            Mengapa Memilih Hypermile<span className="text-red-600">.</span>
          </h2>
        </div>

        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon
            return (
              <div
                key={idx}
                className="gsap-reveal-card group relative p-6 rounded-2xl border border-gray-200/80 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-xl hover:border-red-500/30 transition-shadow duration-500"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/0 via-transparent to-red-600/0 group-hover:from-red-500/5 group-hover:to-red-600/10 transition-all duration-500 pointer-events-none" />
                <div className="relative">
                  <div className="p-3 w-fit rounded-xl bg-red-50 mb-4 ring-1 ring-red-100 group-hover:ring-red-200 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 text-red-600" />
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-gray-900">{item.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
