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
}: AdminPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  if (totalItems <= pageSize) return null

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={safePage <= 1}
        onClick={() => onPageChange(Math.max(1, safePage - 1))}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <span className="text-xs text-gray-500 min-w-[48px] text-center font-medium tabular-nums">
        {safePage} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(Math.min(totalPages, safePage + 1))}
        aria-label="Halaman selanjutnya"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
