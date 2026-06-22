'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { adminFirestoreWrite } from '@/lib/admin-firestore-client'
import { AdminPagination, paginateList } from '@/components/admin/AdminPagination'
import { collection, getDocs } from 'firebase/firestore'
import { Loader2, Edit2, Check, Trash2, User, Plus } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { confirmAction } from '@/lib/confirm-toast'
import { sortPortfolioNewestFirst } from '@/lib/portfolio'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Testimonial = {
  id: string
  message: string
  name: string
  role: string
  photo: string
  rating: number | null
}

type PortfolioItem = {
  id: string
  url: string
  title?: string
  createdAt?: string | null
}

const emptyPortfolio = { url: '', title: '' }

const emptyTestimonial = {
  message: '',
  name: '',
  role: '',
  photo: '',
  rating: 5 as number | null,
}

export default function EditLayoutPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState(emptyPortfolio)
  const [portfolioEditId, setPortfolioEditId] = useState<string | null>(null)

  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false)
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial)
  const [testimonialEditId, setTestimonialEditId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'testimonials'>('portfolio')
  const [portfolioPage, setPortfolioPage] = useState(1)
  const [testimonialsPage, setTestimonialsPage] = useState(1)

  const fetchPortfolio = async () => {
    setLoadingPortfolio(true)
    try {
      const snapshot = await getDocs(collection(db, 'portfolio'))
      setPortfolio(
        sortPortfolioNewestFirst(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            url: docSnap.data().url || '',
            title: docSnap.data().title || '',
            createdAt: docSnap.data().createdAt || null,
          }))
        )
      )
    } catch (error) {
      console.error('Error fetching portfolio:', error)
      toast.error('Gagal memuat portfolio!')
    }
    setLoadingPortfolio(false)
  }

  const fetchTestimonials = async () => {
    setLoadingTestimonials(true)
    try {
      const snapshot = await getDocs(collection(db, 'testimonials'))
      setTestimonials(
        snapshot.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            message: data.message || '',
            name: data.name || '',
            role: data.role || '',
            photo: data.photo || '',
            rating: data.rating || 5,
          }
        })
      )
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Gagal memuat testimonial!')
    }
    setLoadingTestimonials(false)
  }

  useEffect(() => {
    fetchPortfolio()
    fetchTestimonials()
  }, [])

  useEffect(() => {
    const { totalPages } = paginateList(portfolio, portfolioPage)
    if (portfolioPage > totalPages) setPortfolioPage(totalPages)
  }, [portfolio.length, portfolioPage])

  useEffect(() => {
    const { totalPages } = paginateList(testimonials, testimonialsPage)
    if (testimonialsPage > totalPages) setTestimonialsPage(totalPages)
  }, [testimonials.length, testimonialsPage])

  const paginatedPortfolio = paginateList(portfolio, portfolioPage)
  const paginatedTestimonials = paginateList(testimonials, testimonialsPage)

  const openAddPortfolio = () => {
    setPortfolioForm(emptyPortfolio)
    setPortfolioEditId(null)
    setPortfolioDialogOpen(true)
  }

  const openEditPortfolio = (item: PortfolioItem) => {
    setPortfolioForm({ url: item.url, title: item.title || '' })
    setPortfolioEditId(item.id)
    setPortfolioDialogOpen(true)
  }

  const openAddTestimonial = () => {
    setTestimonialForm(emptyTestimonial)
    setTestimonialEditId(null)
    setTestimonialDialogOpen(true)
  }

  const openEditTestimonial = (testi: Testimonial) => {
    setTestimonialForm({
      message: testi.message,
      name: testi.name,
      role: testi.role,
      photo: testi.photo,
      rating: testi.rating,
    })
    setTestimonialEditId(testi.id)
    setTestimonialDialogOpen(true)
  }

  const handleSavePortfolio = async () => {
    if (!portfolioForm.url.trim()) {
      toast.error('URL foto wajib diisi!')
      return
    }
    if (isSaving) return
    setIsSaving(true)

    try {
      const data = {
        url: portfolioForm.url.trim(),
        title: portfolioForm.title?.trim() || '',
      }

      if (portfolioEditId) {
        await adminFirestoreWrite({
          collection: 'portfolio',
          action: 'update',
          id: portfolioEditId,
          data,
        })
        toast.success('Portfolio berhasil diperbarui!')
      } else {
        await adminFirestoreWrite({
          collection: 'portfolio',
          action: 'create',
          data: { ...data, createdAt: new Date().toISOString() },
        })
        toast.success('Portfolio berhasil ditambahkan!')
      }

      setPortfolioDialogOpen(false)
      await fetchPortfolio()
    } catch (error) {
      console.error(error)
      toast.error(portfolioEditId ? 'Gagal menyimpan portfolio!' : 'Gagal menambahkan portfolio!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePortfolio = (id: string) => {
    const item = portfolio.find((p) => p.id === id)
    confirmAction(`Hapus portfolio "${item?.title || 'Untitled'}"?`, async () => {
      try {
        await adminFirestoreWrite({ collection: 'portfolio', action: 'delete', id })
        toast.success('Portfolio berhasil dihapus!')
        await fetchPortfolio()
      } catch (error) {
        console.error(error)
        toast.error('Gagal menghapus portfolio!')
      }
    })
  }

  const handleSaveTestimonial = async () => {
    const { message, name, role, photo, rating } = testimonialForm
    if (!message.trim() || !name.trim() || !role.trim() || !rating) {
      toast.error('Message, nama, role, dan rating wajib diisi!')
      return
    }
    if (isSaving) return
    setIsSaving(true)

    try {
      const data = {
        message: message.trim(),
        name: name.trim(),
        role: role.trim(),
        photo: photo.trim(),
        rating: Number(rating),
      }

      if (testimonialEditId) {
        await adminFirestoreWrite({
          collection: 'testimonials',
          action: 'update',
          id: testimonialEditId,
          data,
        })
        toast.success('Testimonial berhasil diperbarui!')
      } else {
        await adminFirestoreWrite({
          collection: 'testimonials',
          action: 'create',
          data,
        })
        toast.success('Testimonial berhasil ditambahkan!')
      }

      setTestimonialDialogOpen(false)
      await fetchTestimonials()
    } catch (error) {
      console.error(error)
      toast.error(testimonialEditId ? 'Gagal menyimpan testimonial!' : 'Gagal menambahkan testimonial!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTestimonial = (id: string) => {
    const testi = testimonials.find((t) => t.id === id)
    confirmAction(`Hapus testimonial dari "${testi?.name || 'Unknown'}"?`, async () => {
      try {
        await adminFirestoreWrite({ collection: 'testimonials', action: 'delete', id })
        toast.success('Testimonial berhasil dihapus!')
        await fetchTestimonials()
      } catch (error) {
        console.error(error)
        toast.error('Gagal menghapus testimonial!')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Manage Home</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {(
              [
                { key: 'portfolio', label: `🖼 Portfolio (${portfolio.length})` },
                { key: 'testimonials', label: `💬 Testimonial (${testimonials.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* PORTFOLIO TAB */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddPortfolio} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Portfolio
              </Button>
            </div>

            {loadingPortfolio ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : portfolio.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                Belum ada portfolio. Klik &quot;Tambah Portfolio&quot; untuk mulai.
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedPortfolio.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    {item.url && (
                      <div className="w-full h-40 relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          unoptimized
                          src={item.url}
                          alt={item.title || 'Portfolio'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h4 className="font-bold text-gray-900 mb-1">{item.title || 'Tanpa judul'}</h4>
                    <p className="text-xs text-gray-500 truncate mb-4">{item.url}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditPortfolio(item)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePortfolio(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <AdminPagination
                totalItems={portfolio.length}
                page={portfolioPage}
                onPageChange={setPortfolioPage}
                label="portfolio"
              />
              </>
            )}
          </div>
        )}

        {/* TESTIMONIALS TAB */}
        {activeTab === 'testimonials' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddTestimonial} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Testimonial
              </Button>
            </div>

            {loadingTestimonials ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : testimonials.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                Belum ada testimonial. Klik &quot;Tambah Testimonial&quot; untuk mulai.
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedTestimonials.items.map((testi) => (
                  <div key={testi.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      {testi.photo ? (
                        <div className="w-12 h-12 relative rounded-full overflow-hidden border border-gray-200 shrink-0">
                          <Image unoptimized src={testi.photo} alt={testi.name} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0">
                          <User className="text-gray-500" size={24} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900">{testi.name}</h4>
                        <p className="text-sm text-gray-500">{testi.role}</p>
                        <div className="flex mt-1">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="text-yellow-400 text-sm">
                              {i < (testi.rating || 0) ? '★' : '☆'}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200 mb-4 line-clamp-3">
                      {testi.message}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditTestimonial(testi)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTestimonial(testi.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <AdminPagination
                totalItems={testimonials.length}
                page={testimonialsPage}
                onPageChange={setTestimonialsPage}
                label="testimonial"
              />
              </>
            )}
          </div>
        )}

      {/* Portfolio Dialog */}
      <Dialog open={portfolioDialogOpen} onOpenChange={setPortfolioDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{portfolioEditId ? 'Edit Portfolio' : 'Tambah Portfolio Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">URL Foto*</label>
              <Input
                value={portfolioForm.url}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, url: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
              {portfolioForm.url && (
                <div className="w-full h-36 relative mt-3 rounded-lg overflow-hidden border border-gray-200">
                  <Image unoptimized src={portfolioForm.url} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Judul</label>
              <Input
                value={portfolioForm.title}
                onChange={(e) => setPortfolioForm({ ...portfolioForm, title: e.target.value })}
                placeholder="Judul foto portfolio"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPortfolioDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSavePortfolio} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {portfolioEditId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={testimonialDialogOpen} onOpenChange={setTestimonialDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{testimonialEditId ? 'Edit Testimonial' : 'Tambah Testimonial Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Message*</label>
              <Textarea
                rows={3}
                value={testimonialForm.message}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, message: e.target.value })}
                placeholder="Isi testimonial"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Nama*</label>
              <Input
                value={testimonialForm.name}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                placeholder="Nama customer"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Role / Perusahaan*</label>
              <Input
                value={testimonialForm.role}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                placeholder="Pemilik mobil / perusahaan"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">URL Foto</label>
              <Input
                value={testimonialForm.photo}
                onChange={(e) => setTestimonialForm({ ...testimonialForm, photo: e.target.value })}
                placeholder="Opsional"
              />
              {testimonialForm.photo && (
                <div className="w-12 h-12 relative mt-2 rounded-full overflow-hidden border border-gray-200">
                  <Image unoptimized src={testimonialForm.photo} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Rating*</label>
              <select
                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={testimonialForm.rating || ''}
                onChange={(e) =>
                  setTestimonialForm({
                    ...testimonialForm,
                    rating: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} bintang
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setTestimonialDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveTestimonial} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {testimonialEditId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
