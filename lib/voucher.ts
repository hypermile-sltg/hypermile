export type VoucherQuota = {
  id: string
  code: string
  percentage: number
  active: boolean
  maxUsage: number
  currentUsage: number
  description?: string
}

export function isVoucherAvailable(voucher: Pick<VoucherQuota, 'active' | 'maxUsage' | 'currentUsage'>) {
  if (!voucher.active) return false
  if (voucher.maxUsage > 0 && voucher.currentUsage >= voucher.maxUsage) return false
  return true
}

export function voucherRemainingQuota(voucher: Pick<VoucherQuota, 'maxUsage' | 'currentUsage'>) {
  if (voucher.maxUsage <= 0) return null
  return Math.max(0, voucher.maxUsage - voucher.currentUsage)
}

export function voucherQuotaLabel(voucher: Pick<VoucherQuota, 'maxUsage' | 'currentUsage' | 'active'>) {
  if (voucher.maxUsage <= 0) return 'Kuota unlimited'
  const remaining = voucherRemainingQuota(voucher)
  if (remaining === 0 || !voucher.active) return 'Kuota habis'
  return `${voucher.currentUsage}/${voucher.maxUsage} terpakai · sisa ${remaining}`
}
