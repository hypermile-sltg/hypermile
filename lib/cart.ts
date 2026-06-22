import { idrFormatter } from '@/lib/utils'

export type CartAddon = {
  id: string
  name: string
  price: number
  quantity: number
  type?: 'fixed' | 'per_item'
}

export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  thumbnail?: string
  slug?: string
  addons?: CartAddon[]
}

export function cartItemLineTotal(item: CartItem): number {
  const base = item.price * item.quantity
  const addonTotal = (item.addons ?? []).reduce((sum, a) => sum + a.price * a.quantity, 0)
  return base + addonTotal
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + cartItemLineTotal(item), 0)
}

export function formatCartItemLines(item: CartItem): string[] {
  const lines = [`- ${item.name} x${item.quantity} = ${idrFormatter(item.price * item.quantity)}`]
  for (const addon of item.addons ?? []) {
    if (addon.quantity > 0) {
      lines.push(`  + ${addon.name} x${addon.quantity} = ${idrFormatter(addon.price * addon.quantity)}`)
    }
  }
  return lines
}

export function mergeCartAddons(
  existing: CartAddon[] | undefined,
  incoming: CartAddon[] | undefined
): CartAddon[] | undefined {
  if (!incoming?.length) return existing
  if (!existing?.length) return incoming

  const merged = [...existing]
  for (const addon of incoming) {
    const idx = merged.findIndex((a) => a.id === addon.id)
    if (idx >= 0) {
      merged[idx] = { ...merged[idx], quantity: merged[idx].quantity + addon.quantity }
    } else {
      merged.push(addon)
    }
  }
  return merged
}
