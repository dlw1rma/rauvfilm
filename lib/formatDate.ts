/**
 * 날짜+시간을 "YYYY-MM-DD, 오전/오후 HH:MM" 형태로 포맷
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours < 12 ? "오전" : "오후";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hoursStr = String(hours).padStart(2, "0");

  return `${year}-${month}-${day}, ${ampm} ${hoursStr}:${minutes}`;
}

/**
 * 날짜만 "YYYY-MM-DD" 형태로 포맷
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 날짜를 "YYYY년 MM월 DD일 (요일)" 형태로 포맷
 */
export function formatDateKorean(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const dayName = DAY_NAMES[d.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayName})`;
}
