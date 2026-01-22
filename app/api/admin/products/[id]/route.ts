/**
 * 관리자 - 개별 상품 API
 * PUT /api/admin/products/[id] - 수정
 * DELETE /api/admin/products/[id] - 삭제/비활성화
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { formatKRW } from '@/lib/pricing';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  return !!adminSession?.value;
}

/**
 * 상품 수정
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);
    const body = await request.json();

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.price !== undefined) updateData.price = parseInt(body.price);
    if (body.description !== undefined) updateData.description = body.description || null;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      product: {
        id: updatedProduct.id,
        name: updatedProduct.name,
        price: updatedProduct.price,
        priceFormatted: formatKRW(updatedProduct.price),
        description: updatedProduct.description,
        isActive: updatedProduct.isActive,
      },
    });
  } catch (error) {
    console.error('상품 수정 오류:', error);
    return NextResponse.json(
      { error: '상품 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 상품 삭제 (비활성화)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const productId = parseInt(id);

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: '상품을 찾을 수 없습니다.' }, { status: 404 });
    }

    // 예약이 있는 상품은 비활성화만 가능
    if (product._count.bookings > 0) {
      await prisma.product.update({
        where: { id: productId },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        message: '연결된 예약이 있어 비활성화되었습니다.',
      });
    }

    // 예약이 없으면 삭제
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({
      success: true,
      message: '상품이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('상품 삭제 오류:', error);
    return NextResponse.json(
      { error: '상품 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
