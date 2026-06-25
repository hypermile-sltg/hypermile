'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { isSuperAdmin, roleLabel } from '@/lib/roles'

type UserRecord = {
  id: string
  uid: string
  name: string
  email: string
  role: string
  createdAt: string | null
}

function formatDate(value: string | null) {
  if (!value) return '-'
  try {
    return new Date(value).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return '-'
  }
}

function canEditUserRole(
  callerRole: string,
  target: UserRecord,
  currentUid: string | undefined
) {
  if (target.id === currentUid) return false
  if (isSuperAdmin(callerRole)) return true
  return target.role === 'user'
}

const PAGE_SIZE = 10

export default function ManageUsersPage() {
  const { data: session } = useSession()
  const currentUid = (session as { uid?: string } | null)?.uid
  const [users, setUsers] = useState<UserRecord[]>([])
  const [callerRole, setCallerRole] = useState<string>('admin')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal memuat data user')
      setUsers(data.users)
      if (data.callerRole) setCallerRole(data.callerRole)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat data user')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * PAGE_SIZE
  const paginatedUsers = users.slice(startIndex, startIndex + PAGE_SIZE)

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const handleRoleChange = async (userId: string, newRole: string) => {
    const previous = users.find((u) => u.id === userId)?.role
    setUpdatingId(userId)
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah role')
      toast.success('Role berhasil diperbarui')
    } catch (error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId && previous ? { ...u, role: previous } : u))
      )
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah role')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${userName}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return
    }

    setDeletingId(userId)
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menghapus user')

      toast.success(`User "${userName}" berhasil dihapus`)
      fetchUsers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus user')
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Memuat daftar user...
      </div>
    )
  }

  const callerIsSuperAdmin = isSuperAdmin(callerRole)

  return (
    <div className="text-xs overflow-x-hidden">
      <div className="mb-6">
        <p className="text-muted-foreground text-sm mb-3">
          Anda masuk sebagai{' '}
          <Badge
            variant={callerIsSuperAdmin ? 'default' : 'secondary'}
            className="align-middle text-xs font-semibold"
          >
            {roleLabel(callerRole)}
          </Badge>
        </p>
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 text-red-600" />
          <h1 className="text-lg font-semibold">Manage User</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Kelola akun yang mendaftar. Ubah role ke admin agar bisa login dan mengelola website.
        </p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          Belum ada user terdaftar.
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">Nama</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Daftar</th>
                  {callerIsSuperAdmin && <th className="px-4 py-3 font-medium text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const isSelf = user.id === currentUid
                  const editable = canEditUserRole(callerRole, user, currentUid)

                  return (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.name}</span>
                          {isSelf && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Anda
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        {editable ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              disabled={updatingId === user.id}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="h-8 rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                              {callerIsSuperAdmin && (
                                <option value="superadmin">Super Admin</option>
                              )}
                            </select>
                            {updatingId === user.id && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                            )}
                          </div>
                        ) : (
                          <Badge
                            variant={user.role === 'superadmin' ? 'default' : 'secondary'}
                            className="font-normal"
                          >
                            {roleLabel(user.role)}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      {callerIsSuperAdmin && (
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isSelf || deletingId === user.id}
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200/50 h-8 px-2 md:px-3"
                          >
                            <Trash2 className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline">Hapus</span>
                          </Button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {users.length > PAGE_SIZE && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 border-t bg-muted/30">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-[11px] text-muted-foreground min-w-[48px] text-center font-medium tabular-nums">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={safePage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Halaman selanjutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <p className="mt-4 text-muted-foreground text-[11px]">
        User baru dari halaman Sign Up otomatis muncul dengan role <strong>User</strong>.
        {callerIsSuperAdmin ? (
          <>
            {' '}
            Sebagai <strong>Super Admin</strong>, Anda bisa menetapkan role User, Admin, atau
            Super Admin — termasuk menurunkan admin.
          </>
        ) : (
          <>
            {' '}
            Admin hanya bisa mempromosikan user ke <strong>Admin</strong>. Role admin hanya bisa
            diubah oleh super admin.
          </>
        )}
      </p>
    </div>
  )
}
