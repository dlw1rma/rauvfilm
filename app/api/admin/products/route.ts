/**
 * 관리자 - 상품 API
 * GET /api/admin/products - 목록
 * POST /api/admin/products - 생성
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
 * 상품 목록 조회
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const where: Record<string, unknown> = {};
    if (!includeInactive) {
      where.isActive = true;
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { price: 'asc' },
      include: {
        _count: {
          select: { bookings: true },
        },
      },
    });

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        priceFormatted: formatKRW(p.price),
        description: p.description,
        isActive: p.isActive,
        bookingCount: p._count.bookings,
        createdAt: p.createdAt,
      })),
    });
  } catch (error) {
    console.error('상품 목록 조회 오류:', error);
    return NextResponse.json(
      { error: '상품 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 상품 생성
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, price, description } = body;

    if (!name || !price) {
      return NextResponse.json(
        { error: '상품명과 가격을 입력해주세요.' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: parseInt(price),
        description: description || null,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        priceFormatted: formatKRW(product.price),
        description: product.description,
      },
    });
  } catch (error) {
    console.error('상품 생성 오류:', error);
    return NextResponse.json(
      { error: '상품 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
