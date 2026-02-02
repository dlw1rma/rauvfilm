/**
 * 예식 후 안내 SMS 자동 발송 Cron API
 * GET /api/cron/post-wedding-sms
 *
 * Vercel Cron: 매일 UTC 01:00 (KST 10:00) 실행
 */

import { NextRequest, NextResponse } from "next/server";
import { sendPostWeddingSms } from "@/lib/cron/postWeddingSms";

function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn("[Cron] CRON_SECRET이 설정되지 않았습니다.");
    return true;
  }

  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") === cronSecret) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (!validateCronSecret(request)) {
    console.error("[Cron] 인증 실패");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("[Cron] 예식 후 안내 SMS 발송 작업 시작...");

  try {
    const result = await sendPostWeddingSms();

    console.log(`[Cron] 예식 후 안내 SMS 발송 완료: ${result.sentCount}건`);

    return NextResponse.json({
      success: result.success,
      message: `${result.sentCount}건의 예식 후 안내 SMS가 발송되었습니다.`,
      result: {
        sentCount: result.sentCount,
        processedIds: result.processedIds,
        errors: result.errors,
      },
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Cron] 예식 후 SMS 발송 오류:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류",
        executedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
