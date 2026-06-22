export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'

const ALLOWED_COLLECTIONS = [
  'products',
  'addons',
  'vouchers',
  'portfolio',
  'testimonials',
] as const

type AllowedCollection = (typeof ALLOWED_COLLECTIONS)[number]

function isAllowedCollection(value: string): value is AllowedCollection {
  return ALLOWED_COLLECTIONS.includes(value as AllowedCollection)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  let body: {
    collection?: string
    action?: string
    id?: string
    data?: Record<string, unknown>
  }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { collection, action, id, data } = body

  if (!collection || !isAllowedCollection(collection)) {
    return NextResponse.json({ error: 'Invalid collection' }, { status: 400 })
  }

  try {
    if (action === 'create') {
      if (!data) {
        return NextResponse.json({ error: 'Missing data' }, { status: 400 })
      }

      const docRef = adminDb.collection(collection).doc()
      await docRef.set(data)
      return NextResponse.json({ id: docRef.id })
    }

    if (action === 'update') {
      if (!id || !data) {
        return NextResponse.json({ error: 'Missing id or data' }, { status: 400 })
      }

      await adminDb.collection(collection).doc(id).update(data)
      return NextResponse.json({ ok: true })
    }

    if (action === 'delete') {
      if (!id) {
        return NextResponse.json({ error: 'Missing id' }, { status: 400 })
      }

      await adminDb.collection(collection).doc(id).delete()
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Admin firestore error:', error)
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 })
  }
}
