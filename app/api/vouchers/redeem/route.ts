export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

const ERROR_MESSAGES: Record<string, string> = {
  not_found: 'Voucher tidak ditemukan.',
  inactive: 'Voucher sudah tidak aktif.',
  exhausted: 'Kuota voucher sudah habis.',
}

export async function POST(req: NextRequest) {
  let body: { voucherId?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { voucherId } = body
  if (!voucherId) {
    return NextResponse.json({ error: 'Voucher ID required' }, { status: 400 })
  }

  try {
    const result = await adminDb.runTransaction(async (tx) => {
      const ref = adminDb.collection('vouchers').doc(voucherId)
      const snap = await tx.get(ref)

      if (!snap.exists) {
        throw new Error('not_found')
      }

      const data = snap.data()!
      const currentUsage = Number(data.currentUsage) || 0
      const maxUsage = Number(data.maxUsage) || 0

      if (data.active === false) {
        throw new Error('inactive')
      }

      if (maxUsage > 0 && currentUsage >= maxUsage) {
        throw new Error('exhausted')
      }

      const newUsage = currentUsage + 1
      const updates: { currentUsage: number; active?: boolean } = {
        currentUsage: newUsage,
      }

      if (maxUsage > 0 && newUsage >= maxUsage) {
        updates.active = false
      }

      tx.update(ref, updates)

      return {
        currentUsage: newUsage,
        maxUsage,
        expired: maxUsage > 0 && newUsage >= maxUsage,
      }
    })

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'unknown'
    const message = ERROR_MESSAGES[code] || 'Gagal menggunakan voucher.'
    const status = code === 'not_found' ? 404 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
