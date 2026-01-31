import { NextRequest, NextResponse } from "next/server";

/**
 * 장소 검색 API 프록시
 * 1차: 카카오 로컬 키워드 검색 (가장 정확)
 * 2차: 네이버 검색 API (local) - fallback
 * 3차: NCP Map Place API - fallback
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ items: [] });
  }

  // 1차: 카카오 로컬 키워드 검색
  const kakaoKey = (process.env.KAKAO_REST_API_KEY || "").replace(/^["']|["']$/g, "");

  if (kakaoKey) {
    try {
      const result = await searchKakaoLocal(query, kakaoKey);
      if (result.length > 0) {
        return NextResponse.json({ items: result });
      }
    } catch (error) {
      console.error("Kakao Local Search error:", error);
    }
  }

  // 2차: 네이버 검색 API (local search)
  const naverClientId = (process.env.NAVER_MAP_CLIENT_ID || "").replace(/^["']|["']$/g, "");
  const naverClientSecret = (process.env.NAVER_MAP_CLIENT_SECRET || "").replace(/^["']|["']$/g, "");

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

  // 3차: NCP Map Place API
  const keyId = (process.env.NAVER_NCP_APIGW_API_KEY_ID || "").replace(/^["']|["']$/g, "");
  const key = (process.env.NAVER_NCP_APIGW_API_KEY || "").replace(/^["']|["']$/g, "");

  if (keyId && key) {
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
    } catch (error) {
      console.error("NCP Place search error:", error);
    }
  }

  // 모든 API 실패 시
  console.error("장소 검색 실패: 사용 가능한 API 키가 없거나 모든 API가 실패했습니다. KAKAO_REST_API_KEY 환경변수를 설정해주세요.");
  return NextResponse.json({ items: [], error: "검색 API가 설정되지 않았습니다." });
}

/**
 * 카카오 로컬 키워드 검색 - 장소명 검색에 가장 정확
 */
async function searchKakaoLocal(
  query: string,
  apiKey: string,
): Promise<Array<{ title: string; address: string; roadAddress: string; mapx: string; mapy: string; category: string }>> {
  const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&size=10`;
  const res = await fetch(url, {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
  });

  if (!res.ok) {
    console.error("Kakao Local API error:", res.status, await res.text());
    return [];
  }

  const data = await res.json();
  const documents = data.documents || [];

  return documents.map(
    (doc: {
      place_name: string;
      address_name: string;
      road_address_name: string;
      x: string;
      y: string;
      category_group_name: string;
    }) => ({
      title: doc.place_name,
      address: doc.address_name || "",
      roadAddress: doc.road_address_name || "",
      mapx: doc.x,
      mapy: doc.y,
      category: doc.category_group_name || "",
    })
  );
}

/**
 * 네이버 검색 API (local) - fallback
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
    console.error("Naver Local API error:", res.status);
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
      title: item.title.replace(/<\/?b>/g, ""),
      address: item.address || "",
      roadAddress: item.roadAddress || "",
      mapx: item.mapx,
      mapy: item.mapy,
      category: item.category || "",
    })
  );
}
