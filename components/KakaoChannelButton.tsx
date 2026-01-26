"use client";

import { motion } from "framer-motion";

export default function KakaoChannelButton() {
  const handleClick = () => {
    window.open("https://pf.kakao.com/_xlXAin/chat", "_blank");
  };

  return (
    <motion.button
      onClick={handleClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 300, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#FEE500] rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-shadow"
      aria-label="카카오톡 상담"
    >
      {/* 카카오톡 공식 로고 SVG */}
      <svg
        width="28"
        height="28"
        viewBox="0 0 256 256"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M128 36C70.562 36 24 74.238 24 121.449C24 151.535 43.463 177.976 72.717 193.129L63.887 227.459C62.976 230.949 66.969 233.727 70.039 231.768L111.089 205.141C116.577 205.768 122.219 206.098 128 206.098C185.438 206.098 232 167.86 232 120.649C232 73.438 185.438 36 128 36Z"
          fill="#3C1E1E"
        />
      </svg>
    </motion.button>
  );
}
