/**
 * 네이버 지역 검색 API 프록시
 * GET /api/naver/local-search?q=검색어
 *
 * 네이버 개발자센터에서 애플리케이션 등록 후
 * 검색 API 사용 설정 및 Client ID/Secret 발급 필요.
 * 환경변수: NAVER_CLIENT_ID, NAVER_CLIENT_SECRET
 *
 * ※ 잠시 비활성화: 예식장 검색 UI 주석 처리에 맞춰 API도 503 반환
 */

import { NextRequest, NextResponse } from 'next/server';

const NAVER_LOCAL_API = 'https://openapi.naver.com/v1/search/local.json';

export interface NaverLocalItem {
  title: string;
  link: string;
  category: string;
  description: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

export async function GET(request: NextRequest) {
  // 예식장 검색 잠시 비활성화
  return NextResponse.json(
    { error: '예식장 검색은 잠시 비활성화되었습니다.' },
    { status: 503 }
  );

  /* 아래 구현은 복구 시 주석 해제
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: '검색어를 2자 이상 입력해주세요.' },
      { status: 400 }
    );
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('NAVER_CLIENT_ID or NAVER_CLIENT_SECRET is not set');
    return NextResponse.json(
      { error: '예식장 검색이 설정되지 않았습니다.' },
      { status: 503 }
    );
  }

  try {
    const url = new URL(NAVER_LOCAL_API);
    url.searchParams.set('query', q);
    url.searchParams.set('display', '10');
    url.searchParams.set('start', '1');
    url.searchParams.set('sort', 'random');

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret,
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data?.errorMessage || data?.error?.message || `네이버 API 오류 (${res.status})`;
      console.error('Naver local search error:', res.status, message, data);
      return NextResponse.json(
        { error: message },
        { status: res.status >= 500 ? 503 : 400 }
      );
    }

    const items: NaverLocalItem[] = (data.items || []).map((item: NaverLocalItem) => ({
      title: stripHtml(item.title),
      link: item.link || '',
      category: stripHtml(item.category || ''),
      description: stripHtml(item.description || ''),
      address: item.address || '',
      roadAddress: item.roadAddress || '',
      mapx: item.mapx || '',
      mapy: item.mapy || '',
    }));

    return NextResponse.json({ items, total: data.total ?? items.length });
  } catch (error) {
    console.error('Naver local search error:', error);
    return NextResponse.json(
      { error: '예식장 검색 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
  */
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}
