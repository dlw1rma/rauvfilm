import { NextRequest, NextResponse } from "next/server";

// 네이버 클라우드 플랫폼(NCP) 지역검색 API 프록시
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }

  // 기존 NCP API Gateway 키 사용
  const keyId = process.env.NAVER_NCP_APIGW_API_KEY_ID;
  const key = process.env.NAVER_NCP_APIGW_API_KEY;

  if (!keyId || !key) {
    return NextResponse.json(
      { error: "네이버 API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    // NCP Map Place Search API 사용
    const url = `https://naveropenapi.apigw.ntruss.com/map-place/v1/search?query=${encodeURIComponent(query)}&coordinate=127.0,37.5`;
    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": keyId,
        "X-NCP-APIGW-API-KEY": key,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("NCP Place API error:", res.status, errorText);

      // NCP Place API 실패 시 fallback: NCP Geocode API로 주소 검색
      return await fallbackGeocode(query, keyId, key);
    }

    const data = await res.json();
    const places = data.places || [];
    const items = places.map(
      (place: {
        name: string;
        road_address: string;
        jibun_address: string;
        x: string;
        y: string;
        category: string;
      }) => ({
        title: place.name,
        address: place.jibun_address || "",
        roadAddress: place.road_address || "",
        mapx: place.x,
        mapy: place.y,
        category: place.category || "",
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Naver search error:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// Fallback: NCP Geocoding API로 주소 기반 검색
async function fallbackGeocode(
  query: string,
  keyId: string,
  key: string
): Promise<NextResponse> {
  try {
    const url = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": keyId,
        "X-NCP-APIGW-API-KEY": key,
      },
    });

    if (!res.ok) {
      console.error("NCP Geocode API error:", res.status);
      return NextResponse.json({ items: [] });
    }

    const data = await res.json();
    const addresses = data.addresses || [];
    const items = addresses.map(
      (addr: {
        roadAddress: string;
        jibunAddress: string;
        x: string;
        y: string;
      }) => ({
        title: addr.roadAddress || addr.jibunAddress,
        address: addr.jibunAddress || "",
        roadAddress: addr.roadAddress || "",
        mapx: addr.x,
        mapy: addr.y,
        category: "",
      })
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Geocode fallback error:", error);
    return NextResponse.json({ items: [] });
  }
}
