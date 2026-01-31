/**
 * 출장비 조회 (공개 API)
 * GET /api/travel-fees?region=서울특별시&district=강남구&branch=서울점
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "";
  const district = searchParams.get("district") || "";
  const branch = searchParams.get("branch") || "서울점";

  if (!region) {
    return NextResponse.json({ fee: 0 });
  }

  try {
    // 1. 구/군 단위로 먼저 조회
    if (district) {
      const districtRule = await prisma.travelFeeRule.findFirst({
        where: { branch, region, district, isActive: true },
      });
      if (districtRule) {
        return NextResponse.json({ fee: districtRule.fee, matched: `${region} ${district}` });
      }
    }

    // 2. 시/도 단위로 조회
    const regionRule = await prisma.travelFeeRule.findFirst({
      where: { branch, region, district: null, isActive: true },
    });
    if (regionRule) {
      return NextResponse.json({ fee: regionRule.fee, matched: region });
    }

    return NextResponse.json({ fee: 0, matched: null });
  } catch (error) {
    console.error("출장비 조회 오류:", error);
    return NextResponse.json({ fee: 0 });
  }
}
