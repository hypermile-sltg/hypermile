'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Sparkles, Paintbrush, Wrench, CheckCircle2, Trophy, Clock, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AboutPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="bg-[#f8f9fa] text-gray-900 min-h-screen pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-gray-900 via-gray-950 to-red-950 text-white rounded-b-[40px] shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(220,38,38,0.15),transparent)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block bg-red-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-6">
              Tentang Hypermile Bodyworks
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              Restorasi Estetika & <br/>
              <span className="text-red-500">Proteksi Cat Premium</span>
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Kami adalah workshop spesialis perbaikan bodi (body repair), pengecatan oven berstandar premium, and perlindungan kaca nano ceramic coating yang berdedikasi menjaga penampilan mobil Anda tetap prima.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Brand Story Section */}
      <section className="container mx-auto px-4 md:px-8 py-20 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-gray-900 shadow-xl"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <img
              src="https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80"
              alt="Teknisi memoles mobil mewah"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">Cerita Kami</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-6 text-gray-900 leading-tight">
              Lahir dari Semangat Keindahan Otomotif
            </h2>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
              Didirikan dengan visi untuk menghadirkan kualitas restorasi bodi mobil setingkat pabrikan, Hypermile memadukan teknologi oven spray booth modern dengan keahlian tangan painter profesional.
            </p>
            <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">
              Kami memahami bahwa mobil bukan sekadar alat transportasi, melainkan aset berharga dan kebanggaan pemiliknya. Oleh karena itu, setiap detail pengerjaan mulai dari ketukan dempul yang presisi hingga tahap poles akhir (finishing) dilakukan dengan standar kontrol kualitas yang ketat.
            </p>
            <div className="grid grid-cols-3 gap-4 border-t border-gray-200 pt-6">
              <div>
                <p className="text-2xl md:text-3xl font-black text-red-600">5+</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Tahun Pengalaman</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-gray-900">4,000+</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Mobil Selesai</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-gray-900">100%</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Garansi Hasil</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="bg-white border-y border-gray-200/60 py-20">
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">Nilai Utama Kami</span>
            <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 text-gray-900">
              Pilar Kepercayaan Pelanggan
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              Kami memegang teguh standar profesionalisme tinggi dalam setiap aspek perbaikan estetika kendaraan Anda.
            </p>
          </div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: <Paintbrush className="h-6 w-6 text-red-600" />,
                title: "Presisi & Detil",
                desc: "Penyamaan warna cat menggunakan sistem komputerisasi premium demi menghindari belang warna antar-panel sasis."
              },
              {
                icon: <Shield className="h-6 w-6 text-red-600" />,
                title: "Proteksi Tangguh",
                desc: "Penggunaan material coating 9H+ berkualitas tinggi yang melindungi cat dari sinar UV, goresan halus, dan polusi jalanan."
              },
              {
                icon: <Wrench className="h-6 w-6 text-red-600" />,
                title: "Teknisi Tersertifikasi",
                desc: "Seluruh tim painter dan detailer memiliki lisensi serta pelatihan berkala di bidang restorasi bodi otomotif."
              }
            ].map((value, idx) => (
              <motion.div 
                key={idx} 
                className="p-8 rounded-3xl border border-gray-100 bg-[#f8f9fa] shadow-sm hover:shadow-md hover:border-red-600/20 transition duration-300"
                variants={fadeIn}
              >
                <div className="p-3 w-fit rounded-2xl bg-red-50 mb-6">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. Quality Facilities & Tech */}
      <section className="container mx-auto px-4 md:px-8 py-20 max-w-6xl">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase font-extrabold tracking-widest text-red-600">Fasilitas Workshop</span>
          <h2 className="text-3xl md:text-4xl font-extrabold mt-2 mb-4 text-gray-900">
            Fasilitas Standar Internasional
          </h2>
          <p className="text-gray-600 text-sm">
            Hasil pengerjaan bodi dan cat yang sempurna didukung oleh infrastruktur workshop modern yang kami miliki.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative group overflow-hidden rounded-3xl border-2 border-gray-900 shadow-lg aspect-video">
            <img
              src="https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800&auto=format&fit=crop&q=80"
              alt="Fasilitas Oven Spray Booth"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
                <CheckCircle2 className="h-4 w-4" /> Spray Oven Booth
              </span>
              <h4 className="text-lg font-bold">Ruang Oven Bebas Debu</h4>
              <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                Menjamin partikel debu luar tidak menempel pada permukaan cat basah, serta menghasilkan pengeringan cat yang matang merata di setiap sudut panel.
              </p>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-3xl border-2 border-gray-900 shadow-lg aspect-video">
            <img
              src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80"
              alt="Ruang Detailing Ber-AC"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs uppercase tracking-wider mb-1">
                <CheckCircle2 className="h-4 w-4" /> Dust-Free Coating Room
              </span>
              <h4 className="text-lg font-bold">Dedicated Detailing Bay</h4>
              <p className="text-gray-300 text-xs mt-1 leading-relaxed">
                Area khusus ber-AC dengan lampu sorot LED multi-angle yang memudahkan teknisi melihat baret mikro (swirl marks) saat proses paint correction dan aplikasi ceramic coating.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="bg-gradient-to-br from-red-600 to-amber-500 text-white rounded-3xl p-8 md:p-12 text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-[-100px] right-[-100px] w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">
            Ingin Mengembalikan Kilau Mobil Anda?
          </h2>
          <p className="text-white/90 text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Konsultasikan kondisi kerusakan bodi atau kebutuhan proteksi ceramic coating mobil Anda secara gratis dengan tim admin ahli kami.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild className="bg-black hover:bg-black/90 text-white px-8 py-3.5 font-bold rounded-xl shadow-lg transition">
              <Link href="/products">Lihat Paket & Harga</Link>
            </Button>
            <a 
              href="https://wa.me/6285900472233" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-white hover:bg-gray-150 text-red-600 px-8 py-3.5 font-bold rounded-xl shadow-lg transition flex items-center gap-2"
            >
              Hubungi via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
