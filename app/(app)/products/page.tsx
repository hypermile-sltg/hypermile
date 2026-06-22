'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { idrFormatter } from '@/lib/utils'
import { cartSubtotal, formatCartItemLines, type CartAddon } from '@/lib/cart'
import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'
import useCartStore from '@/store/cart-store'
import AddonPickerDialog, { type AddonOption } from '@/components/cart/AddonPickerDialog'
import { ShoppingCart, Plus, Minus } from 'lucide-react'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  thumbnail: string
  hot?: boolean
}

export default function Page() {
  const [products, setProducts] = useState<Product[]>([])
  const [addons, setAddons] = useState<AddonOption[]>([])
  const [loading, setLoading] = useState(true)
  const [pickerProduct, setPickerProduct] = useState<Product | null>(null)
  const { cartItemsStore, addItemToCart, updateQuantity } = useCartStore()

  useEffect(() => {
    setLoading(true)

    const unsubProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => {
          const d = doc.data()
          return {
            id: doc.id,
            name: d.name || '',
            slug: d.slug || '',
            price: d.price || 0,
            thumbnail: d.thumbnail || '',
            hot: !!d.hot,
          }
        }) as Product[]
        setProducts(data)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching products:', error)
        setLoading(false)
      }
    )

    const unsubAddons = onSnapshot(collection(db, 'addons'), (snapshot) => {
      setAddons(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || 'Addon',
          price: Number(doc.data().price) || 0,
          type: (doc.data().type as 'fixed' | 'per_item') || 'fixed',
        }))
      )
    })

    return () => {
      unsubProducts()
      unsubAddons()
    }
  }, [])

  const getCartItem = (productId: string) =>
    cartItemsStore.find((item) => item.id === productId)

  const handleAddToCart = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (addons.length > 0) {
      setPickerProduct(product)
      return
    }
    addItemToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      thumbnail: product.thumbnail,
      slug: product.slug,
    })
  }

  const handlePickerConfirm = (selectedAddons: CartAddon[], quantity: number) => {
    if (!pickerProduct) return
    addItemToCart({
      id: pickerProduct.id,
      name: pickerProduct.name,
      price: pickerProduct.price,
      quantity,
      thumbnail: pickerProduct.thumbnail,
      slug: pickerProduct.slug,
      addons: selectedAddons.length > 0 ? selectedAddons : undefined,
    })
    setPickerProduct(null)
  }

  const handleDecrement = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const item = getCartItem(product.id)
    if (item) {
      updateQuantity(product.id, item.quantity - 1)
    }
  }

  const handleIncrement = (product: Product, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const item = getCartItem(product.id)
    if (item) {
      updateQuantity(product.id, item.quantity + 1)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden shadow-sm bg-white border border-gray-100 animate-pulse">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">

      {/* Page Title */}
      <div className="mb-6 md:mb-8 flex items-center justify-between">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Produk
        </h1>
        {cartItemsStore.length > 0 && (
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault()
              const lines = cartItemsStore.flatMap((item) => formatCartItemLines(item))
              const total = cartSubtotal(cartItemsStore)
              const msg = encodeURIComponent(
                `Halo Hypermile, saya ingin memesan:\n${lines.join('\n')}\n\nTotal: ${idrFormatter(total)}`
              )
              window.open(`https://wa.me/6285900472233?text=${msg}`, '_blank')
            }}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Pesan ({cartItemsStore.reduce((s, i) => s + i.quantity, 0)} item)</span>
          </Link>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => {
          const discountRate = 0.2
          const originalPrice = product.price / (1 - discountRate)
          const formattedPrice = idrFormatter(product.price)
          const formattedOriginal = idrFormatter(originalPrice)
          const cartItem = getCartItem(product.id)
          const qty = cartItem?.quantity ?? 0

          return (
            <div
              key={product.id}
              className="relative group rounded-lg md:rounded-xl overflow-hidden shadow-sm bg-white hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <Link href={`/products/${product.slug}`} className="block">
                <div className="relative aspect-square">
                  <Image
                    src={product.thumbnail}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.hot && (
                    <Badge className="absolute right-2 top-2 text-[10px] font-semibold bg-red-500 text-white px-2 py-1 shadow-sm">
                      🔥 HOT
                    </Badge>
                  )}
                </div>

                <div className="p-3">
                  {/* Product Name */}
                  <h3 className="font-semibold text-gray-800 group-hover:text-red-600 transition-colors duration-300 line-clamp-2 text-xs md:text-sm min-h-[2.5rem]">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-2 flex flex-col items-start gap-1">
                    <span className="text-gray-400 text-xs line-through">
                      {formattedOriginal}
                    </span>
                    <span className="text-red-600 font-bold text-sm md:text-base">
                      {formattedPrice}
                    </span>
                  </div>
                </div>
              </Link>

              {/* Add to Cart / Qty Controls */}
              <div className="px-3 pb-3">
                {qty === 0 ? (
                  <button
                    onClick={(e) => handleAddToCart(product, e)}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-semibold py-2 rounded-lg transition-all duration-200 shadow-sm"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Tambah
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-2 py-1">
                    <button
                      onClick={(e) => handleDecrement(product, e)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-red-700 w-6 text-center">{qty}</span>
                    <button
                      onClick={(e) => handleIncrement(product, e)}
                      className="w-7 h-7 flex items-center justify-center rounded-md bg-red-600 hover:bg-red-700 text-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Belum ada produk tersedia</p>
          <p className="text-gray-400 text-sm mt-2">Cek kembali nanti untuk produk terbaru</p>
        </div>
      )}

      <AddonPickerDialog
        open={!!pickerProduct}
        onOpenChange={(open) => !open && setPickerProduct(null)}
        productName={pickerProduct?.name ?? ''}
        productPrice={pickerProduct?.price ?? 0}
        addons={addons}
        onConfirm={handlePickerConfirm}
      />
    </div>
  )
}