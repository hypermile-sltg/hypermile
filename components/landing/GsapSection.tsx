'use client'

import { useRef } from 'react'
import { SectionBackdrop } from './SectionBackdrop'
import { useGsapReveal } from '@/hooks/useGsapReveal'

interface GsapSectionHeaderProps {
  badge: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
}

export function GsapSectionHeader({
  badge,
  title,
  description,
  align = 'center',
}: GsapSectionHeaderProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGsapReveal(ref, '.gsap-section-item', {
    stagger: 0.1,
    variant: 'blur',
  })

  const alignClass = align === 'left' ? 'text-left' : 'text-center mx-auto'

  return (
    <div ref={ref} className={`max-w-2xl mb-12 ${alignClass}`}>
      <span className="gsap-section-item text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-100/50 px-3.5 py-1.5 rounded-full font-sans inline-block">
        {badge}
      </span>
      <h2 className="gsap-section-item text-3xl md:text-5xl font-extrabold font-sporty tracking-tight mt-4 text-gray-900 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="gsap-section-item text-gray-600 text-sm md:text-base mt-4 leading-relaxed font-normal">
          {description}
        </p>
      )}
    </div>
  )
}

interface GsapSectionProps {
  children: React.ReactNode
  backdrop?: 'mesh' | 'grid' | 'carbon' | 'spotlight' | 'dark' | 'hero'
  className?: string
  revealSelector?: string
  revealVariant?: 'fadeUp' | 'fadeLeft' | 'scale'
}

export function GsapSection({
  children,
  backdrop = 'mesh',
  className = '',
  revealSelector,
  revealVariant = 'fadeUp',
}: GsapSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGsapReveal(contentRef, revealSelector ?? '.gsap-reveal', {
    trigger: sectionRef,
    stagger: 0.1,
    variant: revealVariant,
  })

  return (
    <section
      ref={sectionRef}
      className={`section-full-width py-16 md:py-24 relative overflow-hidden border-t border-gray-200/50 ${className}`}
    >
      <SectionBackdrop variant={backdrop} />
      <div className="absolute inset-0 landing-noise opacity-20 pointer-events-none" aria-hidden="true" />
      <div ref={contentRef} className="container mx-auto px-4 md:px-12 relative z-10">
        {children}
      </div>
    </section>
  )
}
