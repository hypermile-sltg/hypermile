'use client'

import { useLayoutEffect, type RefObject } from 'react'
import { gsap, registerGsap } from '@/lib/gsap/register'

interface UseGsapCounterOptions {
  value: number
  suffix?: string
  decimals?: number
  duration?: number
}

export function useGsapCounter(
  ref: RefObject<HTMLElement | null>,
  { value, suffix = '', decimals, duration = 1.8 }: UseGsapCounterOptions
) {
  useLayoutEffect(() => {
    registerGsap()
    const el = ref.current
    if (!el) return

    const isDecimal = decimals !== undefined || value % 1 !== 0
    const precision = decimals ?? (isDecimal ? 1 : 0)
    const proxy = { val: 0 }

    const ctx = gsap.context(() => {
      gsap.to(proxy, {
        val: value,
        duration,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play reverse play reverse',
        },
        onUpdate: () => {
          el.textContent = `${proxy.val.toFixed(precision)}${suffix}`
        },
      })
    }, el)

    return () => ctx.revert()
  }, [ref, value, suffix, decimals, duration])
}
