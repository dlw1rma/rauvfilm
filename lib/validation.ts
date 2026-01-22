/**
 * 입력 검증 유틸리티
 */

/**
 * 안전한 정수 파싱 (NaN 체크 및 범위 검증)
 */
export function safeParseInt(
  value: string | null | undefined,
  defaultValue: number,
  min: number = 1,
  max: number = 10000
): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) return defaultValue;
  if (parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

/**
 * 문자열 길이 제한
 */
export function sanitizeString(
  value: string | null | undefined,
  maxLength: number = 1000
): string {
  if (!value) return "";
  return value.substring(0, maxLength).trim();
}

/**
 * 이메일 형식 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * 전화번호 정규화 및 검증
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, "").substring(0, 20);
}

/**
 * URL 검증
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * 입력 길이 검증
 */
export function validateLength(
  value: string,
  min: number = 0,
  max: number = 10000
): boolean {
  return value.length >= min && value.length <= max;
}
