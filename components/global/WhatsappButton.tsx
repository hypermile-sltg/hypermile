'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUp } from 'lucide-react'
import { FaInstagram, FaTiktok } from 'react-icons/fa'
import Image from 'next/image'
import contactUsIcon from '@/public/contactus.svg'

export default function WhatsAppButton() {
  const pathname = usePathname()
  const [isAdminPage, setIsAdminPage] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    setIsAdminPage(pathname ? pathname.startsWith('/profile/admin') : false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 250)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (isAdminPage) return null

  return (
    <>
      {/* Social Media Pill — top right */}
      <div className="fixed top-[80px] right-4 z-40 flex flex-col gap-2">
        <a
          href="https://www.tiktok.com/@hypermileofficial"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          aria-label="TikTok"
        >
          <FaTiktok className="text-white w-5 h-5" />
        </a>
        <a
          href="https://www.instagram.com/hypermile_salatiga"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          aria-label="Instagram"
        >
          <FaInstagram className="text-white w-5 h-5" />
        </a>
      </div>

      {/* Bottom Floating Pill — WA + Scroll to top */}
      <div className="fixed bottom-6 right-4 z-50 flex items-center gap-2">
        {/* Scroll to Top — muncul saat scroll */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              key="scroll-top"
              initial={{ opacity: 0, scale: 0.5, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: 20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-xl border border-gray-200 hover:bg-gray-50 hover:scale-110 transition-transform"
              aria-label="Scroll to top"
            >
              <ArrowUp size={18} className="text-gray-700" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* WhatsApp Button */}
        <motion.a
          href="https://wa.me/6285900472233"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.95 }}
          className="block w-16 h-16 drop-shadow-xl"
          aria-label="WhatsApp"
        >
          <Image
            src={contactUsIcon}
            alt="Contact Us via WhatsApp"
            className="w-full h-full object-cover"
          />
        </motion.a>
      </div>
    </>
  )
}
