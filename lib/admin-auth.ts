import { getServerSession } from 'next-auth'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { adminDb } from '@/lib/firebase-admin'
import { NextResponse } from 'next/server'
import { isAdminRole, type UserRole } from '@/lib/roles'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const uid = (session as { uid?: string })?.uid

  if (!uid) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const userDoc = await adminDb.collection('users').doc(uid).get()
  const role = userDoc.exists ? userDoc.data()?.role || 'user' : 'user'

  if (!isAdminRole(role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { uid, role: role as UserRole }
}
