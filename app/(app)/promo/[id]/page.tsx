'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { ExternalLink } from 'lucide-react'
import { db } from '@/lib/firebase'
import { PromoDetailSkeleton } from '@/components/ui/skeleton'
import { BackToPromoLink } from '@/components/promo/BackToPromoLink'

type PromoItem = {
  id: string
  badge: string
  title: string
  description: string
  imageUrl: string
  buttonText: string
  buttonUrl: string
  createdAt?: string | null
}

function formatDate(value?: string | null) {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

function mapPromoDoc(id: string, data: Record<string, unknown>): PromoItem {
  return {
    id,
    badge: (data.badge as string) || '',
    title: (data.title as string) || '',
    description: (data.description as string) || '',
    imageUrl: (data.imageUrl as string) || '',
    buttonText: (data.buttonText as string) || '',
    buttonUrl: (data.buttonUrl as string) || '',
    createdAt: (data.createdAt as string) || null,
  }
}

export default function PromoDetailPage() {
  const params = useParams()
  const id = typeof params?.id === 'string' ? params.id : ''
  const [promo, setPromo] = useState<PromoItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id, loading])

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        if (id === 'fallback-settings') {
          const snap = await getDoc(doc(db, 'settings', 'promo'))
          if (!snap.exists()) {
            if (!cancelled) setNotFound(true)
            return
          }
          const data = snap.data()
          if (!cancelled) {
            setPromo(
              mapPromoDoc('fallback-settings', {
                badge: data.badge || 'Sertifikasi Global',
                title: data.title || 'Standar Dunia Kini Hadir Lebih Dekat!',
                description: data.description || '',
                imageUrl: data.imageUrl || '/promo-refinique.jpg',
                buttonText: data.buttonText || '',
                buttonUrl: data.buttonUrl || '',
              })
            )
          }
          return
        }

        const snap = await getDoc(doc(db, 'promos', id))
        if (!snap.exists()) {
          if (!cancelled) setNotFound(true)
          return
        }
        if (!cancelled) setPromo(mapPromoDoc(snap.id, snap.data()))
      } catch (error) {
        console.error('Error loading promo:', error)
        if (!cancelled) setNotFound(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <PromoDetailSkeleton />

  if (notFound || !promo) {
    return (
      <div className="bg-[#f8f9fa] min-h-[70vh] flex flex-col items-center justify-center gap-4 px-4 text-center pt-20 md:pt-16">
        <p className="text-gray-600">Artikel promo tidak ditemukan.</p>
        <BackToPromoLink />
      </div>
    )
  }

  const published = formatDate(promo.createdAt)
  const hasImage = !!promo.imageUrl?.trim() && promo.imageUrl.trim() !== '/'

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24">
      <article className="container mx-auto px-4 md:px-12 max-w-3xl pt-20 md:pt-16 pb-8">
        <BackToPromoLink withIcon className="mb-5" />

        <header className="mb-8 md:mb-10">
          {promo.badge && (
            <span className="inline-block text-[10px] sm:text-xs uppercase font-extrabold tracking-widest text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full mb-4">
              {promo.badge}
            </span>
          )}

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            {promo.title}
          </h1>

          {published && (
            <p className="text-sm text-gray-500">Dipublikasikan {published}</p>
          )}
        </header>

        {hasImage && (
          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-gray-200 shadow-sm mb-8 md:mb-10 bg-zinc-900">
            <Image
              src={promo.imageUrl}
              alt={promo.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              unoptimized
            />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5 sm:p-8 md:p-10">
          <div className="text-base sm:text-lg text-gray-700 leading-[1.8] whitespace-pre-line">
            {promo.description}
          </div>

          {promo.buttonText && promo.buttonUrl && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <a
                href={promo.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-lg transition-colors"
              >
                {promo.buttonText}
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </article>
    </div>
  )
}
