import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner'
import { CartItem, mergeCartAddons } from '@/lib/cart'

export type CartItemsStore = CartItem

type CartState = {
  cartItemsStore: CartItemsStore[]
  addItemToCart: (item: CartItemsStore) => void
  removeItemFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cartItemsStore: [],

      addItemToCart: (newItem) => {
        const currentItems = get().cartItemsStore
        const existingIndex = currentItems.findIndex((item) => item.id === newItem.id)

        if (existingIndex >= 0) {
          const existing = currentItems[existingIndex]
          const updatedItems = [...currentItems]
          updatedItems[existingIndex] = {
            ...existing,
            quantity: existing.quantity + newItem.quantity,
            addons: mergeCartAddons(existing.addons, newItem.addons),
          }
          set({ cartItemsStore: updatedItems })
          toast.success('Jumlah produk diperbarui!')
        } else {
          set({
            cartItemsStore: [...currentItems, newItem],
          })
          toast.success('Produk ditambahkan ke keranjang!')
        }
      },

      removeItemFromCart: (id: string) => {
        const currentItems = get().cartItemsStore
        const updatedItems = currentItems.filter((item) => item.id !== id)
        set({ cartItemsStore: updatedItems })
        toast.success('Produk dihapus dari keranjang!')
      },

      updateQuantity: (id: string, quantity: number) => {
        const currentItems = get().cartItemsStore
        if (quantity <= 0) {
          set({ cartItemsStore: currentItems.filter((item) => item.id !== id) })
        } else {
          set({
            cartItemsStore: currentItems.map((item) =>
              item.id === id ? { ...item, quantity } : item
            ),
          })
        }
      },

      clearCart: () => {
        set({ cartItemsStore: [] })
      },
    }),
    {
      name: 'cart-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

export default useCartStore
