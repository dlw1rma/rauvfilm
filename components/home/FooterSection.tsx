"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Instagram, Youtube, BookOpen } from "lucide-react";

const socialLinks = {
  instagram: "https://www.instagram.com/rauvfilm/",
  youtube: "https://www.youtube.com/@rauvfilm_Cine",
  blog: "https://blog.naver.com/rauvfilm",
};

const partnerLink = "http://leumewedding.com/";

// 스태거 애니메이션
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function FooterSection() {
  return (
    <footer className="py-16 md:py-20 px-4 bg-[#0a0a0a] border-t border-[#2a2a2a]">
      <div className="mx-auto max-w-4xl">
        {/* Partner Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="text-[#888888] text-sm mb-4">본식스냅 제휴업체</p>
          <motion.a
            href={partnerLink}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="inline-block px-6 py-3 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium transition-all duration-300 hover:border-accent hover:shadow-xl hover:shadow-accent/20"
          >
            르메그라피
          </motion.a>
        </motion.div>

        {/* Social Links with Hover Animation */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="flex justify-center gap-6 mb-12"
        >
          {[
            { href: socialLinks.instagram, icon: Instagram, label: "Instagram" },
            { href: socialLinks.youtube, icon: Youtube, label: "YouTube" },
            { href: socialLinks.blog, icon: BookOpen, label: "Blog" },
          ].map(({ href, icon: Icon, label }) => (
            <motion.a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#888888] transition-all duration-300 hover:border-accent hover:text-accent hover:shadow-lg hover:shadow-accent/20"
              aria-label={label}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
            </motion.a>
          ))}
        </motion.div>

        {/* Divider with Animation */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="border-t border-[#2a2a2a] mb-10 origin-center"
        />

        {/* Business Info */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-[#666666] text-xs md:text-sm space-y-2 mb-8"
        >
          <p>
            <span className="text-[#888888]">CEO:</span> Sehan Son
            <span className="mx-3">|</span>
            <span className="text-[#888888]">TEL:</span> 010-4512-3587
          </p>
          <p>
            <span className="text-[#888888]">E-mail:</span> rauvfilm@naver.com
            <span className="mx-3">|</span>
            <span className="text-[#888888]">Business No:</span> 728-10-02901
          </p>
        </motion.div>

        {/* Legal Links with Underline Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center gap-6 text-xs text-[#666666] mb-8"
        >
          {[
            { href: "/terms", label: "이용약관" },
            { href: "/guidelines", label: "규정안내" },
            { href: "/privacy", label: "개인정보처리방침" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="relative group"
            >
              <span className="group-hover:text-white transition-colors">{label}</span>
              <motion.span
                className="absolute -bottom-0.5 left-0 h-px bg-accent"
                initial={{ width: 0 }}
                whileHover={{ width: "100%" }}
                transition={{ duration: 0.3 }}
              />
            </Link>
          ))}
        </motion.div>

        {/* Copyright */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-[#555555] text-xs"
        >
          Copyright © 2026 라우브필름 All rights reserved.
        </motion.p>
      </div>
    </footer>
  );
}
