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
      {/* Chat Bubble Icon - Solid Black */}
      <svg
        className="w-5 h-5"
        fill="black"
        viewBox="0 0 24 24"
      >
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
      </svg>
      <span className="font-medium text-sm text-black">문의</span>
    </button>
  );
}
