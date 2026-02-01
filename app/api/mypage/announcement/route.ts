import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/customerAuth";
import { prisma } from "@/lib/prisma";

const SETTING_KEY = "mypage_announcement";

// 활성화된 공지만 반환 (로그인 필요)
export async function GET() {
  try {
    const session = await getCustomerSession();
    if (!session) {
      return NextResponse.json(
        { error: "로그인이 필요합니다." },
        { status: 401 }
      );
    }

    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (!setting) {
      return NextResponse.json({ message: null });
    }

    const data = JSON.parse(setting.value);

    if (!data.isActive || !data.message) {
      return NextResponse.json({ message: null });
    }

    return NextResponse.json({ message: data.message });
  } catch (error) {
    console.error("Mypage announcement fetch error:", error);
    return NextResponse.json({ message: null });
  }
}
