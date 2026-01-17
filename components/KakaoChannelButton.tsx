"use client";

export default function KakaoChannelButton() {
  const handleClick = () => {
    window.open("https://pf.kakao.com/_xlXAin/chat", "_blank");
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform bg-[#FEE500] flex items-center justify-center"
      aria-label="카카오톡 상담"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        className="w-8 h-8"
      >
        <path
          fill="#3C1E1E"
          d="M128 36C70.562 36 24 72.713 24 118c0 29.279 19.466 54.97 48.748 69.477-1.593 5.494-10.237 35.344-10.581 37.689 0 0-.207 1.762.934 2.434s2.483.15 2.483.15c3.272-.457 37.943-24.811 43.944-29.036 5.995.849 12.168 1.286 18.472 1.286 57.438 0 104-36.712 104-82 0-45.287-46.562-82-104-82z"
        />
      </svg>
    </button>
  );
}
