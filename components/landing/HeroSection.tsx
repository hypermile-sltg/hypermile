'use client'

import { useLayoutEffect, useRef } from 'react'
import { gsap, registerGsap } from '@/lib/gsap/register'
import { SectionBackdrop, FloatingOrbs } from './SectionBackdrop'

const subtitles = [
  'body repair & dempul',
  'cat spray booth & repaint',
  'detailing & coating',
]

interface HeroSectionProps {
  children: React.ReactNode
  subtitleRef: React.RefObject<HTMLSpanElement>
}

export function HeroSection({ children, subtitleRef }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    registerGsap()
    const section = sectionRef.current
    if (!section) return

    let interval: ReturnType<typeof setInterval> | undefined

    const ctx = gsap.context(() => {
      gsap.fromTo(
        section.querySelectorAll('.gsap-hero-item'),
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.12,
          ease: 'power3.out',
          delay: 0.15,
        }
      )

      const subtitleEl = subtitleRef.current
      if (subtitleEl) {
        let index = 0
        const rotate = () => {
          index = (index + 1) % subtitles.length
          gsap.to(subtitleEl, {
            opacity: 0,
            y: -8,
            duration: 0.35,
            ease: 'power2.in',
            onComplete: () => {
              if (subtitleEl) subtitleEl.textContent = subtitles[index]
              gsap.fromTo(
                subtitleEl,
                { opacity: 0, y: 8 },
                { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }
              )
            },
          })
        }
        interval = setInterval(rotate, 4500)
      }

      const orb1 = section.querySelector('.landing-orb-1')
      const orb2 = section.querySelector('.landing-orb-2')
      if (orb1) {
        gsap.to(orb1, {
          y: -80,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      }
      if (orb2) {
        gsap.to(orb2, {
          y: -120,
          x: 40,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
      }
    }, section)

    return () => {
      if (interval) clearInterval(interval)
      ctx.revert()
    }
  }, [subtitleRef])

  return (
    <section
      ref={sectionRef}
      className="section-full-width relative flex items-center min-h-[calc(100svh-5rem)] md:min-h-[calc(100svh-6rem)] py-4 sm:py-6 overflow-hidden"
    >
      <SectionBackdrop variant="hero" />
      <FloatingOrbs />
      <div className="absolute inset-0 landing-noise opacity-[0.35]" aria-hidden="true" />
      <div className="container mx-auto px-4 md:px-12 w-full relative z-10">
        {children}
      </div>
    </section>
  )
}

export function HeroSubtitle({ subtitleRef }: { subtitleRef: React.RefObject<HTMLSpanElement> }) {
  return (
    <span ref={subtitleRef} className="absolute left-0 top-0 whitespace-nowrap">
      {subtitles[0]}
    </span>
  )
}
