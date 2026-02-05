/**
 * API 응답 헬퍼 및 공통 유틸리티
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { validateSessionToken } from './auth';

// ===== 응답 헬퍼 =====

/**
 * 성공 응답
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * 에러 응답
 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/**
 * 인증 필요 에러
 */
export function unauthorizedResponse(message = '로그인이 필요합니다.') {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * 권한 없음 에러
 */
export function forbiddenResponse(message = '접근 권한이 없습니다.') {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * 찾을 수 없음 에러
 */
export function notFoundResponse(message = '요청한 리소스를 찾을 수 없습니다.') {
  return NextResponse.json({ error: message }, { status: 404 });
}

/**
 * 서버 에러
 */
export function serverErrorResponse(message = '서버 오류가 발생했습니다.') {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * 유효성 검증 에러
 */
export function validationErrorResponse(errors: Record<string, string>) {
  return NextResponse.json({ error: '입력값을 확인해주세요.', errors }, { status: 400 });
}

// ===== 인증 헬퍼 =====

/**
 * 관리자 인증 확인
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  return validateSessionToken(adminSession.value);
}

/**
 * 관리자 인증 필수 래퍼
 * 인증되지 않은 경우 401 응답 반환
 */
export async function requireAdmin(): Promise<NextResponse | null> {
  if (!(await isAdminAuthenticated())) {
    return unauthorizedResponse('관리자 로그인이 필요합니다.');
  }
  return null;
}

/**
 * 고객 세션 확인
 */
export async function getCustomerSession(): Promise<{
  reservationId: number;
  customerName: string;
  customerPhone: string;
  referralCode?: string;
} | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('customer_session');

  if (!sessionCookie?.value) return null;

  try {
    const decoded = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString('utf8'));

    // 만료 확인
    if (decoded.exp && decoded.exp < Date.now()) {
      return null;
    }

    return {
      reservationId: decoded.reservationId,
      customerName: decoded.customerName,
      customerPhone: decoded.customerPhone,
      referralCode: decoded.referralCode,
    };
  } catch {
    return null;
  }
}

/**
 * 고객 인증 필수 래퍼
 */
export async function requireCustomer(): Promise<{
  reservationId: number;
  customerName: string;
  customerPhone: string;
  referralCode?: string;
} | NextResponse> {
  const session = await getCustomerSession();
  if (!session) {
    return unauthorizedResponse('로그인이 필요합니다.');
  }
  return session;
}

// ===== 요청 파싱 헬퍼 =====

/**
 * 페이지네이션 파라미터 파싱
 */
export function parsePagination(searchParams: URLSearchParams): {
  page: number;
  limit: number;
  offset: number;
} {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * 정렬 파라미터 파싱
 */
export function parseSort(
  searchParams: URLSearchParams,
  allowedFields: string[],
  defaultField = 'createdAt',
  defaultOrder: 'asc' | 'desc' = 'desc'
): { field: string; order: 'asc' | 'desc' } {
  const field = searchParams.get('sortBy') || defaultField;
  const order = (searchParams.get('sortOrder') || defaultOrder) as 'asc' | 'desc';

  return {
    field: allowedFields.includes(field) ? field : defaultField,
    order: ['asc', 'desc'].includes(order) ? order : defaultOrder,
  };
}

/**
 * 검색 파라미터 파싱 (SQL 인젝션 방지)
 */
export function parseSearch(searchParams: URLSearchParams): string | null {
  const search = searchParams.get('search')?.trim();
  if (!search || search.length < 2 || search.length > 100) {
    return null;
  }
  // 특수 문자 제거
  return search.replace(/[<>'"%;()&+]/g, '');
}

// ===== 에러 로깅 =====

/**
 * API 에러 로깅
 */
export function logApiError(
  endpoint: string,
  error: unknown,
  context?: Record<string, unknown>
) {
  console.error(`[API Error] ${endpoint}:`, {
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    context,
    timestamp: new Date().toISOString(),
  });
}

// ===== 요청 유효성 검증 =====

/**
 * 필수 필드 검증
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): string[] {
  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missing.push(String(field));
    }
  }

  return missing;
}

/**
 * 필수 필드 검증 후 에러 응답
 */
export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[],
  fieldLabels?: Record<keyof T, string>
): NextResponse | null {
  const missing = validateRequiredFields(data, requiredFields);

  if (missing.length > 0) {
    const labels = missing.map(f => fieldLabels?.[f as keyof T] || f);
    return errorResponse(`필수 항목을 입력해주세요: ${labels.join(', ')}`);
  }

  return null;
}
