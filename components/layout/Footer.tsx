"use client";

import { motion } from "framer-motion";
import { FaTiktok, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  const router = useRouter();

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
      href: "https://www.tiktok.com/@hypermile",
      color: "hover:bg-black hover:text-white",
      bg: "bg-black border border-white/10",
      name: "TikTok",
    },
    {
      icon: FaInstagram,
      href: "https://www.instagram.com/hypermile",
      color: "hover:bg-pink-600 hover:text-white",
      bg: "bg-gradient-to-r from-purple-500 to-pink-500",
      name: "Instagram",
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
                <div className="px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center gap-1.5">
                  <span className="text-lg font-extrabold tracking-wider text-gray-900">
                    HYPER<span className="text-red-600">MILE</span>
                  </span>
                </div>
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
