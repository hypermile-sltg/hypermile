'use client'

import Link from 'next/link'
import UserAccountNav from '../auth/UserAccountNav'
import DesktopMenu from './DesktopMenu'
import Cart from '../cart/Cart'
import { useSession } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { navMenu } from '@/lib/config'
import { cn } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { signOutNextAuthFirebase } from '@/lib/actions/auth/sign-out-next-auth-firebase'

export default function Header() {
  const session = useSession()
  const pathname = usePathname() ?? ''
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when route changes
  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  // Close when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <>
      {/* ─── DESKTOP: Static Logo Layer ─── */}
      <div className="hidden md:block absolute top-0 left-0 w-full z-40 bg-transparent pointer-events-none">
        <div className="container mx-auto flex items-center py-4 px-4 md:px-8 h-20">
          <Link href="/" className="pointer-events-auto flex items-center">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xl font-extrabold tracking-wider text-gray-900">
                HYPER<span className="text-red-600">MILE</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500">
                Bodyworks
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ─── DESKTOP: Fixed Nav + Actions ─── */}
      <header className="hidden md:block fixed top-0 left-0 w-full z-50 bg-transparent pointer-events-none">
        <div className="container mx-auto flex items-center justify-between py-4 px-4 md:px-8 relative h-20">

          {/* Center: Desktop Menu pill */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="rounded-full border px-6 py-2 shadow-md backdrop-blur-md bg-white/85 border-gray-200/60">
              <DesktopMenu />
            </div>
          </div>

          {/* Right: Cart & User */}
          <div className="flex items-center gap-3 pointer-events-auto absolute right-8 top-1/2 -translate-y-1/2">
            <Cart />
            {session.status === 'authenticated' && <UserAccountNav />}
          </div>

        </div>
      </header>

      {/* ─── MOBILE: Floating Pill Navbar + Dropdown ─── */}
      <div
        ref={menuRef}
        className="md:hidden fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
      >
        {/* Pill Bar */}
        <div className="flex items-center justify-between px-3 py-2 rounded-full border shadow-lg backdrop-blur-sm bg-white/90 border-gray-200/60">

          {/* Left: Logo */}
          <Link href="/" className="flex items-center gap-1.5 pl-1">
            <span className="text-base font-extrabold tracking-wider text-gray-900">
              HYPER<span className="text-red-600">MILE</span>
            </span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400 leading-tight">
              Bodyworks
            </span>
          </Link>

          {/* Right: Cart + Burger */}
          <div className="flex items-center gap-1">
            <Cart />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
            </button>
          </div>

        </div>


        {/* Dropdown Menu — muncul di bawah pill */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="mt-2 rounded-2xl border shadow-xl backdrop-blur-md bg-white/95 border-gray-200/60 overflow-hidden"
            >
              <ul className="flex flex-col py-2">
                {navMenu.map((menu) => (
                  <li key={menu.title}>
                    <Link
                      href={menu.href}
                      className={cn(
                        'flex items-center px-6 py-3.5 text-sm font-medium transition-colors hover:bg-gray-50',
                        pathname === menu.href
                          ? 'text-red-600 font-semibold bg-red-50/60'
                          : 'text-gray-700'
                      )}
                    >
                      {menu.title}
                    </Link>
                  </li>
                ))}

                {session.status === 'authenticated' && (
                  <>
                    <li aria-hidden className="my-1 mx-4 border-t border-gray-200" />
                    <li>
                      <Link
                        href="/profile"
                        className={cn(
                          'flex items-center gap-2 px-6 py-3.5 text-sm font-medium transition-colors hover:bg-gray-50',
                          pathname.startsWith('/profile')
                            ? 'text-red-600 font-semibold bg-red-50/60'
                            : 'text-gray-700'
                        )}
                      >
                        <LayoutDashboard size={16} />
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false)
                          signOutNextAuthFirebase()
                        }}
                        className="flex w-full items-center gap-2 px-6 py-3.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                      >
                        <LogOut size={16} />
                        Keluar
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer */}
      <div className="h-20 md:h-24" />
    </>
  )
}
