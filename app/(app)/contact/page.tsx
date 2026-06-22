"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Mail, Phone, MapPin, Send, Clock } from "lucide-react";
import emailjs from "@emailjs/browser";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Fungsi escape HTML agar simbol tidak corrupt
  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!;
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

      if (!serviceId || !templateId || !publicKey) {
        throw new Error("Missing EmailJS environment variables");
      }

      const templateParams = {
        name: escapeHtml(formData.name),
        email: escapeHtml(formData.email),
        subject: escapeHtml(formData.subject),
        message: escapeHtml(formData.message),
      };

      const result = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      if (result.status === 200) {
        toast.success("Pesan berhasil dikirim!");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setErrors({});
      } else {
        toast.error("Gagal mengirim pesan. Silakan coba lagi.");
      }
    } catch (error: any) {
      console.error("EmailJS Error:", error);
      toast.error("Terjadi kesalahan saat mengirim pesan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openGoogleMaps = () => {
    window.open("https://share.google/y07v8fMMZOCzb5xdw", "_blank");
  };

  return (
    <section id="contact" className="py-12 md:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-gray-900">
            Yuk Membangun Sesuatu yang Luar Biasa
          </h2>
          <p className="text-gray-700 max-w-2xl mx-auto text-sm md:text-base">
            Ingin tanya sesuatu atau berdiskusi mengenai kolaborasi? Kirimkan
            pesan kepada kami, dan kami akan merespons dalam 24 jam.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Info Contact */}
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-xl md:text-2xl font-bold text-gray-800">
                Detail Kontak Kami
              </h3>

              <div className="space-y-4">
                {/* Alamat Lengkap */}
                <motion.div
                  whileHover={{ y: -2 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-amber-300 transition-all cursor-pointer"
                  onClick={openGoogleMaps}
                >
                  <div className="p-2.5 rounded-lg bg-amber-300/20 text-amber-700">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <span className="text-gray-800 text-sm md:text-base font-bold block">
                      Alamat Lengkap
                    </span>
                    <p className="text-gray-700 text-sm mt-1 leading-relaxed">
                      Jl. Siranda Raya No.1b, Bancaan, Sidorejo Lor, Kec. Sidorejo, Kota Salatiga, Jawa Tengah 50714.
                    </p>
                    <div className="mt-2 text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1">
                      <span>Buka di Google Maps &rarr;</span>
                    </div>
                  </div>
                </motion.div>


                {/* Kontak & Reservasi */}
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Phone & WA */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-amber-300 transition-all cursor-pointer"
                    onClick={() => window.open("https://wa.me/6285900472233", "_blank")}
                  >
                    <div className="p-2.5 rounded-lg bg-amber-300/20 text-amber-700">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-800 text-sm font-bold block">
                        Kontak & Reservasi
                      </span>
                      <p className="text-gray-700 text-xs md:text-sm mt-1">
                        <strong>WhatsApp:</strong> 0859-0047-2233
                      </p>
                      <p className="text-gray-700 text-xs md:text-sm mt-0.5">
                        <strong>Telepon:</strong> (0298) 3435768
                      </p>
                    </div>
                  </motion.div>

                  {/* Email */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:border-amber-300 transition-all cursor-pointer"
                    onClick={() => window.open("mailto:hypermilebengkel@gmail.com", "_blank")}
                  >
                    <div className="p-2.5 rounded-lg bg-amber-300/20 text-amber-700">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <span className="text-gray-800 text-sm font-bold block">
                        Email Support
                      </span>
                      <p className="text-gray-700 text-xs md:text-sm mt-1 truncate">
                        hypermilebengkel@gmail.com
                      </p>
                      <p className="text-gray-600 text-xs mt-0.5">
                        Balasan dalam 24 jam
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Office Hours */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                Jam Operasional
              </h3>
              <div className="space-y-3">
                {[
                  { days: "Senin - Jumat", time: "07:30 - 16:30 WIB", status: "open" },
                  { days: "Sabtu", time: "07:30 - 15:30 WIB", status: "open" },
                  { days: "Minggu", time: "Tutup", status: "closed" },
                ].map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                    <span className="text-gray-800 text-sm font-medium">
                      {item.days}
                    </span>
                    <span className={`text-sm font-bold ${item.status === 'closed' ? 'text-red-500' : 'text-gray-700'}`}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>

          {/* Contact Form */}
          <motion.form
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            onSubmit={handleSubmit}
            className="bg-white p-6 md:p-8 rounded-xl shadow-lg border"
          >
            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6">
              Kirim Pesan
            </h3>

            <div className="space-y-4 md:space-y-5">
              <div className="grid md:grid-cols-2 gap-4 md:gap-5">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Nama *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nama Anda"
                    className={`w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border ${
                      errors.name
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-amber-300"
                    } focus:ring-2 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 text-sm md:text-base`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@domain.com"
                    className={`w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border ${
                      errors.email
                        ? "border-red-300 focus:ring-red-200"
                        : "border-gray-300 focus:ring-amber-300"
                    } focus:ring-2 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 text-sm md:text-base`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Subjek
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Subjek pesan Anda"
                  className="w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-amber-300 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 text-sm md:text-base"
                />
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                  Pesan *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Ceritakan proyek atau pertanyaan Anda..."
                  className={`w-full px-3 py-2 md:px-4 md:py-2.5 rounded-lg border ${
                    errors.message
                      ? "border-red-300 focus:ring-red-200"
                      : "border-gray-300 focus:ring-amber-300"
                  } focus:ring-2 focus:outline-none transition-all bg-white text-gray-900 placeholder-gray-400 text-sm md:text-base`}
                ></textarea>
                {errors.message && (
                  <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 md:px-6 md:py-3.5 bg-amber-400 hover:bg-amber-500 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all duration-300 ease-in-out shadow-lg hover:shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Mengirim...
                  </>
                ) : (
                  <>
                    <span>Kirim Pesan</span>
                    <Send className="w-3 h-3 md:w-4 md:h-4" />
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Google Maps Full Width Container */}
      <div className="section-full-width h-[400px] md:h-[500px] relative border-t border-gray-200 mt-16 overflow-hidden">
        <iframe
          src="https://maps.google.com/maps?q=Jl.%20Siranda%20Raya%20No.1b,%20Bancaan,%20Sidorejo%20Lor,%20Kec.%20Sidorejo,%20Kota%20Salatiga,%20Jawa%20Tengah%2050714&t=&z=16&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Hypermile Bodyworks Location Map"
          className="absolute inset-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
        ></iframe>
      </div>
    </section>
  );
}
