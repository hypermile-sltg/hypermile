'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Paintbrush, Sparkles, Shield, Wrench, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ServicesPage() {
  const services = [
    {
      icon: <Paintbrush className="h-7 w-7 text-red-600" />,
      title: "Cat Spray Booth & Body Repair",
      desc: "Pengecatan spray booth kedap debu dengan cat standar pabrik premium (Spies Hecker, Sikkens). Restorasi panel penyok, keropos, hingga accident repair berat.",
      img: "/service-paint.png",
      details: ["Cat Spray Booth Standar Pabrik", "Restorasi Panel Penyok/Keropos", "Teknologi Spray Booth Kedap Debu", "Garansi Warna Presisi"]
    },
    {
      icon: <Sparkles className="h-7 w-7 text-red-600" />,
      title: "Nano Ceramic & Detailing",
      desc: "3-step paint correction untuk menghilangkan baret halus (swirl mark), jamur bodi, ditutup dengan coating multi-layer 9H untuk proteksi permanen.",
      img: "/service-detailing.png",
      details: ["Multi-stage Paint Correction", "Nano Ceramic Coating 9H+", "Hydrophobic Effect (Daun Talas)", "Poles Kaca & Velg Menyeluruh"]
    },
    {
      icon: <Shield className="h-7 w-7 text-red-600" />,
      title: "Anti-Karat Sasis",
      desc: "Pelapisan cairan aspal / bitumen elastis pada kolong sasis mobil untuk mencegah korosi logam dari cipratan air hujan, lumpur, dan zat asam.",
      img: "/hero-car.png",
      details: ["Pelapis Bitumen Anti Karat", "Proteksi Sasis Kolong Mobil", "Tahan Gesekan Kerikil", "Daya Tahan hingga 5 Tahun"]
    },
    {
      icon: <Wrench className="h-7 w-7 text-red-600" />,
      title: "Custom Interior & Peredam",
      desc: "Upholstery penggantian jok kulit premium serta pemasangan peredam kabin mobil untuk meredam kebisingan dari luar dan ban.",
      img: "/service-interior.png",
      details: ["Upholstery Jok Kulit Custom", "Pemasangan Peredam Suara Kabin", "Restorasi Plafon & Karpet Dasar", "Material Premium & Rapi"]
    }
  ]

  return (
    <div className="bg-[#f8f9fa] text-gray-900 min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gray-900 via-gray-950 to-red-950 text-white rounded-b-[40px] shadow-2xl overflow-hidden mb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(220,38,38,0.15),transparent)] pointer-events-none" />
        <div className="container mx-auto px-4 md:px-8 text-center relative z-10 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-red-600 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-lg mb-6">
              Layanan Terbaik Kami
            </span>
            <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              Solusi Perawatan <br/>
              <span className="text-red-500">Auto Body Care & Painting</span>
            </h1>
            <p className="text-gray-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Dari perbaikan bodi penyok hingga pengecatan spray booth berstandar premium dan coating, kami memastikan mobil Anda kembali berkilau layaknya baru keluar dari showroom.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services List Section */}
      <section className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="space-y-16">
          {services.map((srv, idx) => (
            <motion.div
              key={idx}
              className={`flex flex-col lg:flex-row gap-12 items-center bg-white border border-gray-200/60 rounded-3xl p-8 shadow-sm hover:shadow-md transition duration-300 ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              {/* Image Container */}
              <div className="w-full lg:w-1/2 aspect-video relative rounded-2xl overflow-hidden border-2 border-gray-900 shadow-md">
                <Image
                  src={srv.img}
                  alt={srv.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>

              {/* Text / Info Content */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="p-3 w-fit rounded-2xl bg-red-50 mb-6">
                    {srv.icon}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">{srv.title}</h2>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-6">{srv.desc}</p>
                  
                  {/* Detailed Points */}
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {srv.details.map((detail, dIdx) => (
                      <li key={dIdx} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-600 flex-shrink-0" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-4 flex-wrap">
                  <Button
                    disabled
                    className="bg-red-600 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 opacity-60 cursor-not-allowed"
                  >
                    Pesan Sekarang <ChevronRight className="h-4 w-4" />
                  </Button>
                  <a
                    href="https://wa.me/6285900472233"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 font-bold rounded-xl transition"
                  >
                    Konsultasi WA
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="container mx-auto px-4 md:px-8 py-20 max-w-6xl text-center">
        <div className="bg-white border border-gray-200/60 rounded-3xl p-8 md:p-12 shadow-sm max-w-4xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Garansi Kepuasan Hasil 100%</h3>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Setiap pengerjaan layanan di workshop kami selalu melewati proses *Quality Control* yang ketat oleh kepala teknisi sebelum diserahkan kembali kepada Anda. Kami menjamin cat mobil Anda tahan lama dan presisi.
          </p>
        </div>
      </section>
    </div>
  )
}
