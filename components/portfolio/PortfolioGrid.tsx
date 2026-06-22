'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export type PortfolioItem = {
  id: string
  title?: string
  url: string
}

type PortfolioGridProps = {
  items: PortfolioItem[]
  limit?: number
}

export function PortfolioGrid({ items, limit }: PortfolioGridProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const displayItems = limit ? items.slice(0, limit) : items

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedUrl(null)
    }
    if (selectedUrl) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedUrl])

  if (displayItems.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
        Belum ada foto portfolio.
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {displayItems.map((img, index) => (
          <button
            key={img.id}
            type="button"
            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white text-left"
            onClick={() => setSelectedUrl(img.url)}
          >
            <Image
              src={img.url}
              alt={img.title || 'Portfolio'}
              fill
              loading={index < 3 ? 'eager' : 'lazy'}
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-5">
              {img.title && (
                <h4 className="text-white font-extrabold text-sm md:text-base leading-tight mb-1">
                  {img.title}
                </h4>
              )}
              <span className="text-xs text-red-400 font-bold font-sans">Klik untuk Perbesar</span>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedUrl && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUrl(null)}
          >
            <button
              type="button"
              onClick={() => setSelectedUrl(null)}
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
                src={selectedUrl}
                alt="Preview portfolio"
                fill
                className="rounded-xl shadow-2xl object-contain"
                sizes="(max-width: 768px) 95vw, 1200px"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
