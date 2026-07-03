'use client'

import { cn } from '@/lib/utils'

type BackdropVariant = 'hero' | 'mesh' | 'dark' | 'grid' | 'carbon' | 'spotlight'

interface SectionBackdropProps {
  variant?: BackdropVariant
  className?: string
  children?: React.ReactNode
}

const variantStyles: Record<BackdropVariant, string> = {
  hero: 'landing-bg-hero',
  mesh: 'landing-bg-mesh',
  dark: 'landing-bg-dark',
  grid: 'landing-bg-grid',
  carbon: 'landing-bg-carbon',
  spotlight: 'landing-bg-spotlight',
}

export function SectionBackdrop({
  variant = 'mesh',
  className,
  children,
}: SectionBackdropProps) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)}>
      <div className={cn('absolute inset-0', variantStyles[variant])} aria-hidden="true" />
      {children}
    </div>
  )
}

export function FloatingOrbs({ className }: { className?: string }) {
  return (
    <div className={cn('absolute inset-0 overflow-hidden pointer-events-none', className)} aria-hidden="true">
      <div className="landing-orb landing-orb-1" />
      <div className="landing-orb landing-orb-2" />
      <div className="landing-orb landing-orb-3" />
    </div>
  )
}

export function GsapParallaxLayer({
  className,
  speed = 0.3,
  children,
}: {
  className?: string
  speed?: number
  children: React.ReactNode
}) {
  return (
    <div
      className={cn('gsap-parallax-layer', className)}
      data-parallax-speed={speed}
    >
      {children}
    </div>
  )
}
