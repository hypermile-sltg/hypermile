'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getProfileMenu } from '@/lib/config'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface ProfileNavProps {
  userRole: string
}

export default function ProfileNav({ userRole }: ProfileNavProps) {
  const pathname = usePathname() as string
  const router = useRouter()
  const profileMenu = getProfileMenu(userRole)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (profileMenu.length === 0) return null

  const activeMenu = profileMenu.find((m) =>
    m.href === '/profile' ? pathname === '/profile' : pathname.startsWith(m.href)
  ) ?? profileMenu[0]

  return (
    <>
      {/* Mobile: Custom div-based dropdown — no native select overflow */}
      <div ref={ref} className="relative block md:hidden w-full">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-inset transition-colors"
        >
          <span className="truncate">{activeMenu.title}</span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            {profileMenu.map((menu) => {
              const isActive =
                menu.href === '/profile'
                  ? pathname === '/profile'
                  : pathname.startsWith(menu.href)
              return (
                <button
                  key={menu.href}
                  type="button"
                  onClick={() => {
                    router.push(menu.href)
                    setOpen(false)
                  }}
                  className={`w-full text-left flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {menu.icon && (
                    <menu.icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-red-500' : 'text-gray-400'}`} />
                  )}
                  {menu.title}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Desktop: Vertical sidebar nav */}
      <div className="hidden md:flex flex-col gap-2 w-full bg-white border border-gray-150 rounded-2xl p-4 shadow-sm space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 font-sans border-b border-gray-100 pb-2 mb-2 select-none">
          Navigasi Dashboard
        </div>
        {profileMenu.map((menu) => {
          const isActive =
            menu.href === '/profile'
              ? pathname === '/profile'
              : pathname.startsWith(menu.href)

          return (
            <Button
              key={menu.title}
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start w-full transition-all duration-200 text-sm font-bold rounded-xl py-2 px-4 shrink-0",
                isActive
                  ? "bg-red-600 text-white hover:bg-red-700 shadow-md hover:text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
              asChild
            >
              <Link href={menu.href}>
                {menu.icon && <menu.icon className={cn("mr-2 h-4 w-4", isActive ? "text-white" : "text-gray-500")} />}
                {menu.title}
              </Link>
            </Button>
          )
        })}
      </div>
    </>
  )
}