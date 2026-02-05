/**
 * 개인정보 암호화/복호화 유틸리티
 * AES-256-GCM 사용
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // AES 블록 크기
const TAG_LENGTH = 16;

/**
 * 환경변수에서 암호화 키 가져오기 (필수)
 * 환경변수가 없으면 에러 발생
 */
function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key || key.trim() === '') {
    throw new Error(
      'ENCRYPTION_KEY 환경변수가 설정되지 않았습니다. ' +
      '.env 파일에 ENCRYPTION_KEY를 추가해주세요. ' +
      '생성 방법: openssl rand -hex 32 또는 node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
    );
  }
  
  if (key.length < 32) {
    console.warn(
      '⚠️  경고: ENCRYPTION_KEY가 너무 짧습니다. 최소 32자 이상의 랜덤 문자열을 권장합니다.'
    );
  }
  
  return key;
}

/**
 * 키에서 32바이트 키 생성
 */
function getKey(): Buffer {
  const key = getEncryptionKey();
  // 키를 32바이트로 변환 (SHA-256 해시 사용)
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * 개인정보 암호화
 * @param text 암호화할 텍스트
 * @returns 암호화된 문자열 (base64)
 */
export function encrypt(text: string | null | undefined): string | null {
  if (!text || text.trim() === '') {
    return null;
  }

  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const key = getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const tag = cipher.getAuthTag();

    // IV + 태그 + 암호화된 데이터를 결합
    const result = iv.toString('base64') + ':' + tag.toString('base64') + ':' + encrypted;
    return result;
  } catch (error) {
    console.error('암호화 오류:', error);
    // 암호화 실패 시 null 반환 (보안을 위해 평문 저장 대신 저장 실패 유도)
    // 호출하는 쪽에서 null 체크 후 처리해야 함
    return null;
  }
}

/**
 * 개인정보 복호화
 * @param encrypted 암호화된 문자열
 * @returns 복호화된 텍스트
 */
export function decrypt(encrypted: string | null | undefined): string | null {
  if (!encrypted || encrypted.trim() === '') {
    return null;
  }

  try {
    // 이미 복호화된 데이터인지 확인 (암호화 형식이 아닌 경우)
    if (!encrypted.includes(':')) {
      // 기존 평문 데이터 (마이그레이션 전 데이터)
      return encrypted;
    }

    const parts = encrypted.split(':');
    if (parts.length !== 3) {
      // 형식이 맞지 않으면 원본 반환
      return encrypted;
    }

    const iv = Buffer.from(parts[0], 'base64');
    const tag = Buffer.from(parts[1], 'base64');
    const encryptedText = parts[2];
    const key = getKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('복호화 오류:', error);
    // 복호화 실패 시 원본 반환 (기존 데이터 호환성)
    return encrypted;
  }
}

/**
 * 여러 필드를 한번에 암호화
 */
export function encryptFields(fields: Record<string, string | null | undefined>): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = encrypt(value);
  }
  return result;
}

/**
 * 여러 필드를 한번에 복호화
 */
export function decryptFields(fields: Record<string, string | null | undefined>): Record<string, string | null> {
  const result: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(fields)) {
    result[key] = decrypt(value);
  }
  return result;
}
