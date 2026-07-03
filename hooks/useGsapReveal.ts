'use client'

import { useLayoutEffect, type RefObject } from 'react'
import { gsap, registerGsap } from '@/lib/gsap/register'

type RevealVariant = 'fadeUp' | 'fadeDown' | 'fadeLeft' | 'fadeRight' | 'scale' | 'blur'

interface UseGsapRevealOptions {
  trigger?: RefObject<HTMLElement | null>
  stagger?: number
  delay?: number
  duration?: number
  variant?: RevealVariant
  /** Replays on scroll up & down — default true */
  bidirectional?: boolean
  start?: string
  end?: string
  scrub?: boolean | number
  once?: boolean
}

const variantFrom: Record<RevealVariant, gsap.TweenVars> = {
  fadeUp: { opacity: 0, y: 56 },
  fadeDown: { opacity: 0, y: -56 },
  fadeLeft: { opacity: 0, x: -56 },
  fadeRight: { opacity: 0, x: 56 },
  scale: { opacity: 0, scale: 0.88 },
  blur: { opacity: 0, y: 32, filter: 'blur(12px)' },
}

const variantTo: Record<RevealVariant, gsap.TweenVars> = {
  fadeUp: { opacity: 1, y: 0 },
  fadeDown: { opacity: 1, y: 0 },
  fadeLeft: { opacity: 1, x: 0 },
  fadeRight: { opacity: 1, x: 0 },
  scale: { opacity: 1, scale: 1 },
  blur: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

export function useGsapReveal(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  options: UseGsapRevealOptions = {}
) {
  const {
    trigger,
    stagger = 0.12,
    delay = 0,
    duration = 0.85,
    variant = 'fadeUp',
    bidirectional = true,
    start = 'top 88%',
    end = 'top 15%',
    scrub = false,
    once = false,
  } = options

  useLayoutEffect(() => {
    registerGsap()
    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll(selector)
    if (!elements.length) return

    const ctx = gsap.context(() => {
      const toggleActions = bidirectional && !scrub && !once
        ? 'play reverse play reverse'
        : once
          ? 'play none none none'
          : 'play none none reverse'

      gsap.fromTo(
        elements,
        variantFrom[variant],
        {
          ...variantTo[variant],
          duration: scrub ? 1 : duration,
          delay,
          stagger,
          ease: scrub ? 'none' : 'power3.out',
          scrollTrigger: {
            trigger: trigger?.current ?? container,
            start,
            end,
            scrub,
            toggleActions,
            invalidateOnRefresh: true,
          },
        }
      )
    }, container)

    return () => ctx.revert()
  }, [
    containerRef,
    trigger,
    selector,
    stagger,
    delay,
    duration,
    variant,
    bidirectional,
    start,
    end,
    scrub,
    once,
  ])
}
