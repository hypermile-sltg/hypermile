import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200/80', className)}
      aria-hidden="true"
    />
  )
}

export function PromoCardSkeleton() {
  return (
    <div className="bg-zinc-950 rounded-2xl md:rounded-3xl border border-zinc-800 p-4 sm:p-6 md:p-10 lg:p-12 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 items-center">
        <div className="lg:col-span-5 w-full flex justify-center">
          <Skeleton className="w-full max-w-none sm:max-w-[280px] aspect-[16/9] sm:aspect-square lg:aspect-[4/5] rounded-xl md:rounded-2xl bg-zinc-800" />
        </div>
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <Skeleton className="h-5 w-28 rounded-full bg-zinc-800" />
          <Skeleton className="h-6 sm:h-8 w-4/5 bg-zinc-800" />
          <Skeleton className="h-6 sm:h-8 w-3/5 bg-zinc-800" />
          <Skeleton className="h-3 sm:h-4 w-full bg-zinc-800" />
          <Skeleton className="h-3 sm:h-4 w-5/6 bg-zinc-800" />
          <Skeleton className="h-9 sm:h-11 w-36 rounded-lg sm:rounded-xl bg-zinc-800 mt-2" />
        </div>
      </div>
    </div>
  )
}

export function PortfolioSlideSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'aspect-[4/5] rounded-2xl',
            i > 0 && 'hidden sm:block',
            i > 1 && 'sm:hidden lg:block'
          )}
        />
      ))}
    </div>
  )
}

export function TestimonialSkeleton() {
  return (
    <div className="py-24 border-t border-gray-200">
      <div className="container mx-auto px-4 mb-16 flex flex-col items-center gap-4">
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="h-10 w-72 max-w-full" />
      </div>
      <div className="flex justify-center gap-4 px-4 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn('h-48 w-[340px] flex-shrink-0 rounded-2xl', i > 0 && 'hidden md:block')}
          />
        ))}
      </div>
    </div>
  )
}

export function PartnersSkeleton() {
  return (
    <div className="flex gap-6 overflow-hidden py-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-28 flex-shrink-0 rounded-lg" />
      ))}
    </div>
  )
}

export function HeroMediaSkeleton() {
  return <Skeleton className="absolute inset-0 rounded-3xl bg-zinc-800" />
}

export function PromoDetailSkeleton() {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-24">
      <div className="container mx-auto px-4 md:px-12 max-w-3xl pt-20 md:pt-16 pb-8 space-y-6">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-full max-w-xl" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl" />
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 sm:p-8 md:p-10 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}
