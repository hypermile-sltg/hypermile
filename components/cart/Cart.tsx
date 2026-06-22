'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart, MessageCircle, Tag, X, CheckCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '../ui/button'
import CartItem from './CartItem'
import useCartStore from '@/store/cart-store'
import { idrFormatter } from '@/lib/utils'
import { isVoucherAvailable, voucherRemainingQuota } from '@/lib/voucher'
import { hasRedeemedVoucherInBrowser, markVoucherRedeemedInBrowser } from '@/lib/voucher-storage'
import { toast } from 'sonner'
import { db } from '@/lib/firebase'
import { collection, onSnapshot } from 'firebase/firestore'

type Voucher = {
  id: string
  code: string
  percentage: number
  active: boolean
  maxUsage: number
  currentUsage: number
}

export default function CartButtonServer() {
  const { cartItemsStore, clearCart } = useCartStore()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Voucher state
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [voucherInput, setVoucherInput] = useState('')
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null)
  const [voucherError, setVoucherError] = useState('')
  const [isRedeeming, setIsRedeeming] = useState(false)

  // Guard against SSR/localStorage hydration mismatch
  useEffect(() => { setMounted(true) }, [])

  // Realtime listener untuk vouchers
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'vouchers'), (snapshot) => {
      setVouchers(
        snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          code: docSnap.data().code,
          percentage: Number(docSnap.data().percentage) || 0,
          active: docSnap.data().active !== false,
          maxUsage: Number(docSnap.data().maxUsage) || 0,
          currentUsage: Number(docSnap.data().currentUsage) || 0,
        }))
      )
    })
    return () => unsub()
  }, [])

  // Reset voucher saat cart berubah signifikan
  useEffect(() => {
    if (cartItemsStore.length === 0) {
      setAppliedVoucher(null)
      setVoucherInput('')
      setVoucherError('')
    }
  }, [cartItemsStore.length])

  useEffect(() => {
    if (!appliedVoucher) return
    const latest = vouchers.find((v) => v.id === appliedVoucher.id)
    if (!latest || !isVoucherAvailable(latest)) {
      setAppliedVoucher(null)
      setVoucherError('Voucher sudah tidak tersedia atau kuota habis.')
      return
    }
    setAppliedVoucher(latest)
  }, [vouchers, appliedVoucher?.id])

  const subtotal = cartItemsStore.reduce((s, i) => s + i.price * i.quantity, 0)
  const discount = appliedVoucher ? Math.round((subtotal * appliedVoucher.percentage) / 100) : 0
  const total = subtotal - discount

  const totalQty = cartItemsStore.reduce((s, i) => s + i.quantity, 0)

  const handleApplyVoucher = () => {
    setVoucherError('')
    const code = voucherInput.trim().toUpperCase()
    if (!code) return

    if (hasRedeemedVoucherInBrowser(code)) {
      setVoucherError('Voucher ini sudah pernah kamu pakai di browser ini.')
      setAppliedVoucher(null)
      return
    }

    const found = vouchers.find((v) => v.code === code)
    if (!found || !isVoucherAvailable(found)) {
      setVoucherError('Kode voucher tidak valid, tidak aktif, atau kuota sudah habis.')
      setAppliedVoucher(null)
      return
    }

    setAppliedVoucher(found)
    setVoucherError('')
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherInput('')
    setVoucherError('')
  }

  const handleOrderViaWA = async () => {
    if (cartItemsStore.length === 0) return

    if (appliedVoucher) {
      if (hasRedeemedVoucherInBrowser(appliedVoucher.code)) {
        toast.error('Voucher ini sudah pernah dipakai di browser ini.')
        setAppliedVoucher(null)
        setVoucherInput('')
        return
      }

      setIsRedeeming(true)
      const voucherCode = appliedVoucher.code
      try {
        const res = await fetch('/api/vouchers/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ voucherId: appliedVoucher.id }),
        })
        const data = await res.json()
        if (!res.ok) {
          toast.error(data.error || 'Voucher tidak bisa digunakan.')
          setAppliedVoucher(null)
          setVoucherInput('')
          return
        }
        markVoucherRedeemedInBrowser(voucherCode)
      } catch {
        toast.error('Gagal memproses voucher. Coba lagi.')
        return
      } finally {
        setIsRedeeming(false)
      }
    }

    const lines = cartItemsStore.map(
      (item) => `- ${item.name} x${item.quantity} = ${idrFormatter(item.price * item.quantity)}`
    )

    let message = `Halo Hypermile, saya ingin memesan:\n${lines.join('\n')}`

    if (appliedVoucher) {
      message += `\n\nVoucher: ${appliedVoucher.code} (${appliedVoucher.percentage}% off)`
      message += `\nDiskon: -${idrFormatter(discount)}`
    }

    message += `\n\nTotal: ${idrFormatter(total)}`

    window.open(`https://wa.me/6285900472233?text=${encodeURIComponent(message)}`, '_blank')
    setAppliedVoucher(null)
    setVoucherInput('')
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="rounded-full bg-black hover:bg-gray-800 text-white border border-black">
          <ShoppingCart className="mr-2 h-4 w-4 text-white" />
          <span>{mounted ? totalQty : 0}</span>
        </Button>
      </SheetTrigger>

      <SheetContent className="flex w-full flex-col min-[500px]:max-w-sm sm:max-w-md p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Keranjang
            {totalQty > 0 && (
              <span className="ml-auto text-xs font-normal text-gray-500">{totalQty} item</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {cartItemsStore.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
            <ShoppingCart className="w-16 h-16 text-gray-200" />
            <p className="text-gray-400 font-medium">Keranjang masih kosong</p>
            <p className="text-gray-300 text-xs">Tambahkan produk untuk mulai memesan</p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col overflow-y-hidden">
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
              {cartItemsStore.map((item) => (
                <CartItem
                  key={item.id}
                  data={item}
                  handleSheetClose={() => setIsOpen(false)}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 space-y-4 bg-white">

              {/* Voucher Input */}
              <div>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-green-700">{appliedVoucher.code}</p>
                        <p className="text-xs text-green-600">
                          Diskon {appliedVoucher.percentage}% · Hemat {idrFormatter(discount)}
                          {voucherRemainingQuota(appliedVoucher) !== null && (
                            <> · Sisa kuota {voucherRemainingQuota(appliedVoucher)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveVoucher}
                      className="p-1 rounded-full hover:bg-green-100 text-green-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                          value={voucherInput}
                          onChange={(e) => {
                            setVoucherInput(e.target.value.toUpperCase())
                            setVoucherError('')
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                          placeholder="Kode voucher"
                          className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent uppercase placeholder:normal-case placeholder:text-gray-400 transition-all"
                        />
                      </div>
                      <button
                        onClick={handleApplyVoucher}
                        disabled={!voucherInput.trim()}
                        className="px-4 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        Pakai
                      </button>
                    </div>
                    {voucherError && (
                      <p className="text-xs text-red-500 pl-1">{voucherError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{idrFormatter(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Diskon voucher</span>
                    <span>- {idrFormatter(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-red-600">{idrFormatter(total)}</span>
                </div>
              </div>

              {/* Order Button */}
              <Button
                onClick={handleOrderViaWA}
                disabled={isRedeeming}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-6 text-base rounded-xl gap-2 shadow-lg"
              >
                <MessageCircle className="w-5 h-5" />
                {isRedeeming ? 'Memproses voucher...' : 'Pesan via WhatsApp'}
              </Button>

              <button
                onClick={() => {
                  clearCart()
                  setAppliedVoucher(null)
                  setVoucherInput('')
                }}
                className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
              >
                Kosongkan keranjang
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}