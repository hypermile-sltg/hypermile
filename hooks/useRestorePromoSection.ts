'use client'

import { useLayoutEffect, useState } from 'react'
import {
  clearReturnToPromoSection,
  clearStalePromoHash,
  scrollToPromoSection,
  shouldReturnToPromoSection,
} from '@/lib/promo-navigation'

/**
 * Saat kembali dari detail promo: sembunyikan home dulu, scroll ke #promo,
 * baru tampilkan — menghindari flash hero / loncat ke atas oleh Next.js.
 */
export function useRestorePromoSection(sectionReady: boolean) {
  const [visible, setVisible] = useState(() => !shouldReturnToPromoSection())

  useLayoutEffect(() => {
    if (clearStalePromoHash()) {
      setVisible(true)
    }
  }, [])

  useLayoutEffect(() => {
    if (!shouldReturnToPromoSection() || !sectionReady) return

    scrollToPromoSection()
    clearReturnToPromoSection()

    const retryIds = [0, 50].map((delay) =>
      window.setTimeout(() => {
        scrollToPromoSection()
        if (delay === 50) setVisible(true)
      }, delay)
    )

    return () => {
      retryIds.forEach(window.clearTimeout)
    }
  }, [sectionReady])

  return visible
}
