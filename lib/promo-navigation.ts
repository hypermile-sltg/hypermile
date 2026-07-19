const SCROLL_TO_PROMO_KEY = 'scrollToPromo'
export const PROMO_SECTION_ID = 'promo'

export function markReturnToPromoSection() {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SCROLL_TO_PROMO_KEY, '1')
}

export function shouldReturnToPromoSection() {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(SCROLL_TO_PROMO_KEY) === '1'
}

export function clearReturnToPromoSection() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(SCROLL_TO_PROMO_KEY)
}

export function scrollToPromoSection() {
  const el = document.getElementById(PROMO_SECTION_ID)
  if (!el) return false
  el.scrollIntoView({ behavior: 'auto', block: 'start' })
  return true
}

/** Refresh di /#promo tanpa intent kembali → bersihkan hash, mulai dari atas. */
export function clearStalePromoHash() {
  if (typeof window === 'undefined') return false
  if (window.location.hash !== `#${PROMO_SECTION_ID}`) return false
  if (shouldReturnToPromoSection()) return false

  history.replaceState(null, '', '/')
  window.scrollTo(0, 0)
  return true
}
