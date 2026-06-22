export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/admin-auth'
import { isSuperAdmin, isValidRole } from '@/lib/roles'

async function countSuperAdmins() {
  const snapshot = await adminDb.collection('users').where('role', '==', 'superadmin').get()
  return snapshot.size
}

export async function GET() {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const snapshot = await adminDb.collection('users').get()
    const users = snapshot.docs
      .map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          uid: data.uid || doc.id,
          name: data.name || '-',
          email: data.email || '-',
          role: data.role || 'user',
          createdAt: data.createdAt || null,
        }
      })
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA
      })

    return NextResponse.json({ users, callerRole: auth.role })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  let body: { id?: string; role?: string }

  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { id, role } = body

  if (!id || !role || !isValidRole(role)) {
    return NextResponse.json({ error: 'Invalid id or role' }, { status: 400 })
  }

  try {
    const userDoc = await adminDb.collection('users').doc(id).get()
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    const currentRole = userDoc.data()?.role || 'user'
    const callerIsSuperAdmin = isSuperAdmin(auth.role)

    if (!callerIsSuperAdmin) {
      if (currentRole !== 'user') {
        return NextResponse.json(
          { error: 'Admin hanya bisa mempromosikan user ke admin' },
          { status: 400 }
        )
      }
      if (role !== 'admin') {
        return NextResponse.json(
          { error: 'Admin hanya bisa mempromosikan user ke admin' },
          { status: 400 }
        )
      }
    }

    if (id === auth.uid) {
      return NextResponse.json(
        { error: 'Tidak bisa mengubah role akun sendiri' },
        { status: 400 }
      )
    }

    if (
      callerIsSuperAdmin &&
      currentRole === 'superadmin' &&
      role !== 'superadmin'
    ) {
      const superAdminCount = await countSuperAdmins()
      if (superAdminCount <= 1) {
        return NextResponse.json(
          { error: 'Tidak bisa menurunkan super admin terakhir' },
          { status: 400 }
        )
      }
    }

    await adminDb.collection('users').doc(id).update({ role })
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Admin users PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
