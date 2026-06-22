'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { idrFormatter } from '@/lib/utils'
import useCartStore from '@/store/cart-store'
import { db } from '@/lib/firebase'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingCart,
  Plus,
  Minus,
  MessageCircle,
  ArrowLeft,
  Package,
} from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  description: string
  gallery: string[]
  slug: string
  thumbnail?: string
}

type Addon = {
  id: string
  name: string
  price: number
  type: 'fixed' | 'per_item'
  qty: number
}

export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params
  const [productData, setProductData] = useState<Product | null>(null)
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [qty, setQty] = useState(1)

  const { cartItemsStore, addItemToCart, updateQuantity: updateCartQty } = useCartStore()

  // Realtime listener untuk produk & addons
  useEffect(() => {
    const unsubscribers: (() => void)[] = []

    // Product listener
    const productsQuery = query(collection(db, 'products'), where('slug', '==', slug))
    const unsubProduct = onSnapshot(
      productsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0]
          const data = docSnap.data()
          setProductData({
            id: docSnap.id,
            name: data.name,
            price: Number(data.price),
            description: data.description || '',
            gallery: Array.isArray(data.gallery) ? data.gallery : [],
            slug: data.slug,
            thumbnail: data.thumbnail || '',
          })
        } else {
          setProductData(null)
        }
        setLoading(false)
      },
      (error) => {
        console.error('Error listening to product:', error)
        setLoading(false)
      }
    )
    unsubscribers.push(unsubProduct)

    // Addons listener
    const unsubAddons = onSnapshot(
      collection(db, 'addons'),
      (snapshot) => {
        const addonsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Addon',
          price: Number(doc.data().price) || 0,
          type: (doc.data().type as 'fixed' | 'per_item') || 'fixed',
          qty: 0,
        }))
        setAddons(addonsData)
      },
      (error) => {
        console.error('Error listening to addons:', error)
      }
    )
    unsubscribers.push(unsubAddons)

    return () => unsubscribers.forEach((u) => u())
  }, [slug])

  // Image navigation
  const imagesToShow = productData
    ? productData.thumbnail
      ? [productData.thumbnail, ...productData.gallery.filter((img) => img !== productData.thumbnail)]
      : productData.gallery
    : []

  const safeSelectedImageIndex = Math.min(selectedImageIndex, Math.max(0, imagesToShow.length - 1))

  const nextImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === imagesToShow.length - 1 ? 0 : prev + 1))
  }, [imagesToShow.length])

  const prevImage = useCallback(() => {
    setSelectedImageIndex((prev) => (prev === 0 ? imagesToShow.length - 1 : prev - 1))
  }, [imagesToShow.length])

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50) nextImage()
    else if (distance < -50) prevImage()
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Addon handlers
  const toggleFixedAddon = (addonId: string) => {
    setAddons((prev) =>
      prev.map((a) => (a.id === addonId ? { ...a, qty: a.qty > 0 ? 0 : 1 } : a))
    )
  }

  const changeAddonQty = (addonId: string, delta: number) => {
    setAddons((prev) =>
      prev.map((a) =>
        a.id === addonId ? { ...a, qty: Math.max(0, a.qty + delta) } : a
      )
    )
  }

  // Selected addons
  const selectedAddons = useMemo(
    () => addons.filter((a) => a.qty > 0),
    [addons]
  )

  // Total price
  const addonTotal = useMemo(
    () => selectedAddons.reduce((sum, a) => sum + a.price * a.qty, 0),
    [selectedAddons]
  )

  const totalPrice = productData ? productData.price * qty + addonTotal : 0

  // Cart item untuk produk ini
  const cartItem = cartItemsStore.find((item) => item.id === productData?.id)

  const handleAddToCart = () => {
    if (!productData) return
    addItemToCart({
      id: productData.id,
      name: productData.name,
      price: productData.price,
      quantity: qty,
      thumbnail: productData.thumbnail,
      slug: productData.slug,
    })
  }

  const handleOrderViaWA = () => {
    if (!productData) return

    // Bangun pesan
    const addonLines = selectedAddons.map(
      (a) => `  + ${a.name} x${a.qty} = ${idrFormatter(a.price * a.qty)}`
    )

    const thisItemLines = [
      `- ${productData.name} x${qty} = ${idrFormatter(productData.price * qty)}`,
      ...addonLines,
    ]

    // Gabungkan dengan item di keranjang (jika ada)
    const cartLines = cartItemsStore
      .filter((i) => i.id !== productData.id)
      .map((i) => `- ${i.name} x${i.quantity} = ${idrFormatter(i.price * i.quantity)}`)

    const allLines = [...thisItemLines, ...cartLines]
    const grandTotal =
      totalPrice +
      cartItemsStore
        .filter((i) => i.id !== productData.id)
        .reduce((s, i) => s + i.price * i.quantity, 0)

    const message = `Halo Hypermile, saya ingin memesan:\n${allLines.join('\n')}\n\nTotal: ${idrFormatter(grandTotal)}`
    window.open(`https://wa.me/6285900472233?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produk Tidak Ditemukan</h1>
          <Link href="/products" className="text-red-600 hover:text-red-700 font-medium">
            Kembali ke halaman produk
          </Link>
        </div>
      </div>
    )
  }

  const { name: productName, price, description } = productData
  const discountRate = 0.2
  const originalPrice = price / (1 - discountRate)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* Back Button */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-red-600 text-sm font-medium mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Produk
        </Link>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10">

          {/* Left Column - Images + Description */}
          <div className="lg:col-span-7 mb-8 lg:mb-0">
            {imagesToShow.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
                <div className="flex flex-col gap-4">
                  {/* Main Image */}
                  <div className="relative aspect-[4/3] bg-gray-100 rounded-xl overflow-hidden">
                    <div
                      className="w-full h-full"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <Image
                        src={imagesToShow[safeSelectedImageIndex]}
                        alt={productName}
                        fill
                        className="object-cover"
                        priority
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = '/images/placeholder.jpg'
                        }}
                      />
                    </div>

                    {imagesToShow.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6 text-gray-700" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6 text-gray-700" />
                        </button>

                        {/* Dot indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                          {imagesToShow.map((_, index) => (
                            <button
                              key={index}
                              onClick={() => setSelectedImageIndex(index)}
                              className={`h-2 rounded-full transition-all duration-200 ${
                                safeSelectedImageIndex === index ? 'bg-white w-4' : 'bg-white/50 w-2'
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {imagesToShow.length > 1 && (
                    <div className="px-4 pb-4">
                      <div className="flex gap-2 overflow-x-auto py-2">
                        {imagesToShow.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                              safeSelectedImageIndex === index
                                ? 'border-red-600 ring-2 ring-red-200'
                                : 'border-gray-300 hover:border-red-400'
                            }`}
                          >
                            <Image
                              src={image}
                              alt={`${productName} ${index + 1}`}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = '/images/placeholder.jpg'
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Produk</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Order Panel */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <div className="space-y-5">

                {/* Header */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-3">{productName}</h1>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-red-600">{idrFormatter(price)}</span>
                    <span className="text-base text-gray-400 line-through">{idrFormatter(originalPrice)}</span>
                    <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                      20% OFF
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-100" />

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Jumlah</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-lg font-bold text-gray-900">{qty}</span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => q + 1)}
                        className="w-11 h-11 flex items-center justify-center hover:bg-gray-50 transition-colors text-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">item</span>
                  </div>
                </div>

                {/* Addons */}
                {addons.length > 0 && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      Opsi Tambahan
                    </label>
                    <div className="space-y-2">
                      {addons.map((addon) => (
                        <div
                          key={addon.id}
                          className={`rounded-xl border-2 p-3 transition-all duration-200 ${
                            addon.qty > 0
                              ? 'border-red-400 bg-red-50'
                              : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          {addon.type === 'fixed' ? (
                            /* Fixed: toggle checkbox */
                            <label className="flex items-center justify-between cursor-pointer gap-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                    addon.qty > 0
                                      ? 'bg-red-600 border-red-600'
                                      : 'bg-white border-gray-300'
                                  }`}
                                  onClick={() => toggleFixedAddon(addon.id)}
                                >
                                  {addon.qty > 0 && (
                                    <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                                  <p className="text-xs text-gray-500">{idrFormatter(addon.price)}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleFixedAddon(addon.id)}
                                className="sr-only"
                              >
                                Toggle
                              </button>
                            </label>
                          ) : (
                            /* Per-item: qty counter */
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                                <p className="text-xs text-gray-500">{idrFormatter(addon.price)} / item</p>
                              </div>
                              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                                <button
                                  type="button"
                                  onClick={() => changeAddonQty(addon.id, -1)}
                                  disabled={addon.qty === 0}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-sm font-bold text-gray-900">
                                  {addon.qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => changeAddonQty(addon.id, 1)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-red-50 rounded-xl p-4 border border-red-100 space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{productName} × {qty}</span>
                    <span>{idrFormatter(price * qty)}</span>
                  </div>
                  {selectedAddons.map((a) => (
                    <div key={a.id} className="flex justify-between items-center text-sm text-gray-600">
                      <span>{a.name} × {a.qty}</span>
                      <span>{idrFormatter(a.price * a.qty)}</span>
                    </div>
                  ))}
                  {selectedAddons.length > 0 && <div className="border-t border-red-200" />}
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="text-xl font-bold text-red-600">{idrFormatter(totalPrice)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full flex items-center justify-center gap-2 border-2 border-red-600 text-red-600 hover:bg-red-50 rounded-xl py-3.5 text-base font-semibold transition-all duration-200 active:scale-95"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {cartItem
                      ? `Tambah lagi (di keranjang: ${cartItem.quantity})`
                      : 'Tambah ke Keranjang'}
                  </button>

                  <button
                    onClick={handleOrderViaWA}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-xl py-3.5 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Pesan via WhatsApp
                  </button>
                </div>

                {/* Info */}
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <span className="text-amber-500 text-lg">💬</span>
                  <p className="text-xs text-amber-800">
                    Klik <strong>Pesan via WhatsApp</strong> untuk konfirmasi pesanan langsung ke tim kami.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}