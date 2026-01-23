"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Instagram, Youtube, BookOpen } from "lucide-react";

const socialLinks = {
  instagram: "https://www.instagram.com/rauvfilm/",
  youtube: "https://www.youtube.com/@rauvfilm_Cine",
  blog: "https://blog.naver.com/rauvfilm",
};

const partnerLink = "https://www.instagram.com/lemegraphy_official/";

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
          <a
            href={partnerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] text-white font-medium transition-all duration-300 hover:border-accent hover:shadow-lg hover:shadow-accent/10"
          >
            르메그라피
          </a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center gap-6 mb-12"
        >
          <a
            href={socialLinks.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#888888] transition-all duration-300 hover:border-accent hover:text-accent"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" strokeWidth={1.5} />
          </a>
          <a
            href={socialLinks.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#888888] transition-all duration-300 hover:border-accent hover:text-accent"
            aria-label="YouTube"
          >
            <Youtube className="w-5 h-5" strokeWidth={1.5} />
          </a>
          <a
            href={socialLinks.blog}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center text-[#888888] transition-all duration-300 hover:border-accent hover:text-accent"
            aria-label="Blog"
          >
            <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          </a>
        </motion.div>

        {/* Divider */}
        <div className="border-t border-[#2a2a2a] mb-10" />

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

        {/* Legal Links */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center gap-6 text-xs text-[#666666] mb-8"
        >
          <Link href="/terms" className="hover:text-white transition-colors">
            이용약관
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            개인정보처리방침
          </Link>
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
