import { NextRequest, NextResponse } from "next/server";

/**
 * 네이버 지도 장소 검색 API 프록시
 * 1차: 네이버 검색 API (local) - 장소명 검색에 강함
 * 2차: NCP Map Place API - fallback
 * 3차: NCP Geocode API - 주소 기반 fallback
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }

  // 1차: 네이버 검색 API (local search) - 장소명 검색에 가장 적합
  const naverClientId = (process.env.NAVER_MAP_CLIENT_ID || '').replace(/^["']|["']$/g, '');
  const naverClientSecret = (process.env.NAVER_MAP_CLIENT_SECRET || '').replace(/^["']|["']$/g, '');

  if (naverClientId && naverClientSecret) {
    try {
      const result = await searchNaverLocal(query, naverClientId, naverClientSecret);
      if (result.length > 0) {
        return NextResponse.json({ items: result });
      }
    } catch (error) {
      console.error("Naver Local Search error:", error);
    }
  }

  // 2차: NCP Map Place API
  const keyId = (process.env.NAVER_NCP_APIGW_API_KEY_ID || '').replace(/^["']|["']$/g, '');
  const key = (process.env.NAVER_NCP_APIGW_API_KEY || '').replace(/^["']|["']$/g, '');

  if (!keyId || !key) {
    return NextResponse.json(
      { error: "네이버 API 키가 설정되지 않았습니다." },
      { status: 500 }
    );
  }

  try {
    const url = `https://naveropenapi.apigw.ntruss.com/map-place/v1/search?query=${encodeURIComponent(query)}&coordinate=127.0,37.5`;
    const res = await fetch(url, {
      headers: {
        "X-NCP-APIGW-API-KEY-ID": keyId,
        "X-NCP-APIGW-API-KEY": key,
      },
    });

    if (res.ok) {
      const data = await res.json();
      const places = data.places || [];
      if (places.length > 0) {
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
      }
    }

    // 3차: NCP Geocode fallback
    return await fallbackGeocode(query, keyId, key);
  } catch (error) {
    console.error("Naver search error:", error);
    return NextResponse.json(
      { error: "검색 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 네이버 검색 API (local) - 장소명 검색에 가장 정확
 */
async function searchNaverLocal(
  query: string,
  clientId: string,
  clientSecret: string,
): Promise<Array<{ title: string; address: string; roadAddress: string; mapx: string; mapy: string; category: string }>> {
  const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=10&sort=comment`;
  const res = await fetch(url, {
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
  });

  if (!res.ok) {
    console.error("Naver Local API error:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const items = data.items || [];

  return items.map(
    (item: {
      title: string;
      address: string;
      roadAddress: string;
      mapx: string;
      mapy: string;
      category: string;
    }) => ({
      // 네이버 검색 API는 title에 <b> 태그를 포함하므로 제거
      title: item.title.replace(/<\/?b>/g, ""),
      address: item.address || "",
      roadAddress: item.roadAddress || "",
      mapx: item.mapx,
      mapy: item.mapy,
      category: item.category || "",
    })
  );
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
