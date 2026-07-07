"use client";

import { motion } from "framer-motion";
import { FaTiktok, FaInstagram, FaYoutube } from "react-icons/fa";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

const Footer = () => {
  const pathname = usePathname();
  const router = useRouter();

  const [socials, setSocials] = useState({
    instagram: "https://www.instagram.com/hypermile_salatiga",
    tiktok: "https://www.tiktok.com/@hypermileofficial",
    youtube: "https://www.youtube.com/@hypermileautobodyworks",
  });

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "settings", "socials"),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSocials({
            instagram: data.instagram || "https://www.instagram.com/hypermile_salatiga",
            tiktok: data.tiktok || "https://www.tiktok.com/@hypermileofficial",
            youtube: data.youtube || "https://www.youtube.com/@hypermileautobodyworks",
          });
        }
      },
      (err) => {
        console.error("Error fetching socials in Footer:", err);
      }
    );
    return () => unsub();
  }, []);

  const handleLogoClick = () => {
    if (pathname !== "/") {
      router.push("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const socialMedia = [
    {
      icon: FaTiktok,
      href: socials.tiktok,
      color: "hover:bg-black hover:text-white",
      bg: "bg-black border border-white/10",
      name: "TikTok",
    },
    {
      icon: FaInstagram,
      href: socials.instagram,
      color: "hover:bg-pink-600 hover:text-white",
      bg: "bg-gradient-to-r from-purple-500 to-pink-500",
      name: "Instagram",
    },
    {
      icon: FaYoutube,
      href: socials.youtube,
      color: "hover:bg-red-600 hover:text-white",
      bg: "bg-red-600 border border-white/10",
      name: "YouTube",
    },
  ];

  return (
    <footer className="footer-container pt-12 text-gray-800 bg-[#f8f9fa] border-t border-gray-200">
      {/* Bagian konten footer */}
      <div className="w-full">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-start">
            {/* Kolom 1: Logo dan Deskripsi */}
            <div className="space-y-4">
              <div
                className="cursor-pointer flex items-center gap-2"
                onClick={handleLogoClick}
              >
                <Image
                  src="/hypermile2.png"
                  alt="Hypermile Logo"
                  width={180}
                  height={45}
                  className="object-contain h-11 w-auto"
                />
              </div>
              <p className="text-gray-600 text-sm">
                Premium Auto Body Works, Detailing, Paint Correction & Nano Ceramic Coating.
              </p>
            </div>

            {/* Kolom 3: Follow Us */}
            <div className="space-y-4 text-left md:text-right md:ml-auto order-last md:order-none">
              <h4 className="text-lg font-bold mb-2 text-gray-900">
                Follow Us
              </h4>
              <div className="flex justify-start md:justify-end space-x-3">
                {socialMedia.map((social, index) => (
                  <motion.a
                     key={index}
                     href={social.href}
                     target="_blank"
                     rel="noopener noreferrer"
                     whileHover={{ scale: 1.1 }}
                     whileTap={{ scale: 0.95 }}
                     className={`p-3 rounded-full text-white transition-all duration-300 flex items-center justify-center ${social.bg} ${social.color}`}
                     style={{ width: "44px", height: "44px" }}
                     aria-label={`Follow us on ${social.name}`}
                  >
                     <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Copyright */}
      <div className="bg-[#090d16] py-4 w-full">
        <div className="px-6 md:px-12 lg:px-20">
          <div className="flex justify-center items-center w-full">
            <p className="text-center text-xs text-gray-400" suppressHydrationWarning>
              © {new Date().getFullYear()} Hypermile Bodyworks. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
