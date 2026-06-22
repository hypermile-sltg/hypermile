'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export const ADMIN_LIST_PAGE_SIZE = 6

export function paginateList<T>(items: T[], page: number, pageSize = ADMIN_LIST_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const startIndex = (safePage - 1) * pageSize

  return {
    items: items.slice(startIndex, startIndex + pageSize),
    totalPages,
    safePage,
    rangeStart: items.length === 0 ? 0 : startIndex + 1,
    rangeEnd: Math.min(startIndex + pageSize, items.length),
  }
}

type AdminPaginationProps = {
  totalItems: number
  page: number
  onPageChange: (page: number) => void
  pageSize?: number
  label?: string
}

export function AdminPagination({
  totalItems,
  page,
  onPageChange,
  pageSize = ADMIN_LIST_PAGE_SIZE,
  label = 'item',
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const rangeStart = totalItems === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, totalItems)

  if (totalItems <= pageSize) return null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border border-gray-200 rounded-lg bg-white">
      <p className="text-gray-500 text-xs">
        Menampilkan {rangeStart}–{rangeEnd} dari {totalItems} {label}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={safePage <= 1}
          onClick={() => onPageChange(Math.max(1, safePage - 1))}
        >
          <ChevronLeft className="h-3.5 w-3.5 mr-1" />
          Sebelumnya
        </Button>
        <span className="text-xs text-gray-500 min-w-[88px] text-center">
          {safePage} / {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={safePage >= totalPages}
          onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
        >
          Selanjutnya
          <ChevronRight className="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>
  )
}
