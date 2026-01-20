import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

// GET: 문의 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const contactId = parseInt(id);

    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "문의를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Contact fetch error:", error);
    return NextResponse.json(
      { error: "문의 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PATCH: 읽음 처리
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const contactId = parseInt(id);
    const body = await request.json();

    const contact = await prisma.contact.update({
      where: { id: contactId },
      data: { isRead: body.isRead },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Contact update error:", error);
    return NextResponse.json(
      { error: "문의 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 문의 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const contactId = parseInt(id);

    await prisma.contact.delete({
      where: { id: contactId },
    });

    return NextResponse.json({ message: "문의가 삭제되었습니다." });
  } catch (error) {
    console.error("Contact deletion error:", error);
    return NextResponse.json(
      { error: "문의 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
