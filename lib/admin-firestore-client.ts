type AdminCollection = 'products' | 'addons' | 'vouchers' | 'portfolio' | 'testimonials' | 'settings' | 'partners' | 'newsletter' | 'promos'
type AdminAction = 'create' | 'update' | 'delete' | 'list'

export async function adminFirestoreWrite({
  collection,
  action,
  id,
  data,
}: {
  collection: AdminCollection
  action: AdminAction
  id?: string
  data?: Record<string, unknown>
}) {
  const res = await fetch('/api/admin/firestore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collection, action, id, data }),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || 'Operasi gagal')
  }

  return json as { id?: string; ok?: boolean; items?: any[] }
}
