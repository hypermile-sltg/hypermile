'use client'

import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { PortfolioGrid, type PortfolioItem } from '@/components/portfolio/PortfolioGrid'
import { AdminPagination, paginateList } from '@/components/admin/AdminPagination'
import { sortPortfolioNewestFirst } from '@/lib/portfolio'

const GALLERY_PAGE_SIZE = 9

export default function GalleryPage() {
  const [portfolioImages, setPortfolioImages] = useState<PortfolioItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    setIsLoading(true)
    const unsub = onSnapshot(
      collection(db, 'portfolio'),
      (snapshot) => {
        const data = sortPortfolioNewestFirst(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as PortfolioItem[]
        )
        setPortfolioImages(data)
        setIsLoading(false)
      },
      (error) => {
        console.error('Error fetching portfolio:', error)
        setPortfolioImages([])
        setIsLoading(false)
      }
    )
    return () => unsub()
  }, [])

  const { items: paginatedItems, totalPages } = paginateList(
    portfolioImages,
    page,
    GALLERY_PAGE_SIZE
  )

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-16">
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-12">
          <div className="max-w-2xl mb-10 md:mb-12">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">
              Galeri Portofolio
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-2 text-gray-900">
              Hasil Kerja Kami
            </h1>
            <p className="text-gray-600 text-sm mt-3 leading-relaxed">
              Kompilasi foto mobil klien yang telah selesai melewati proses detailing, poles, cat
              oven, maupun modifikasi bodi di workshop kami.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600" />
            </div>
          ) : (
            <div className="space-y-8">
              <PortfolioGrid items={paginatedItems} />
              <AdminPagination
                totalItems={portfolioImages.length}
                page={page}
                onPageChange={setPage}
                pageSize={GALLERY_PAGE_SIZE}
                label="foto"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
