'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { markReturnToPromoSection } from '@/lib/promo-navigation'
import { cn } from '@/lib/utils'

type BackToPromoLinkProps = {
  className?: string
  withIcon?: boolean
}

export function BackToPromoLink({ className, withIcon = false }: BackToPromoLinkProps) {
  return (
    <Link
      href="/"
      scroll={false}
      onClick={markReturnToPromoSection}
      className={cn(
        withIcon
          ? 'inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors'
          : 'text-red-600 font-semibold hover:underline',
        className
      )}
    >
      {withIcon && <ArrowLeft className="h-4 w-4" />}
      Kembali
    </Link>
  )
}
