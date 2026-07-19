'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { ArrowUp, Bot, Send, X, Sparkles, MessageSquare, PhoneCall, Camera } from 'lucide-react'
import { FaInstagram, FaTiktok, FaYoutube } from 'react-icons/fa'
import { db } from '@/lib/firebase'
import { doc, onSnapshot } from 'firebase/firestore'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  image?: string // Base64 data URL
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBpxZPxpyA9nQU41s-T2YTTUEOUrv0IZAc'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'

const SYSTEM_INSTRUCTION = `Anda adalah "Hypermile AI Assistant", asisten kecerdasan buatan resmi untuk Hypermile Auto Bodyworks, sebuah workshop spesialis body repair & detailing premium yang berlokasi di Salatiga.
Tugas Anda adalah melayani pelanggan dengan ramah, komunikatif, profesional, dan cepat dalam bahasa Indonesia.

BATASAN PERTANYAAN (GUARDRAILS) - SANGAT PENTING:
- Anda HANYA boleh menjawab pertanyaan yang berkaitan dengan Hypermile Auto Bodyworks, layanan kami (body repair, cat oven/spray booth, poles bodi/premium paint polish, nano ceramic coating, detailing interior/eksterior), informasi bengkel (lokasi, kontak, jam buka, media sosial resmi), dan estimasi biaya perbaikan.
- Jika pelanggan mengajukan pertanyaan yang TIDAK berkaitan dengan layanan bengkel kami (seperti membantu PR matematika, coding, resep masakan, ramalan cuaca, curhat pribadi, atau hal umum lainnya), Anda WAJIB menolaknya dengan sopan dan halus. Katakan bahwa Anda adalah asisten khusus Hypermile Auto Bodyworks dan hanya dapat membantu menjawab hal-hal seputar perbaikan bodi atau detailing mobil.

KEMAMPUAN UTAMA:

1. Menentukan estimasi biaya perbaikan bodi mobil berdasarkan PRICELIST RESMI 2025 di bawah ini.
2. Menganalisis FOTO kerusakan bodi mobil yang diunggah oleh pelanggan, menentukan bagian panel mana yang rusak (misal: pintu depan penyok, bumper baret, dll.), dan mencocokkannya dengan Pricelist.

INFORMASI KATEGORI MOBIL:
- LUX (Luxury): Alphard, Vellfire, Mercedes-Benz, BMW, Lexus, Land Cruiser.
- MED (Medium): Innova, Civic, HRV, CRV, Fortuner, Pajero, Avanza Baru, Xpander.
- SML (Small): Brio, Agya, Ayla, Yaris, Jazz, Avanza Lama, Xenia, Wagon R.

INFORMASI WORKSHOP & LOKASI:
- Alamat Lengkap: Jl. Siranda Raya No.1b, Bancaan, Sidorejo Lor, Kec. Sidorejo, Kota Salatiga, Jawa Tengah 50714.
- Link Google Maps: https://share.google/y07v8fMMZOCzb5xdw (Berikan link ini jika pelanggan meminta navigasi atau peta lokasi).
- Kontak: WhatsApp 0859-0047-2233 | Telepon (0298) 3435768 | Email support: hypermilebengkel@gmail.com
- Jam Operasional:
  * Senin - Jumat: 07:30 - 16:30 WIB
  * Sabtu: 07:30 - 15:30 WIB
  * Minggu: Tutup

DAFTAR HARGA RESMI HYPERMILE (Estimasi 2025):
- Kategori Ganti & Cat Panel Baru (BP):
  * Ganti & Cat Kap Mesin: LUX: Rp 1.809.561 | MED: Rp 1.689.811 | SML: Rp 1.448.980
  * Ganti & Cat Bumper Depan/Belakang: LUX: Rp 1.252.204 | MED: Rp 1.162.761 | SML: Rp 1.073.318
  * Ganti & Cat Fender Kanan/Kiri: LUX: Rp 1.341.648 | MED: Rp 1.252.204 | SML: Rp 1.162.761
  * Ganti & Cat Pintu Depan/Belakang (Kanan/Kiri): LUX: Rp 1.341.648 | MED: Rp 1.252.204 | SML: Rp 1.162.761
  * Ganti & Cat Pintu Bagasi: LUX: Rp 1.341.648 | MED: Rp 1.252.204 | SML: Rp 1.162.761
  * Ganti & Cat Lambung Kanan/Kiri: LUX: Rp 2.217.600 | MED: Rp 1.995.840 | SML: Rp 1.774.080
  * Ganti & Cat Triplang Kanan/Kiri: LUX: Rp 739.200 | MED: Rp 665.280 | SML: Rp 591.360
  * Ganti & Cat Kabin Atas: LUX: Rp 2.365.440 | MED: Rp 2.217.600 | SML: Rp 2.069.760
  * Ganti Grill: LUX: Rp 487.872 | MED: Rp 306.028 | SML: Rp 267.590
  * Ganti & Cat Bullhead Unit: LUX: Rp 983.875 | MED: Rp 894.432 | SML: Rp 804.988
  * Ganti & Cat Crosmember: LUX: Rp 715.545 | MED: Rp 626.102 | SML: Rp 536.659
  * Ganti & Cat Towing Hook Depan/Belakang: LUX: Rp 107.331 | MED: Rp 89.443 | SML: Rp 71.554
  * Ganti & Cat Cover Spion Kanan/Kiri: LUX: Rp 393.550 | MED: Rp 357.772 | SML: Rp 321.995
  * Ganti & Cat Mudguard Kanan/Kiri: LUX: Rp 143.109 | MED: Rp 125.220 | SML: Rp 107.331
  * Ganti & Cat Protektor Depan/Belakang (Kanan/Kiri): LUX: Rp 304.106 | MED: Rp 268.329 | SML: Rp 232.552
  * Ganti & Cat Handle Pintu Depan/Belakang (Kanan/Kiri): LUX: Rp 304.106 | MED: Rp 268.329 | SML: Rp 232.552
  * Ganti & Cat Tutup Tangki Bensin: LUX: Rp 393.550 | MED: Rp 357.772 | SML: Rp 321.995
  * Ganti & Cat Lower Bumper Depan/Belakang: LUX: Rp 715.545 | MED: Rp 626.102 | SML: Rp 536.659
  * Ganti & Cat Spoiler Atas: LUX: Rp 715.545 | MED: Rp 626.102 | SML: Rp 536.659
  * Ganti Kaca Depan/Belakang: LUX: Rp 1.341.648 | MED: Rp 1.252.204 | SML: Rp 1.162.761
  * Ganti Kaca Segitiga Kanan/Kiri: LUX: Rp 357.772 | MED: Rp 321.995 | SML: Rp 286.218
  * Ganti Kaca Depan/Belakang Kanan/Kiri (per kaca samping): LUX: Rp 178.886 | MED: Rp 160.997 | SML: Rp 143.109
  * Ganti Kaca Quarter Kanan/Kiri: LUX: Rp 536.659 | MED: Rp 447.216 | SML: Rp 357.772

- Kategori Ketok & Cat Panel Rusak/Penyok (BPK):
  * Ketok & Cat Kap Mesin: LUX: Rp 2.012.472 | MED: Rp 1.878.307 | SML: Rp 1.744.142
  * Ketok & Cat Kap Bagasi / Pintu Bagasi: LUX: Rp 1.536.057 | MED: Rp 1.445.875 | SML: Rp 1.250.726
  * Ketok & Cat Bumper Depan/Belakang: LUX: Rp 1.355.692 | MED: Rp 1.265.510 | SML: Rp 1.175.328
  * Ketok & Cat Fender Kanan/Kiri: LUX: Rp 1.536.057 | MED: Rp 1.445.875 | SML: Rp 1.355.692
  * Ketok & Cat Pintu Depan/Belakang (Kanan/Kiri): LUX: Rp 1.536.057 | MED: Rp 1.445.875 | SML: Rp 1.355.692
  * Ketok & Cat Lambung Kanan/Kiri: LUX: Rp 1.536.057 | MED: Rp 1.445.875 | SML: Rp 1.355.692
  * Ketok & Cat Triplang Kanan/Kiri: LUX: Rp 813.120 | MED: Rp 722.937 | SML: Rp 632.755
  * Ketok & Cat Kabin Atas: LUX: Rp 2.365.440 | MED: Rp 2.069.760 | SML: Rp 1.774.080
  * Ketok & Cat Grill: LUX: Rp 517.440 | MED: Rp 447.216 | SML: Rp 411.438
  * Ketok & Cat Bullhead Unit: LUX: Rp 116.276 | MED: Rp 1.073.318 | SML: Rp 983.875
  * Ketok & Cat Crosmember: LUX: Rp 813.120 | MED: Rp 722.937 | SML: Rp 632.755
  * Ketok & Cat Lisplang Kanan/Kiri: LUX: Rp 813.120 | MED: Rp 722.937 | SML: Rp 632.755
  * Ketok & Cat Towing Hook Depan/Belakang: LUX: Rp 127.142 | MED: Rp 109.401 | SML: Rp 90.182
  * Ketok & Cat Cover Spion Kanan/Kiri: LUX: Rp 487.872 | MED: Rp 452.390 | SML: Rp 415.430
  * Ketok & Cat Mudguard Kanan/Kiri: LUX: Rp 181.843 | MED: Rp 162.624 | SML: Rp 144.883
  * Ketok & Cat Protektor Depan/Belakang Kanan/Kiri: LUX: Rp 397.689 | MED: Rp 362.208 | SML: Rp 340.032
  * Ketok & Cat Handle Pintu Kanan/Kiri: LUX: Rp 397.689 | MED: Rp 362.208 | SML: Rp 340.032
  * Ketok & Cat Tutup Tangki Bensin: LUX: Rp 487.872 | MED: Rp 452.390 | SML: Rp 416.908
  * Ketok & Cat Lower Depan/Belakang: LUX: Rp 813.120 | MED: Rp 722.937 | SML: Rp 632.755
  * Ketok & Cat Sparkboard Kanan/Kiri: LUX: Rp 578.054 | MED: Rp 547.008 | SML: Rp 507.091
  * Ketok & Cat Foot Step Depan Kanan/Kiri: LUX: Rp 578.054 | MED: Rp 547.008 | SML: Rp 507.091
  * Ketok & Cat Pilar Kaca Depan Kanan/Kiri: LUX: Rp 669.715 | MED: Rp 632.755 | SML: Rp 597.273
  * Ketok & Cat Pilar Pintu Kanan/Kiri: LUX: Rp 1.626.240 | MED: Rp 1.536.057 | SML: Rp 1.445.875
  * Ketok & Cat Pilar Kaca Belakang Kanan/Kiri: LUX: Rp 669.715 | MED: Rp 632.755 | SML: Rp 597.273
  * Ketok & Cat Velg Depan/Belakang (Kanan/Kiri): LUX: Rp 632.755 | MED: Rp 547.008 | SML: Rp 452.390
  * Tarik Bodi Ringan: LUX: Rp 739.200 | MED: Rp 591.360 | SML: Rp 443.520
  * Tarik Bodi Medium: LUX: Rp 1.988.448 | MED: Rp 1.808.083 | SML: Rp 1.626.240
  * Tarik Bodi Berat: LUX: Rp 3.799.488 | MED: Rp 3.614.688 | SML: Rp 3.437.280

ATURAN ESTIMASI FOTO & HARGA:
1. Jika pelanggan mengunggah foto, analisis kerusakan tersebut (baret/penyok/pecah) dan tentukan bagian mobil mana yang terkena.
2. Tanyakan kategori/tipe mobil pelanggan (Small, Medium, atau Luxury) jika mereka belum menyebutkannya, agar Anda bisa memberikan estimasi harga yang akurat sesuai daftar di atas.
3. Sebutkan bahwa estimasi ini bersifat awal berdasarkan foto. Untuk inspeksi fisik secara mendetail dan pembuatan janji booking, arahkan pelanggan untuk mengeklik tombol "Chat WhatsApp Admin" di bawah pesan ini. JANGAN menuliskan digit nomor telepon/WhatsApp (seperti 0859-0047-2233) secara langsung untuk mencegah pesan terpotong oleh filter keamanan otomatis Google.
4. Jawablah dengan sangat ramah, santai, singkat, padat, dan langsung ke intinya (maksimal 2-3 paragraf pendek saja). Jangan bertele-tele atau menulis banyak basa-basi agar chat mudah dibaca dengan cepat di layar HP. Gunakan poin-poin sederhana untuk struktur harga jika diperlukan.
5. JANGAN menuliskan teks kaku seperti "Rekomendasi Langkah Selanjutnya:", "Status:", atau label penutup formal lainnya.
6. HINDARI menuliskan kembali seluruh daftar mobil contoh secara persis (kata demi kata) dari instruksi sistem ini agar tidak memicu filter keamanan salinan (recitation check) dari sistem Google. Buatlah variasi penjelasan sendiri secara alami.`



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

    // Formating history for Gemini: map assistant -> model, user -> user
    const contents = newMessages.map((msg) => {
      const parts: any[] = []
      if (msg.image) {
        try {
          const mimeType = msg.image.split(';')[0].split(':')[1]
          const base64Data = msg.image.split(',')[1]
          parts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          })
        } catch (e) {
          console.error('Error parsing base64 image data:', e)
        }
      }
      parts.push({ text: msg.content })
      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: parts,
      }
    })

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: contents,
          systemInstruction: {
            parts: [
              {
                text: `${SYSTEM_INSTRUCTION}

TAUTAN SOSIAL MEDIA RESMI HYPERMILE AUTO BODYWORKS:
- Instagram: ${socials.instagram}
- TikTok: ${socials.tiktok}
- YouTube: ${socials.youtube}
(Gunakan tautan di atas jika pelanggan bertanya tentang Instagram, TikTok, YouTube, atau media sosial kami).`
              }
            ],
          },
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
            topK: 1,
            topP: 0.8,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],

        }),

      })

      if (!response.ok) {
        throw new Error('Gagal mendapatkan respon dari AI.')
      }

      const data = await response.json()
      console.log('Gemini API Response:', data)
      const botResponse = data.candidates?.[0]?.content?.parts
        ?.map((part: any) => part.text || '')
        .join('') || 'Maaf, saya tidak dapat memahami pesan tersebut.'

      setMessages((prev) => [...prev, { role: 'assistant', content: botResponse }])
    } catch (error) {
      console.error('Gemini API Error:', error)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Maaf, ada gangguan koneksi dengan server AI. Silakan coba lagi atau hubungi langsung admin kami via WhatsApp.',
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
                        href={`https://wa.me/6285900472233?text=${encodeURIComponent(
                          'Halo Admin Hypermile, saya tertarik untuk bertanya dan berkonsultasi mengenai perbaikan bodi mobil saya.'
                        )}`}
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
                              href={`https://wa.me/6285900472233?text=${encodeURIComponent(
                                `Halo Admin Hypermile, saya ingin berkonsultasi lebih lanjut mengenai estimasi perbaikan dari AI berikut ini:\n\n${msg.content}`
                              )}`}
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
                        window.open('https://wa.me/6285900472233', '_blank')
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
