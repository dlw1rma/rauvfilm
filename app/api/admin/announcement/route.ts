import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/auth";

const SETTING_KEY = "mypage_announcement";

// 현재 공지 조회
export async function GET(request: NextRequest) {
  const authResponse = await requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: SETTING_KEY },
    });

    if (!setting) {
      return NextResponse.json({ message: "", isActive: false });
    }

    const data = JSON.parse(setting.value);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Announcement fetch error:", error);
    return NextResponse.json(
      { error: "공지 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// 공지 등록/수정
export async function PUT(request: NextRequest) {
  const authResponse = await requireAdminAuth(request);
  if (authResponse) return authResponse;

  try {
    const body = await request.json();
    const { message, isActive } = body;

    if (typeof message !== "string" || typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "message(string)와 isActive(boolean)가 필요합니다." },
        { status: 400 }
      );
    }

    const value = JSON.stringify({ message: message.trim(), isActive });

    await prisma.systemSetting.upsert({
      where: { key: SETTING_KEY },
      update: { value },
      create: { key: SETTING_KEY, value },
    });

    return NextResponse.json({ success: true, message: message.trim(), isActive });
  } catch (error) {
    console.error("Announcement update error:", error);
    return NextResponse.json(
      { error: "공지 저장에 실패했습니다." },
      { status: 500 }
    );
  }
}
