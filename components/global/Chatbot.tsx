'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUp, Bot, Send, X, Sparkles, MessageSquare, PhoneCall, Camera } from 'lucide-react'
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import ReactMarkdown from 'react-markdown'
import {
  buildWhatsAppAdminLink,
  buildWhatsAppConsultMessage,
  WHATSAPP_ADMIN_URL,
} from '@/lib/whatsapp-message'

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string // Base64 data URL
}

const QUICK_PROMPTS = [
  'Berapa biaya cat mobil?',
  'Layanan body repair apa saja?',
  'Lokasi bengkel di mana?',
  'Buka jam berapa?',
  'Hubungi WhatsApp Admin',
]

export default function Chatbot() {
  const pathname = usePathname()
  const [isAdminPage, setIsAdminPage] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [attachedImage, setAttachedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [socials, setSocials] = useState({
    instagram: 'https://www.instagram.com/hypermile_salatiga',
    tiktok: 'https://www.tiktok.com/@hypermileofficial',
    youtube: 'https://www.youtube.com/@hypermileautobodyworks',
  })

  useEffect(() => {
    setIsAdminPage(pathname ? pathname.startsWith('/profile/admin') : false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 250)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-chatbot', handleOpen)
    return () => window.removeEventListener('open-chatbot', handleOpen)
  }, [])


  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, 'settings', 'socials'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data()
          setSocials({
            instagram: data.instagram || 'https://www.instagram.com/hypermile_salatiga',
            tiktok: data.tiktok || 'https://www.tiktok.com/@hypermileofficial',
            youtube: data.youtube || 'https://www.youtube.com/@hypermileautobodyworks',
          })
        }
      },
      (err) => {
        console.error('Error fetching socials in Chatbot:', err)
      }
    )
    return () => unsub()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (isAdminPage) return null

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAttachedImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() && !attachedImage) return

    const userMessageContent = textToSend.trim()
    const userImg = attachedImage

    const newUserMessage: Message = {
      role: 'user',
      content: userMessageContent || 'Analisis kerusakan di foto ini.',
      image: userImg || undefined,
    }

    const newMessages: Message[] = [...messages, newUserMessage]
    setMessages(newMessages)
    setInput('')
    setAttachedImage(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          socials,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'Maaf, asisten sedang mengalami gangguan. Silakan coba lagi atau hubungi admin via WhatsApp.'
        )
      }

      const botResponse =
        typeof data.text === 'string' && data.text.trim()
          ? data.text.trim()
          : 'Maaf, saya tidak dapat memahami pesan tersebut.'

      setMessages((prev) => [...prev, { role: 'assistant', content: botResponse }])
    } catch (error) {
      console.error('Chatbot Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? error.message
              : 'Maaf, asisten sedang mengalami gangguan. Silakan coba lagi sebentar atau hubungi admin via WhatsApp.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Social Media Pill — top right */}
      <div className="fixed top-[80px] right-4 z-40 flex flex-col gap-2">
        <a
          href={socials.tiktok}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-black p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          aria-label="TikTok"
        >
          <FaTiktok className="text-white w-5 h-5" />
        </a>
        <a
          href={socials.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-3 rounded-full shadow-lg hover:scale-110 transition-transform"
          aria-label="Instagram"
        >
          <FaInstagram className="text-white w-5 h-5" />
        </a>
        <a
          href={socials.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red-600 p-3 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center"
          aria-label="YouTube"
        >
          <FaYoutube className="text-white w-5 h-5" />
        </a>
      </div>

      {/* Floating Chat Panel & Trigger */}
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
        {/* Chat Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[75vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center shadow-lg shadow-rose-600/30">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-none font-sporty tracking-wide">HYPERMILE AI</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[11px] text-gray-400 font-medium">Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                  <X className="w-5 h-5 text-gray-400 hover:text-white" />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50 space-y-4 tabs-scrollbar">
                {/* Welcome Message */}
                <div className="flex gap-2.5 items-start max-w-[85%]">
                  <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-xs leading-relaxed text-gray-800">
                    Halo Kak! Selamat datang di <strong>Hypermile Auto Bodyworks</strong>. Saya asisten AI resmi yang siap membantu menjawab pertanyaan Kakak seputar seluruh layanan kami, informasi bengkel, hingga estimasi biaya perbaikan menggunakan Pricelist resmi.
                    <br/><br/>
                    Kakak juga bisa <strong>mengunggah foto kerusakan mobil</strong> dengan mengeklik tombol 📷 kamera di bawah agar saya bisa membantu memperkirakan biayanya!


                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                      <p className="text-[11px] text-gray-500 font-medium">Butuh chat dengan staf kami langsung?</p>
                      <a
                        href={buildWhatsAppAdminLink(
                          'Halo Admin Hypermile,\n\nSaya ingin bertanya dan berkonsultasi mengenai perbaikan bodi mobil.\n\nMohon bantuannya. Terima kasih.'
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition-colors shadow-sm shadow-emerald-600/10"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        Chat WhatsApp Admin
                      </a>
                    </div>
                  </div>
                </div>

                {/* Message List */}
                {messages.map((msg, index) => {
                  const isBot = msg.role === 'assistant'
                  return (
                    <div
                      key={index}
                      className={`flex gap-2.5 items-start ${isBot ? 'max-w-[85%]' : 'max-w-[85%] ml-auto flex-row-reverse'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                          isBot ? 'bg-slate-900' : 'bg-rose-600'
                        }`}
                      >
                        {isBot ? <Bot className="w-4 h-4 text-white" /> : <span className="text-[10px] text-white font-bold">ME</span>}
                      </div>
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-sm border ${
                          isBot
                            ? 'bg-white rounded-tl-none border-gray-100 text-gray-800 prose prose-slate max-w-none'
                            : 'bg-rose-600 rounded-tr-none border-rose-500 text-white'
                        }`}
                      >
                        {msg.image && (
                          <div className="mb-2 max-w-full rounded-lg overflow-hidden border border-gray-200">
                            <img
                              src={msg.image}
                              alt="Kerusakan mobil"
                              className="max-h-40 object-cover w-full cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(msg.image!, '_blank')}
                            />
                          </div>
                        )}
                        {isBot ? (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="m-0">{children}</p>,
                              ul: ({ children }) => <ul className="pl-4 my-1 list-disc">{children}</ul>,
                              ol: ({ children }) => <ol className="pl-4 my-1 list-decimal">{children}</ol>,
                              li: ({ children }) => <li className="my-0.5">{children}</li>,
                              strong: ({ children }) => <strong className="font-bold text-slate-950">{children}</strong>,
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          msg.content
                        )}

                        {isBot && (
                          msg.content.toLowerCase().includes('whatsapp') ||
                          msg.content.toLowerCase().includes('0859') ||
                          msg.content.toLowerCase().includes('admin') ||
                          msg.content.toLowerCase().includes('booking')
                        ) && (
                          <div className="mt-3 pt-2.5 border-t border-gray-100">
                            <a
                              href={buildWhatsAppAdminLink(buildWhatsAppConsultMessage(msg.content))}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] rounded-lg transition-colors shadow-sm shadow-emerald-600/10 w-full"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              Chat WhatsApp Admin
                            </a>
                          </div>
                        )}
                      </div>

                    </div>
                  )
                })}

                {/* Thinking Indicator */}
                {isLoading && (
                  <div className="flex gap-2.5 items-start max-w-[80%] animate-pulse">
                    <div className="w-7 h-7 bg-slate-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2 text-xs text-gray-500">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      <span>Hypermile AI sedang mengetik...</span>
                    </div>

                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts */}
              <div className="px-4 py-2 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto tabs-scrollbar scroll-smooth">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (prompt === 'Hubungi WhatsApp Admin') {
                        window.open(WHATSAPP_ADMIN_URL, '_blank')
                      } else {
                        handleSend(prompt)
                      }
                    }}
                    disabled={isLoading}
                    className="flex-shrink-0 text-[11px] bg-gray-100 hover:bg-rose-50 hover:text-rose-600 text-gray-600 px-3 py-1.5 rounded-full transition-all border border-gray-200 hover:border-rose-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Image Preview Area */}
              {attachedImage && (
                <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img src={attachedImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachedImage(null)}
                      className="absolute top-0.5 right-0.5 bg-black/70 hover:bg-black text-white p-0.5 rounded-full"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Foto kerusakan ditambahkan</span>
                </div>
              )}

              {/* Footer Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend(input)
                }}
                className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
              >
                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  id="chat-image-upload"
                  className="hidden"
                  onChange={handleImageChange}
                  disabled={isLoading}
                />
                <label
                  htmlFor="chat-image-upload"
                  className={`p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer flex items-center justify-center transition-colors ${
                    isLoading ? 'pointer-events-none opacity-50' : ''
                  }`}
                  title="Unggah Foto Kerusakan"
                >
                  <Camera className="w-4 h-4" />
                </label>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={attachedImage ? "Tambahkan pesan atau langsung kirim..." : "Ketik pertanyaan Kakak di sini..."}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs disabled:bg-gray-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || (!input.trim() && !attachedImage)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center transition-colors disabled:bg-gray-200 disabled:text-gray-400"
                  aria-label="Kirim"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Actions Launcher Row */}
        <div className="flex items-center gap-2">
          {/* Scroll to Top */}
          <AnimatePresence>
            {showScrollTop && (
              <motion.button
                key="scroll-top"
                initial={{ opacity: 0, scale: 0.5, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.5, x: 20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-white/95 backdrop-blur-sm p-3.5 rounded-full shadow-xl border border-gray-200 hover:bg-gray-50 hover:scale-110 transition-all flex items-center justify-center"
                aria-label="Scroll to top"
              >
                <ArrowUp size={18} className="text-gray-700" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Launcher Trigger Button */}
          <motion.button
            onClick={() => setIsOpen(!isOpen)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: 'backOut' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl relative overflow-hidden transition-all duration-300 ${
              isOpen
                ? 'bg-slate-900 border border-slate-800 shadow-slate-900/30'
                : 'bg-gradient-to-tr from-slate-950 via-rose-600 to-rose-500 shadow-rose-600/30'
            }`}
            aria-label="AI Chatbot"
          >
            {!isOpen && (
              <span className="absolute inset-0 bg-rose-500/20 rounded-full animate-ping pointer-events-none scale-125"></span>
            )}
            {isOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <MessageSquare className="w-7 h-7 text-white" />
            )}
          </motion.button>
        </div>
      </div>
    </>
  )
}
