'use client'

import { useEffect, useState } from 'react'
import { db } from '@/lib/firebase'
import { adminFirestoreWrite } from '@/lib/admin-firestore-client'
import { AdminPagination, paginateList } from '@/components/admin/AdminPagination'
import { collection, onSnapshot } from 'firebase/firestore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { confirmAction } from '@/lib/confirm-toast'
import { voucherQuotaLabel } from '@/lib/voucher'
import { Loader2, Edit2, Trash2, Plus, Check, X } from 'lucide-react'
import Image from 'next/image'

type Product = {
  id: string
  name: string
  price: number
  description: string
  hot: boolean
  thumbnail?: string
  gallery?: string[]
  slug: string
}

type Addon = {
  id: string
  name: string
  price: number
  type: 'fixed' | 'per_item'
}

type Voucher = {
  id: string
  code: string
  percentage: number
  active: boolean
  description?: string
  maxUsage: number
  currentUsage: number
}

const emptyProduct = {
  name: '',
  price: 0,
  description: '',
  hot: false,
  thumbnail: '',
  gallery: [] as string[],
  slug: '',
}

const emptyAddon: { name: string; price: number; type: Addon['type'] } = {
  name: '',
  price: 0,
  type: 'fixed',
}

const emptyVoucher = {
  code: '',
  percentage: 0,
  active: true,
  description: '',
  maxUsage: 10,
}

function slugify(name: string) {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
}

export default function EditProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [addons, setAddons] = useState<Addon[]>([])
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'products' | 'addons' | 'vouchers'>('products')
  const [productsPage, setProductsPage] = useState(1)
  const [addonsPage, setAddonsPage] = useState(1)
  const [vouchersPage, setVouchersPage] = useState(1)

  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [productForm, setProductForm] = useState(emptyProduct)
  const [productEditId, setProductEditId] = useState<string | null>(null)
  const [galleryInput, setGalleryInput] = useState('')

  const [addonDialogOpen, setAddonDialogOpen] = useState(false)
  const [addonForm, setAddonForm] = useState(emptyAddon)
  const [addonEditId, setAddonEditId] = useState<string | null>(null)

  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false)
  const [voucherForm, setVoucherForm] = useState(emptyVoucher)
  const [voucherEditId, setVoucherEditId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribeProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(
        snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name || '',
          price: d.data().price || 0,
          description: d.data().description || '',
          hot: d.data().hot || false,
          thumbnail: d.data().thumbnail || '',
          gallery: Array.isArray(d.data().gallery) ? d.data().gallery : [],
          slug: d.data().slug || '',
        }))
      )
    })

    const unsubscribeAddons = onSnapshot(collection(db, 'addons'), (snapshot) => {
      setAddons(
        snapshot.docs.map((d) => ({
          id: d.id,
          name: d.data().name || '',
          price: d.data().price || 0,
          type: d.data().type || 'fixed',
        }))
      )
    })

    const unsubscribeVouchers = onSnapshot(collection(db, 'vouchers'), (snapshot) => {
      setVouchers(
        snapshot.docs.map((d) => ({
          id: d.id,
          code: d.data().code || '',
          percentage: d.data().percentage || d.data().amount || 0,
          active: d.data().active !== false,
          description: d.data().description || '',
          maxUsage: Number(d.data().maxUsage) || 0,
          currentUsage: Number(d.data().currentUsage) || 0,
        }))
      )
      setLoading(false)
    })

    return () => {
      unsubscribeProducts()
      unsubscribeAddons()
      unsubscribeVouchers()
    }
  }, [])

  useEffect(() => {
    const { totalPages } = paginateList(products, productsPage)
    if (productsPage > totalPages) setProductsPage(totalPages)
  }, [products.length, productsPage])

  useEffect(() => {
    const { totalPages } = paginateList(addons, addonsPage)
    if (addonsPage > totalPages) setAddonsPage(totalPages)
  }, [addons.length, addonsPage])

  useEffect(() => {
    const { totalPages } = paginateList(vouchers, vouchersPage)
    if (vouchersPage > totalPages) setVouchersPage(totalPages)
  }, [vouchers.length, vouchersPage])

  const paginatedProducts = paginateList(products, productsPage)
  const paginatedAddons = paginateList(addons, addonsPage)
  const paginatedVouchers = paginateList(vouchers, vouchersPage)

  const openAddProduct = () => {
    setProductForm(emptyProduct)
    setProductEditId(null)
    setGalleryInput('')
    setProductDialogOpen(true)
  }

  const openEditProduct = (product: Product) => {
    setProductForm({
      name: product.name,
      price: product.price,
      description: product.description,
      hot: product.hot,
      thumbnail: product.thumbnail || '',
      gallery: product.gallery || [],
      slug: product.slug,
    })
    setProductEditId(product.id)
    setGalleryInput('')
    setProductDialogOpen(true)
  }

  const openAddAddon = () => {
    setAddonForm(emptyAddon)
    setAddonEditId(null)
    setAddonDialogOpen(true)
  }

  const openEditAddon = (addon: Addon) => {
    setAddonForm({ name: addon.name, price: addon.price, type: addon.type })
    setAddonEditId(addon.id)
    setAddonDialogOpen(true)
  }

  const openAddVoucher = () => {
    setVoucherForm(emptyVoucher)
    setVoucherEditId(null)
    setVoucherDialogOpen(true)
  }

  const openEditVoucher = (voucher: Voucher) => {
    setVoucherForm({
      code: voucher.code,
      percentage: voucher.percentage,
      active: voucher.active,
      description: voucher.description || '',
      maxUsage: voucher.maxUsage || 10,
    })
    setVoucherEditId(voucher.id)
    setVoucherDialogOpen(true)
  }

  const addGalleryImage = () => {
    if (!galleryInput.trim()) {
      toast.error('URL gambar tidak boleh kosong!')
      return
    }
    if ((productForm.gallery?.length || 0) >= 3) {
      toast.error('Maksimal 3 gambar untuk gallery!')
      return
    }
    setProductForm({
      ...productForm,
      gallery: [...(productForm.gallery || []), galleryInput.trim()],
    })
    setGalleryInput('')
  }

  const removeGalleryImage = (index: number) => {
    setProductForm({
      ...productForm,
      gallery: (productForm.gallery || []).filter((_, i) => i !== index),
    })
  }

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast.error('Nama dan harga produk harus diisi!')
      return
    }
    if (isSaving) return
    setIsSaving(true)

    try {
      const slug = slugify(productForm.name)
      const data = {
        name: productForm.name,
        price: Number(productForm.price),
        description: productForm.description || '',
        hot: Boolean(productForm.hot),
        thumbnail: productForm.thumbnail || '',
        gallery: productForm.gallery || [],
        slug,
      }

      if (productEditId) {
        await adminFirestoreWrite({ collection: 'products', action: 'update', id: productEditId, data })
        toast.success('Produk berhasil diperbarui!')
      } else {
        await adminFirestoreWrite({
          collection: 'products',
          action: 'create',
          data: { ...data, createdAt: new Date().toISOString() },
        })
        toast.success('Produk berhasil ditambahkan!')
      }

      setProductDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(productEditId ? 'Gagal menyimpan perubahan produk!' : 'Gagal menambahkan produk!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId)
    confirmAction(
      `Apakah Anda yakin ingin menghapus produk "${product?.name || 'ini'}"?`,
      async () => {
        try {
          await adminFirestoreWrite({ collection: 'products', action: 'delete', id: productId })
          toast.success('Produk berhasil dihapus!')
        } catch (error) {
          console.error(error)
          toast.error('Gagal menghapus produk!')
        }
      }
    )
  }

  const handleSaveAddon = async () => {
    if (!addonForm.name || !addonForm.price) {
      toast.error('Nama dan harga addon harus diisi!')
      return
    }
    if (isSaving) return
    setIsSaving(true)

    try {
      const data = {
        name: addonForm.name,
        price: Number(addonForm.price),
        type: addonForm.type,
      }

      if (addonEditId) {
        await adminFirestoreWrite({ collection: 'addons', action: 'update', id: addonEditId, data })
        toast.success('Addon berhasil diperbarui!')
      } else {
        await adminFirestoreWrite({
          collection: 'addons',
          action: 'create',
          data: { ...data, createdAt: new Date().toISOString() },
        })
        toast.success('Addon berhasil ditambahkan!')
      }

      setAddonDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(addonEditId ? 'Gagal menyimpan perubahan addon!' : 'Gagal menambahkan addon!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAddon = (addonId: string) => {
    const addon = addons.find((a) => a.id === addonId)
    confirmAction(
      `Apakah Anda yakin ingin menghapus addon "${addon?.name || 'ini'}"?`,
      async () => {
        try {
          await adminFirestoreWrite({ collection: 'addons', action: 'delete', id: addonId })
          toast.success('Addon berhasil dihapus!')
        } catch (error) {
          console.error(error)
          toast.error('Gagal menghapus addon!')
        }
      }
    )
  }

  const handleSaveVoucher = async () => {
    if (!voucherForm.code || !voucherForm.percentage) {
      toast.error('Kode dan persentase voucher harus diisi!')
      return
    }
    if (!voucherForm.maxUsage || voucherForm.maxUsage < 1) {
      toast.error('Kuota voucher minimal 1 orang!')
      return
    }
    if (voucherForm.percentage < 0 || voucherForm.percentage > 100) {
      toast.error('Persentase harus antara 0-100!')
      return
    }
    if (
      !voucherEditId &&
      vouchers.some((v) => v.code === voucherForm.code)
    ) {
      toast.error('Kode voucher sudah ada!')
      return
    }
    if (isSaving) return
    setIsSaving(true)

    try {
      const data = {
        code: voucherForm.code,
        percentage: Number(voucherForm.percentage),
        active: Boolean(voucherForm.active),
        description: voucherForm.description || '',
        maxUsage: Number(voucherForm.maxUsage),
      }

      if (voucherEditId) {
        const existing = vouchers.find((v) => v.id === voucherEditId)
        const usage = existing?.currentUsage ?? 0
        if (usage >= data.maxUsage) {
          data.active = false
        }
        await adminFirestoreWrite({ collection: 'vouchers', action: 'update', id: voucherEditId, data })
        toast.success('Voucher berhasil diperbarui!')
      } else {
        await adminFirestoreWrite({
          collection: 'vouchers',
          action: 'create',
          data: { ...data, currentUsage: 0, createdAt: new Date().toISOString() },
        })
        toast.success('Voucher berhasil ditambahkan!')
      }

      setVoucherDialogOpen(false)
    } catch (error) {
      console.error(error)
      toast.error(voucherEditId ? 'Gagal menyimpan perubahan voucher!' : 'Gagal menambahkan voucher!')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteVoucher = (voucherId: string) => {
    const voucher = vouchers.find((v) => v.id === voucherId)
    confirmAction(
      `Apakah Anda yakin ingin menghapus voucher "${voucher?.code || 'ini'}"?`,
      async () => {
        try {
          await adminFirestoreWrite({ collection: 'vouchers', action: 'delete', id: voucherId })
          toast.success('Voucher berhasil dihapus!')
        } catch (error) {
          console.error(error)
          toast.error('Gagal menghapus voucher!')
        }
      }
    )
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
        <span className="ml-2 text-gray-600">Memuat data...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Manage Packages</h1>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            {(
              [
                { key: 'products', label: `📦 Produk (${products.length})` },
                { key: 'addons', label: `➕ Addons (${addons.length})` },
                { key: 'vouchers', label: `🎟 Voucher (${vouchers.length})` },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddProduct} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk
              </Button>
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                Belum ada produk. Klik &quot;Tambah Produk&quot; untuk mulai.
              </div>
            ) : (
              <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paginatedProducts.items.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col"
                  >
                    {product.thumbnail ? (
                      <div className="w-full h-36 relative mb-3 rounded-lg overflow-hidden border border-gray-200">
                        <Image
                          unoptimized
                          src={product.thumbnail}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-36 mb-3 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs">
                        Tanpa thumbnail
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 line-clamp-1">{product.name}</h4>
                      {product.hot && (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0">
                          HOT
                        </span>
                      )}
                    </div>

                    <p className="text-lg font-semibold text-green-600 mb-2">
                      Rp {product.price.toLocaleString('id-ID')}
                    </p>

                    <p className="text-sm text-gray-600 line-clamp-2 mb-3 flex-1">
                      {product.description || 'Tanpa deskripsi'}
                    </p>

                    {product.gallery && product.gallery.length > 0 && (
                      <div className="flex gap-1.5 mb-3">
                        {product.gallery.slice(0, 3).map((image, index) => (
                          <div
                            key={index}
                            className="w-12 h-12 border rounded-md overflow-hidden shrink-0"
                          >
                            <Image
                              unoptimized
                              src={image}
                              alt={`Gallery ${index + 1}`}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-auto">
                      <Button variant="outline" size="sm" onClick={() => openEditProduct(product)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <AdminPagination
                totalItems={products.length}
                page={productsPage}
                onPageChange={setProductsPage}
                label="produk"
              />
              </>
            )}
          </div>
        )}

        {/* ADDONS TAB */}
        {activeTab === 'addons' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddAddon} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Addon
              </Button>
            </div>

            {addons.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                Belum ada addon. Klik &quot;Tambah Addon&quot; untuk mulai.
              </div>
            ) : (
              <>
              <div className="grid md:grid-cols-2 gap-4">
                {paginatedAddons.items.map((addon) => (
                  <div key={addon.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{addon.name}</h4>
                        <p className="text-xl font-semibold text-green-600 mb-2">
                          Rp {addon.price.toLocaleString('id-ID')}
                        </p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          addon.type === 'fixed' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {addon.type === 'fixed' ? '📌 Fixed' : '🔢 Per Item'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditAddon(addon)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteAddon(addon.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <AdminPagination
                totalItems={addons.length}
                page={addonsPage}
                onPageChange={setAddonsPage}
                label="addon"
              />
              </>
            )}
          </div>
        )}

        {/* VOUCHERS TAB */}
        {activeTab === 'vouchers' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={openAddVoucher} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Tambah Voucher
              </Button>
            </div>

            {vouchers.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
                Belum ada voucher. Klik &quot;Tambah Voucher&quot; untuk mulai.
              </div>
            ) : (
              <>
              <div className="grid md:grid-cols-2 gap-4">
                {paginatedVouchers.items.map((voucher) => (
                  <div key={voucher.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-lg text-gray-900">{voucher.code}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            voucher.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {voucher.active ? '✅ AKTIF' : '❌ NON-AKTIF'}
                          </span>
                        </div>
                        {voucher.description && (
                          <p className="text-gray-600 text-sm mb-3">{voucher.description}</p>
                        )}
                        <p className="text-2xl font-bold text-orange-600 mb-2">{voucher.percentage}% OFF</p>
                        <p className={`text-xs font-medium ${
                          voucher.maxUsage > 0 && voucher.currentUsage >= voucher.maxUsage
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}>
                          {voucherQuotaLabel(voucher)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm" onClick={() => openEditVoucher(voucher)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeleteVoucher(voucher.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <AdminPagination
                totalItems={vouchers.length}
                page={vouchersPage}
                onPageChange={setVouchersPage}
                label="voucher"
              />
              </>
            )}
          </div>
        )}
      </div>

      {/* PRODUCT DIALOG */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{productEditId ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Nama Produk*</label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                placeholder="Nama produk"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Harga (Rp)*</label>
              <Input
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Deskripsi</label>
              <Textarea
                rows={3}
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                placeholder="Deskripsi produk"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Thumbnail URL</label>
              <Input
                value={productForm.thumbnail}
                onChange={(e) => setProductForm({ ...productForm, thumbnail: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
              {productForm.thumbnail && (
                <div className="w-20 h-20 mt-3 border-2 rounded-lg overflow-hidden">
                  <Image unoptimized src={productForm.thumbnail} alt="Preview" width={80} height={80} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={productForm.hot}
                onChange={(e) => setProductForm({ ...productForm, hot: e.target.checked })}
                className="w-4 h-4"
                id="hotProduct"
              />
              <label htmlFor="hotProduct" className="text-sm text-gray-700 font-medium">
                🔥 Tandai sebagai Produk Hot
              </label>
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Gallery (Maks. 3)</label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  placeholder="URL gambar gallery"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addGalleryImage()
                    }
                  }}
                />
                <Button type="button" onClick={addGalleryImage} className="bg-blue-600 hover:bg-blue-700 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {productForm.gallery?.map((image, index) => (
                  <div key={index} className="relative">
                    <div className="w-16 h-16 border-2 rounded-lg overflow-hidden">
                      <Image unoptimized src={image} alt={`Gallery ${index + 1}`} width={64} height={64} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGalleryImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveProduct} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {productEditId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADDON DIALOG */}
      <Dialog open={addonDialogOpen} onOpenChange={setAddonDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{addonEditId ? 'Edit Addon' : 'Tambah Addon Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Nama Addon*</label>
              <Input
                value={addonForm.name}
                onChange={(e) => setAddonForm({ ...addonForm, name: e.target.value })}
                placeholder="Nama addon"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Harga (Rp)*</label>
              <Input
                type="number"
                value={addonForm.price}
                onChange={(e) => setAddonForm({ ...addonForm, price: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Tipe*</label>
              <select
                value={addonForm.type}
                onChange={(e) => setAddonForm({ ...addonForm, type: e.target.value as 'fixed' | 'per_item' })}
                className="w-full h-10 border border-gray-300 rounded-md px-3 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fixed">Fixed (Harga tetap)</option>
                <option value="per_item">Per Item (Harga per item)</option>
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setAddonDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveAddon} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {addonEditId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VOUCHER DIALOG */}
      <Dialog open={voucherDialogOpen} onOpenChange={setVoucherDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{voucherEditId ? 'Edit Voucher' : 'Tambah Voucher Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Kode Voucher*</label>
              <Input
                value={voucherForm.code}
                onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                placeholder="KODE123"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Diskon (%)*</label>
              <Input
                type="number"
                value={voucherForm.percentage}
                onChange={(e) => setVoucherForm({ ...voucherForm, percentage: Number(e.target.value) })}
                placeholder="0"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Kuota Pengguna*</label>
              <Input
                type="number"
                value={voucherForm.maxUsage}
                onChange={(e) => setVoucherForm({ ...voucherForm, maxUsage: Number(e.target.value) })}
                placeholder="10"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Voucher otomatis nonaktif setelah dipakai sebanyak kuota ini.
              </p>
            </div>
            <div>
              <label className="block mb-2 font-medium text-sm text-gray-700">Deskripsi</label>
              <Input
                value={voucherForm.description}
                onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
                placeholder="Deskripsi voucher"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={voucherForm.active}
                onChange={(e) => setVoucherForm({ ...voucherForm, active: e.target.checked })}
                className="w-4 h-4"
                id="activeVoucher"
              />
              <label htmlFor="activeVoucher" className="text-sm text-gray-700 font-medium">
                Voucher Aktif
              </label>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setVoucherDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveVoucher} className="bg-green-600 hover:bg-green-700" disabled={isSaving}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 mr-2" />}
              {voucherEditId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
