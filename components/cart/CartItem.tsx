import Image from 'next/image'
import Link from 'next/link'
import { idrFormatter } from '@/lib/utils'
import { cartItemLineTotal } from '@/lib/cart'
import useCartStore from '@/store/cart-store'
import { CartItemsStore } from '@/store/cart-store'
import { Button } from '../ui/button'
import { Trash2, Plus, Minus } from 'lucide-react'

type PropsType = {
  data: CartItemsStore
  handleSheetClose: () => void
}

export default function CartItem({ data, handleSheetClose }: PropsType) {
  const { removeItemFromCart, updateQuantity } = useCartStore()
  const { id, name, price, thumbnail, quantity, slug, addons } = data
  const lineTotal = cartItemLineTotal(data)

  return (
    <div className="flex gap-3 border-b pb-4">
      {/* Thumbnail */}
      <div className="flex-shrink-0">
        <Link href={`/products/${slug ?? ''}`} onClick={handleSheetClose}>
          {thumbnail ? (
            <Image
              src={thumbnail}
              width={72}
              height={72}
              alt={name}
              className="object-cover rounded-lg w-[72px] h-[72px]"
            />
          ) : (
            <div className="w-[72px] h-[72px] bg-gray-100 flex items-center justify-center text-xs text-gray-500 rounded-lg">
              No image
            </div>
          )}
        </Link>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex justify-between items-start gap-2">
          <Link
            href={`/products/${slug ?? ''}`}
            className="font-semibold text-sm text-gray-800 hover:text-red-600 line-clamp-2"
            onClick={handleSheetClose}
          >
            {name}
          </Link>

          <Button
            onClick={() => removeItemFromCart(id)}
            className="h-7 w-7 flex-shrink-0 cursor-pointer p-0"
            variant="outline"
          >
            <Trash2 size={13} />
          </Button>
        </div>

        {(addons ?? []).length > 0 && (
          <div className="space-y-0.5">
            {addons!.map((addon) => (
              <p key={addon.id} className="text-xs text-gray-500">
                + {addon.name} × {addon.quantity} ({idrFormatter(addon.price * addon.quantity)})
              </p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => updateQuantity(id, quantity - 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
            <button
              onClick={() => updateQuantity(id, quantity + 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          {/* Subtotal */}
          <span className="font-bold text-sm text-red-600">
            {idrFormatter(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}