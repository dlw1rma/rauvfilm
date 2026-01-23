"use client";

export default function KakaoChannelButton() {
  const handleClick = () => {
    window.open("https://pf.kakao.com/_xlXAin/chat", "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#FFD700] text-black px-4 py-3 rounded-xl shadow-lg hover:brightness-95 hover:scale-105 transition-all"
      aria-label="카카오톡 상담"
    >
      <img
        src="/kaka.svg"
        alt="카카오톡"
        className="w-5 h-5"
      />
      <span className="font-medium text-sm text-black">문의</span>
    </button>
  );
}
