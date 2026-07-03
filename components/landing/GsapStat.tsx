'use client'

import { useRef } from 'react'
import { useGsapCounter } from '@/hooks/useGsapCounter'

interface GsapStatProps {
  value: number
  suffix?: string
  decimals?: number
  className?: string
}

export function GsapStat({ value, suffix = '', decimals, className }: GsapStatProps) {
  const ref = useRef<HTMLSpanElement>(null)
  useGsapCounter(ref, { value, suffix, decimals })

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  )
}
