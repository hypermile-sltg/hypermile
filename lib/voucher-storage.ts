const STORAGE_KEY = 'hypermile_voucher_redeemed'

function getRedeemedCodes(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function hasRedeemedVoucherInBrowser(code: string) {
  return getRedeemedCodes().includes(code.trim().toUpperCase())
}

export function markVoucherRedeemedInBrowser(code: string) {
  const normalized = code.trim().toUpperCase()
  const codes = getRedeemedCodes()
  if (codes.includes(normalized)) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...codes, normalized]))
}
