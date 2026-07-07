'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { adminFirestoreWrite } from '@/lib/admin-firestore-client'
import { AdminPagination, paginateList } from '@/components/admin/AdminPagination'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { Loader2, Edit2, Check, Trash2, User, Plus, Search, FileSpreadsheet } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { confirmAction } from '@/lib/confirm-toast'
import { sortPortfolioNewestFirst } from '@/lib/portfolio'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getYouTubeId } from '@/lib/youtube'
import { AdminTabDropdown } from '@/components/admin/AdminTabDropdown'
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

type PartnerLogo = {
  id: string
  src: string
  alt: string
  createdAt?: string | null
}

const emptyPortfolio = { url: '', title: '' }
const emptyPartner = { src: '', alt: '' }

const emptyTestimonial = {
  message: '',
  name: '',
  role: '',
  photo: '',
  rating: 5 as number | null,
}

export default function EditLayoutPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [partners, setPartners] = useState<PartnerLogo[]>([])
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loadingPortfolio, setLoadingPortfolio] = useState(true)
  const [loadingPartners, setLoadingPartners] = useState(true)
  const [loadingTestimonials, setLoadingTestimonials] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [portfolioDialogOpen, setPortfolioDialogOpen] = useState(false)
  const [portfolioForm, setPortfolioForm] = useState(emptyPortfolio)
  const [portfolioEditId, setPortfolioEditId] = useState<string | null>(null)

  const [partnerDialogOpen, setPartnerDialogOpen] = useState(false)
  const [partnerForm, setPartnerForm] = useState(emptyPartner)
  const [partnerEditId, setPartnerEditId] = useState<string | null>(null)

  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false)
  const [testimonialForm, setTestimonialForm] = useState(emptyTestimonial)
  const [testimonialEditId, setTestimonialEditId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'portfolio' | 'partners' | 'testimonials' | 'settings' | 'newsletter'>('portfolio')
  const [portfolioPage, setPortfolioPage] = useState(1)
  const [partnersPage, setPartnersPage] = useState(1)
  const [testimonialsPage, setTestimonialsPage] = useState(1)
  const [newsletterPage, setNewsletterPage] = useState(1)
  const [heroVideoUrl, setHeroVideoUrl] = useState<string>('')
  const [loadingSettings, setLoadingSettings] = useState(true)
  const [newsletter, setNewsletter] = useState<{ id: string; email: string; createdAt?: string | null }[]>([])
  const [loadingNewsletter, setLoadingNewsletter] = useState(true)
  const [searchNewsletter, setSearchNewsletter] = useState('')

  // Promo & News banner settings states
  const [promoBadge, setPromoBadge] = useState<string>('Sertifikasi Global')
  const [promoTitle, setPromoTitle] = useState<string>('Standar Dunia Kini Hadir Lebih Dekat! 🏆')
  const [promoText, setPromoText] = useState<string>(
    'Hypermile Auto Body Works menjadi bengkel body repair & detailing pertama di Indonesia yang menerima sertifikasi resmi Body Shop Global Certification REFINIQUE by PPG.\n\nSertifikasi ini membuktikan bahwa setiap proses perbaikan, teknologi cat, hingga keahlian teknisi kami telah memenuhi standar global. Kami berkomitmen memberikan hasil restorasi kendaraan dengan kualitas terbaik dan ketahanan yang teruji secara internasional.'
  )
  const [promoImageUrl, setPromoImageUrl] = useState<string>('/promo-refinique.jpg')
  const [promoButtonText, setPromoButtonText] = useState<string>('Hubungi Admin WA')
  const [promoButtonUrl, setPromoButtonUrl] = useState<string>('https://wa.me/6285900472233')

  // Social media settings states
  const [instagramUrl, setInstagramUrl] = useState<string>('https://www.instagram.com/hypermile_salatiga')
  const [tiktokUrl, setTiktokUrl] = useState<string>('https://www.tiktok.com/@hypermileofficial')
  const [youtubeUrl, setYoutubeUrl] = useState<string>('https://www.youtube.com/@hypermileautobodyworks')

  const fetchSettings = async () => {
    setLoadingSettings(true)
    try {
      // Fetch Hero settings
      const heroRef = doc(db, 'settings', 'hero')
      const heroSnap = await getDoc(heroRef)
      if (heroSnap.exists()) {
        setHeroVideoUrl(heroSnap.data().videoUrl || '')
      }

      // Fetch Promo settings
      const promoRef = doc(db, 'settings', 'promo')
      const promoSnap = await getDoc(promoRef)
      if (promoSnap.exists()) {
        const data = promoSnap.data()
        setPromoBadge(data.badge !== undefined ? data.badge : 'Sertifikasi Global')
        setPromoTitle(data.title !== undefined ? data.title : '')
        setPromoText(data.description !== undefined ? data.description : '')
        setPromoImageUrl(data.imageUrl !== undefined ? data.imageUrl : '')
        setPromoButtonText(data.buttonText !== undefined ? data.buttonText : '')
        setPromoButtonUrl(data.buttonUrl !== undefined ? data.buttonUrl : '')
      }

      // Fetch Social settings
      const socialsRef = doc(db, 'settings', 'socials')
      const socialsSnap = await getDoc(socialsRef)
      if (socialsSnap.exists()) {
        const data = socialsSnap.data()
        setInstagramUrl(data.instagram !== undefined ? data.instagram : 'https://www.instagram.com/hypermile_salatiga')
        setTiktokUrl(data.tiktok !== undefined ? data.tiktok : 'https://www.tiktok.com/@hypermileofficial')
        setYoutubeUrl(data.youtube !== undefined ? data.youtube : 'https://www.youtube.com/@hypermileautobodyworks')
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Gagal memuat pengaturan!')
    }
    setLoadingSettings(false)
  }

  const handleSaveSettings = async () => {
    if (isSaving) return
    setIsSaving(true)
    try {
      // Save Hero Video Url
      await adminFirestoreWrite({
        collection: 'settings',
        action: 'update',
        id: 'hero',
        data: {
          videoUrl: heroVideoUrl.trim(),
        },
      })

      // Save Promo details
      await adminFirestoreWrite({
        collection: 'settings',
        action: 'update',
        id: 'promo',
        data: {
          badge: promoBadge.trim(),
          title: promoTitle.trim(),
          description: promoText.trim(),
          imageUrl: promoImageUrl.trim(),
          buttonText: promoButtonText.trim(),
          buttonUrl: promoButtonUrl.trim(),
        },
      })

      // Save Social details
      await adminFirestoreWrite({
        collection: 'settings',
        action: 'update',
        id: 'socials',
        data: {
          instagram: instagramUrl.trim(),
          tiktok: tiktokUrl.trim(),
          youtube: youtubeUrl.trim(),
        },
      })
      toast.success('Pengaturan berhasil diperbarui!')
    } catch (error) {
      console.error(error)
      toast.error('Gagal menyimpan pengaturan!')
    } finally {
      setIsSaving(false)
    }
  }

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

  const fetchPartners = async () => {
    setLoadingPartners(true)
    try {
      const snapshot = await getDocs(collection(db, 'partners'))
      const data = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        src: docSnap.data().src || '',
        alt: docSnap.data().alt || '',
        createdAt: docSnap.data().createdAt || null,
      }))
      data.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeB - timeA
      })
      setPartners(data)
    } catch (error) {
      console.error('Error fetching partners:', error)
      toast.error('Gagal memuat partner!')
    }
    setLoadingPartners(false)
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

  const fetchNewsletter = async () => {
    setLoadingNewsletter(true)
    try {
      const res = await adminFirestoreWrite({
        collection: 'newsletter',
        action: 'list',
      })
      const data = (res.items || []).map((item: any) => ({
        id: item.id,
        email: item.email || item.id,
        createdAt: item.createdAt || null,
      }))
      data.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return timeB - timeA
      })
      setNewsletter(data)
    } catch (error) {
      console.error('Error fetching newsletter:', error)
      toast.error('Gagal memuat daftar newsletter!')
    }
    setLoadingNewsletter(false)
  }

  const handleDeleteNewsletter = (emailId: string) => {
    confirmAction(`Hapus subscriber "${emailId}" dari newsletter?`, async () => {
      try {
        await adminFirestoreWrite({ collection: 'newsletter', action: 'delete', id: emailId })
        toast.success('Subscriber berhasil dihapus!')
        await fetchNewsletter()
      } catch (error) {
        console.error(error)
        toast.error('Gagal menghapus subscriber!')
      }
    })
  }

  const handleExportExcel = () => {
    if (newsletter.length === 0) {
      toast.error('Tidak ada data newsletter untuk diexport!')
      return
    }

    try {
      const headers = ['No', 'Email', 'Tanggal Bergabung']
      const csvRows = [
        headers.join(';'),
        ...newsletter.map((item, index) => {
          const dateFormatted = item.createdAt 
            ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })
            : '-'
          return [index + 1, item.email, dateFormatted].map(val => `"${val}"`).join(';')
        })
      ]

      const csvContent = csvRows.join('\n')
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Berhasil mengexport data newsletter ke CSV/Excel!')
    } catch (error) {
      console.error('Error exporting newsletter:', error)
      toast.error('Gagal mengexport data!')
    }
  }

  useEffect(() => {
    fetchPortfolio()
    fetchTestimonials()
    fetchSettings()
    fetchPartners()
    fetchNewsletter()
  }, [])

  useEffect(() => {
    const { totalPages } = paginateList(portfolio, portfolioPage)
    if (portfolioPage > totalPages) setPortfolioPage(totalPages)
  }, [portfolio.length, portfolioPage])

  useEffect(() => {
    const { totalPages } = paginateList(partners, partnersPage)
    if (partnersPage > totalPages) setPartnersPage(totalPages)
  }, [partners.length, partnersPage])

  useEffect(() => {
    const { totalPages } = paginateList(testimonials, testimonialsPage)
    if (testimonialsPage > totalPages) setTestimonialsPage(totalPages)
  }, [testimonials.length, testimonialsPage])

  useEffect(() => {
    const { totalPages } = paginateList(newsletter, newsletterPage)
    if (newsletterPage > totalPages) setNewsletterPage(totalPages)
  }, [newsletter.length, newsletterPage])

  const paginatedPortfolio = paginateList(portfolio, portfolioPage)
  const paginatedPartners = paginateList(partners, partnersPage)
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

  const openAddPartner = () => {
    setPartnerForm(emptyPartner)
    setPartnerEditId(null)
    setPartnerDialogOpen(true)
  }

  const openEditPartner = (item: PartnerLogo) => {
    setPartnerForm({ src: item.src, alt: item.alt })
    setPartnerEditId(item.id)
    setPartnerDialogOpen(true)
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

  const handleSavePartner = async () => {
    if (!partnerForm.src.trim() || !partnerForm.alt.trim()) {
      toast.error('URL logo dan nama brand wajib diisi!')
      return
    }
    if (isSaving) return
    setIsSaving(true)

    try {
      const data = {
        src: partnerForm.src.trim(),
        alt: partnerForm.alt.trim(),
      }

      if (partnerEditId) {
        await adminFirestoreWrite({
          collection: 'partners',
          action: 'update',
          id: partnerEditId,
          data,
        })
        toast.success('Partner berhasil diperbarui!')
      } else {
        await adminFirestoreWrite({
          collection: 'partners',
          action: 'create',
          data: { ...data, createdAt: new Date().toISOString() },
        })
        toast.success('Partner berhasil ditambahkan!')
      }

      setPartnerDialogOpen(false)
      await fetchPartners()
    } catch (error) {
      console.error(error)
      toast.error(partnerEditId ? 'Gagal menyimpan partner!' : 'Gagal menambahkan partner!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePartner = (id: string) => {
    const item = partners.find((p) => p.id === id)
    confirmAction(`Hapus partner "${item?.alt || 'Untitled'}"?`, async () => {
      try {
        await adminFirestoreWrite({ collection: 'partners', action: 'delete', id })
        toast.success('Partner berhasil dihapus!')
        await fetchPartners()
      } catch (error) {
        console.error(error)
        toast.error('Gagal menghapus partner!')
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

  const tabs = [
    { key: 'portfolio', label: `🖼 Portfolio (${portfolio.length})` },
    { key: 'partners', label: `🤝 Partners (${partners.length})` },
    { key: 'testimonials', label: `💬 Testimonial (${testimonials.length})` },
    { key: 'newsletter', label: `✉ Newsletter (${newsletter.length})` },
    { key: 'settings', label: `⚙ Settings` },
  ] as const

  return (
    <div className="w-full overflow-x-hidden">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Home</h1>

        {/* Mobile: Custom dropdown (no native select overflow) */}
        <AdminTabDropdown
          tabs={tabs}
          activeTab={activeTab}
          onChange={(key) => setActiveTab(key as typeof activeTab)}
        />

        {/* Desktop: Tab bar */}
        <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-5 py-4 text-center font-medium transition-colors whitespace-nowrap text-sm ${
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

        {/* PARTNERS TAB */}
        {activeTab === 'partners' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddPartner} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Partner
              </Button>
            </div>

            {loadingPartners ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : partners.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                Belum ada partner. Klik &quot;Tambah Partner&quot; untuk mulai.
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedPartners.items.map((item) => (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    {item.src && (
                      <div className="w-full h-24 relative mb-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center justify-center">
                        <div className="relative w-full h-full">
                          <Image
                            unoptimized
                            src={item.src}
                            alt={item.alt || 'Partner'}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                    <h4 className="font-bold text-gray-900 mb-1">{item.alt || 'Tanpa nama'}</h4>
                    <p className="text-xs text-gray-500 truncate mb-4">{item.src}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditPartner(item)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePartner(item.id)}
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
                totalItems={partners.length}
                page={partnersPage}
                onPageChange={setPartnersPage}
                label="partner"
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

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 space-y-8">
            {/* HERO SETTINGS */}
            <div className="space-y-4 max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Pengaturan Hero Video</h3>
              <div>
                <label className="block mb-2 font-medium text-sm text-gray-700">URL Video YouTube Hero</label>
                <Input
                  value={heroVideoUrl}
                  onChange={(e) => setHeroVideoUrl(e.target.value)}
                  placeholder="https://youtu.be/OP4AtnrYmoY?si=mLT-uxLeY43Rp_Qk"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  Masukkan tautan video YouTube (mendukung format shortener https://youtu.be/xxx atau tautan lengkap https://www.youtube.com/watch?v=xxx).
                </p>
              </div>

              {loadingSettings ? (
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Loader2 className="animate-spin h-4 w-4" />
                  <span>Memuat pengaturan...</span>
                </div>
              ) : (
                <>
                  {heroVideoUrl && getYouTubeId(heroVideoUrl) ? (
                    <div className="space-y-2">
                      <label className="block font-medium text-sm text-gray-700">Pratinjau Video</label>
                      <div className="w-full aspect-video relative rounded-lg overflow-hidden border border-gray-200 bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${getYouTubeId(heroVideoUrl)}?controls=1`}
                          title="Preview Video"
                          className="absolute inset-0 w-full h-full border-0"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  ) : heroVideoUrl ? (
                    <p className="text-sm text-red-600">Format URL video YouTube tidak valid.</p>
                  ) : null}
                </>
              )}
            </div>

            {/* PROMO & NEWS SETTINGS */}
            {!loadingSettings && (
              <div className="space-y-4 max-w-2xl border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Pengaturan Promo & Berita Utama</h3>
                
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700">Badge Banner</label>
                  <Input
                    value={promoBadge}
                    onChange={(e) => setPromoBadge(e.target.value)}
                    placeholder="Sertifikasi Global, Promo Terbatas, dll."
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700">Judul Berita / Promo</label>
                  <Input
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    placeholder="Masukkan judul utama"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700">Isi Konten / Deskripsi</label>
                  <Textarea
                    rows={6}
                    value={promoText}
                    onChange={(e) => setPromoText(e.target.value)}
                    placeholder="Masukkan penjelasan detail (dukungan baris baru/line-break)..."
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700">URL Gambar Banner</label>
                  <Input
                    value={promoImageUrl}
                    onChange={(e) => setPromoImageUrl(e.target.value)}
                    placeholder="/promo-refinique.jpg atau URL gambar eksternal"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">
                    Gunakan <strong>/promo-refinique.jpg</strong> untuk gambar bawaan sertifikasi PPG.
                  </p>
                  {promoImageUrl && (
                    <div className="w-full max-w-xs aspect-[4/5] relative mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                      <Image unoptimized src={promoImageUrl} alt="Pratinjau Gambar Promo" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 font-medium text-sm text-gray-700">Teks Tombol Aksi</label>
                    <Input
                      value={promoButtonText}
                      onChange={(e) => setPromoButtonText(e.target.value)}
                      placeholder="Hubungi Admin WA (kosongkan jika tidak ada)"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium text-sm text-gray-700">Tautan / Link Tombol</label>
                    <Input
                      value={promoButtonUrl}
                      onChange={(e) => setPromoButtonUrl(e.target.value)}
                      placeholder="https://wa.me/xxx"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SOCIAL MEDIA SETTINGS */}
            {!loadingSettings && (
              <div className="space-y-4 max-w-2xl border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Pengaturan Sosial Media</h3>
                
                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700">Instagram Link</label>
                  <Input
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://www.instagram.com/username"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700">TikTok Link</label>
                  <Input
                    value={tiktokUrl}
                    onChange={(e) => setTiktokUrl(e.target.value)}
                    placeholder="https://www.tiktok.com/@username"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-sm text-gray-700">YouTube Link</label>
                  <Input
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/@channel"
                  />
                </div>
              </div>
            )}

            {/* SAVE BUTTON FOR ALL SETTINGS */}
            {!loadingSettings && (
              <div className="pt-4 border-t">
                <Button onClick={handleSaveSettings} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                  Simpan Pengaturan
                </Button>
              </div>
            )}
          </div>
        )}

        {/* NEWSLETTER TAB */}
        {activeTab === 'newsletter' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Newsletter</h3>
                <p className="text-sm text-gray-500 mt-1">Daftar pengunjung yang berlangganan newsletter.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto items-stretch sm:items-center">
                {/* Export Button */}
                <Button
                  onClick={handleExportExcel}
                  disabled={newsletter.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white shrink-0 font-medium text-xs h-9"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>

                {/* Search Box */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Cari email..."
                    value={searchNewsletter}
                    onChange={(e) => {
                      setSearchNewsletter(e.target.value)
                      setNewsletterPage(1)
                    }}
                    className="pl-9 bg-white text-xs h-9"
                  />
                </div>
              </div>
            </div>

            {loadingNewsletter ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
              </div>
            ) : (
              <>
                {(() => {
                  const filtered = newsletter.filter(item => 
                    item.email.toLowerCase().includes(searchNewsletter.toLowerCase())
                  )
                  const paginated = paginateList(filtered, newsletterPage)

                  if (filtered.length === 0) {
                    return (
                      <div className="rounded-lg border border-dashed border-gray-200 p-12 text-center text-gray-500 bg-gray-50/50">
                        {searchNewsletter ? 'Tidak ada hasil pencarian.' : 'Belum ada subscriber.'}
                      </div>
                    )
                  }

                  return (
                    <div className="space-y-4">
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                          <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-700">
                            <tr>
                              <th className="px-3 md:px-6 py-3 md:py-4 w-12">No.</th>
                              <th className="px-3 md:px-6 py-3 md:py-4 min-w-[200px] md:min-w-0">Email</th>
                              <th className="px-3 md:px-6 py-3 md:py-4">Tanggal Gabung</th>
                              <th className="px-3 md:px-6 py-3 md:py-4 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white text-gray-600">
                            {paginated.items.map((item, index) => {
                              const globalIndex = (newsletterPage - 1) * 10 + index + 1
                              const dateFormatted = item.createdAt 
                                ? new Date(item.createdAt).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })
                                : '-'

                              return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                  <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-900">{globalIndex}</td>
                                  <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-900 break-all min-w-[200px] md:min-w-0">{item.email}</td>
                                  <td className="px-3 md:px-6 py-3 md:py-4 text-gray-500">{dateFormatted}</td>
                                  <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleDeleteNewsletter(item.id)}
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200/50 px-2 md:px-3"
                                    >
                                      <Trash2 className="h-4 w-4 md:mr-2" />
                                      <span className="hidden md:inline">Hapus</span>
                                    </Button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>

                      <AdminPagination
                        totalItems={filtered.length}
                        page={newsletterPage}
                        onPageChange={setNewsletterPage}
                        label="subscriber"
                      />
                    </div>
                  )
                })()}
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

      {/* Partner Dialog */}
      <Dialog open={partnerDialogOpen} onOpenChange={setPartnerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{partnerEditId ? 'Edit Partner' : 'Tambah Partner Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">URL Logo*</label>
              <Input
                value={partnerForm.src}
                onChange={(e) => setPartnerForm({ ...partnerForm, src: e.target.value })}
                placeholder="https://example.com/logo.svg"
              />
              {partnerForm.src && (
                <div className="w-full h-24 relative mt-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 p-2 flex items-center justify-center">
                  <div className="relative w-full h-full">
                    <Image unoptimized src={partnerForm.src} alt="Preview" fill className="object-contain" />
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Nama Brand*</label>
              <Input
                value={partnerForm.alt}
                onChange={(e) => setPartnerForm({ ...partnerForm, alt: e.target.value })}
                placeholder="NVIDIA, Supabase, dll."
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPartnerDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSavePartner} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {partnerEditId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
