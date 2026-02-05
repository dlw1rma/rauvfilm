import { NextRequest, NextResponse } from "next/server";

/**
 * 답변(Reply) 기능 비활성화 (2026년 2월 업데이트)
 *
 * 이전에는 관리자가 예약글에 답변을 달 수 있었으나,
 * 워크플로우 간소화를 위해 해당 기능이 제거되었습니다.
 *
 * 예약 확정은 이제 예약관리(Booking)에서 진행합니다.
 */

// 답변 등록 (비활성화됨)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: "답변 기능이 비활성화되었습니다. 예약 확정은 예약관리(Booking)에서 진행해주세요." },
    { status: 410 } // Gone - 리소스가 더 이상 사용 불가
  );
}

// 답변 삭제 (비활성화됨)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return NextResponse.json(
    { error: "답변 기능이 비활성화되었습니다." },
    { status: 410 }
  );
}
