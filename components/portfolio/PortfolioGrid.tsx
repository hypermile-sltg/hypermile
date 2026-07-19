'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getVideoType, getVideoEmbedUrl, getVideoThumbnail, isEmbeddable } from '@/lib/video'

export type PortfolioItem = {
  id: string
  title?: string
  url: string
  videoUrl?: string
}

type PortfolioGridProps = {
  items: PortfolioItem[]
  limit?: number
}

export function PortfolioGrid({ items, limit }: PortfolioGridProps) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null)
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const displayItems = limit ? items.slice(0, limit) : items

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const isOpen = !!(selectedUrl || activeVideoUrl)
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedUrl(null)
        setActiveVideoUrl(null)
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [selectedUrl, activeVideoUrl])

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
        {displayItems.map((img, index) => {
          const hasVideo = !!(img.videoUrl && getVideoType(img.videoUrl))
          const canEmbed = !!(img.videoUrl && isEmbeddable(img.videoUrl))
          const autoThumb = (!img.url && img.videoUrl) ? getVideoThumbnail(img.videoUrl) : null
          const displaySrc = img.url || autoThumb

          return (
            <button
              key={img.id}
              type="button"
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-gray-200 shadow-md bg-white text-left"
              onClick={() => {
                if (canEmbed) {
                  setActiveVideoUrl(img.videoUrl!)
                } else if (img.videoUrl) {
                  window.open(img.videoUrl, '_blank', 'noopener,noreferrer')
                } else {
                  setSelectedUrl(img.url)
                }
              }}
            >
              {displaySrc && (
                <Image
                  src={displaySrc}
                  alt={img.title || 'Portfolio'}
                  fill
                  loading={index < 3 ? 'eager' : 'lazy'}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 md:p-5">
                {img.title && (
                  <h4 className="text-white font-semibold text-sm md:text-base leading-tight">
                    {img.title}
                  </h4>
                )}
              </div>
              {hasVideo && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="w-9 h-9 rounded-full bg-white/90 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-4 h-4 text-red-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {mounted &&
        createPortal(
          <>
            {/* Photo Lightbox */}
            <AnimatePresence>
              {selectedUrl && (
                <motion.div
                  className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4"
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

            {/* Video Modal */}
            <AnimatePresence>
              {activeVideoUrl && (
                <motion.div
                  className="fixed inset-0 bg-black/95 flex items-center justify-center z-[200] p-4"
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
          </>,
          document.body
        )}
    </>
  )
}
