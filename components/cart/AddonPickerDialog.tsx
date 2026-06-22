'use client'

import { useEffect, useMemo, useState } from 'react'
import { Minus, Package, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { idrFormatter } from '@/lib/utils'
import type { CartAddon } from '@/lib/cart'

export type AddonOption = {
  id: string
  name: string
  price: number
  type: 'fixed' | 'per_item'
}

type AddonPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  productPrice: number
  addons: AddonOption[]
  onConfirm: (addons: CartAddon[], quantity: number) => void
}

type LocalAddon = AddonOption & { qty: number }

export default function AddonPickerDialog({
  open,
  onOpenChange,
  productName,
  productPrice,
  addons,
  onConfirm,
}: AddonPickerDialogProps) {
  const [quantity, setQuantity] = useState(1)
  const [localAddons, setLocalAddons] = useState<LocalAddon[]>([])

  useEffect(() => {
    if (!open) return
    setQuantity(1)
    setLocalAddons(addons.map((a) => ({ ...a, qty: 0 })))
  }, [open, addons])

  const selectedAddons = useMemo(() => localAddons.filter((a) => a.qty > 0), [localAddons])

  const addonTotal = useMemo(
    () => selectedAddons.reduce((sum, a) => sum + a.price * a.qty, 0),
    [selectedAddons]
  )

  const total = productPrice * quantity + addonTotal

  const toggleFixedAddon = (addonId: string) => {
    setLocalAddons((prev) =>
      prev.map((a) => (a.id === addonId ? { ...a, qty: a.qty > 0 ? 0 : 1 } : a))
    )
  }

  const changeAddonQty = (addonId: string, delta: number) => {
    setLocalAddons((prev) =>
      prev.map((a) => (a.id === addonId ? { ...a, qty: Math.max(0, a.qty + delta) } : a))
    )
  }

  const handleConfirm = () => {
    const cartAddons: CartAddon[] = selectedAddons.map((a) => ({
      id: a.id,
      name: a.name,
      price: a.price,
      quantity: a.qty,
      type: a.type,
    }))
    onConfirm(cartAddons, quantity)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah ke Keranjang</DialogTitle>
          <p className="text-sm text-gray-500">{productName}</p>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Jumlah</label>
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {addons.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                Opsi Tambahan
              </label>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {localAddons.map((addon) => (
                  <div
                    key={addon.id}
                    className={`rounded-xl border-2 p-3 ${
                      addon.qty > 0 ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    {addon.type === 'fixed' ? (
                      <button
                        type="button"
                        onClick={() => toggleFixedAddon(addon.id)}
                        className="flex w-full items-center justify-between gap-3 text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                              addon.qty > 0 ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'
                            }`}
                          >
                            {addon.qty > 0 && (
                              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                <path
                                  d="M2 6l3 3 5-5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{addon.name}</p>
                            <p className="text-xs text-gray-500">{idrFormatter(addon.price)}</p>
                          </div>
                        </div>
                      </button>
                    ) : (
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
                            className="w-8 h-8 flex items-center justify-center disabled:opacity-40"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{addon.qty}</span>
                          <button
                            type="button"
                            onClick={() => changeAddonQty(addon.id, 1)}
                            className="w-8 h-8 flex items-center justify-center"
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

          <div className="bg-red-50 rounded-xl p-4 border border-red-100 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>{productName} × {quantity}</span>
              <span>{idrFormatter(productPrice * quantity)}</span>
            </div>
            {selectedAddons.map((a) => (
              <div key={a.id} className="flex justify-between text-gray-600">
                <span>{a.name} × {a.qty}</span>
                <span>{idrFormatter(a.price * a.qty)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-red-600 pt-2 border-t border-red-200">
              <span>Total</span>
              <span>{idrFormatter(total)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleConfirm} className="bg-red-600 hover:bg-red-700">
            Tambah ke Keranjang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
