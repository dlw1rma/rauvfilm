"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function KakaoChannelButton() {
  const handleClick = () => {
    window.open("https://pf.kakao.com/_xlXAin/chat", "_blank");
  };

  return (
    <motion.a
      href="https://pf.kakao.com/_xlXAin/chat"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        e.preventDefault();
        handleClick();
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 shadow-lg hover:shadow-xl transition-shadow"
      aria-label="카카오톡 상담"
    >
      {/* 오른쪽 플로팅 버튼: public/kaka.svg 사용 */}
      <Image
        src="/kaka.svg"
        alt="카카오톡 상담"
        width={84}
        height={48}
        className="rounded-full"
      />
    </motion.a>
  );
}
