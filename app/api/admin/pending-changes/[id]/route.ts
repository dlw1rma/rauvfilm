/**
 * 관리자 - 예약글 수정 승인/거절 API
 * PUT /api/admin/pending-changes/[id]
 * DELETE /api/admin/pending-changes/[id]
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/encryption';
import { safeParseInt } from '@/lib/validation';

// 승인/거절 처리
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;
    const changeId = safeParseInt(id, 0, 1, 2147483647);
    if (changeId === 0) {
      return NextResponse.json(
        { error: '잘못된 ID입니다.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action, rejectReason } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: '유효하지 않은 액션입니다.' },
        { status: 400 }
      );
    }

    // 변경 요청 조회
    const pendingChange = await prisma.pendingChange.findUnique({
      where: { id: changeId },
    });

    if (!pendingChange) {
      return NextResponse.json(
        { error: '변경 요청을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    if (pendingChange.status !== 'PENDING') {
      return NextResponse.json(
        { error: '이미 처리된 변경 요청입니다.' },
        { status: 400 }
      );
    }

    if (action === 'approve') {
      // 승인: 변경사항을 예약에 적용
      const changes = JSON.parse(pendingChange.changes);
      const reservation = await prisma.reservation.findUnique({
        where: { id: pendingChange.reservationId },
      });

      if (!reservation) {
        return NextResponse.json(
          { error: '예약을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }

      // 업데이트 데이터 준비
      const updateData: Record<string, unknown> = {};

      // 전화번호 정규화 함수
      const normalizePhone = (phone: string | null | undefined): string | null => {
        if (!phone) return null;
        return phone.replace(/[^0-9]/g, '');
      };

      for (const [field, value] of Object.entries(changes)) {
        const change = value as { old: unknown; new: unknown };

        // 개인정보 필드는 암호화
        if (['author', 'brideName', 'groomName', 'productEmail', 'deliveryAddress'].includes(field)) {
          updateData[field] = change.new ? encrypt(String(change.new)) : null;
        } else if (['bridePhone', 'groomPhone', 'receiptPhone'].includes(field)) {
          // 전화번호는 마스킹되어 저장되므로, 원본 값을 가져와야 함
          // 하지만 여기서는 마스킹된 값만 있으므로, 실제로는 수정하지 않음
          // 개인정보 수정은 별도로 처리해야 함
          continue;
        } else if (field === 'depositName') {
          updateData[field] = change.new || null;
        } else if (['guestCount'].includes(field)) {
          updateData[field] = change.new ? parseInt(String(change.new)) : null;
        } else {
          updateData[field] = change.new;
        }
      }

      // 상품 변경 시 가격 재계산
      if (updateData.productType !== undefined) {
        const newProductType = updateData.productType as string;
        const getProductBasePrice = (pt: string | null): number => {
          switch (pt) {
            case '가성비형': return 340000;
            case '기본형': return 600000;
            case '시네마틱형': return 950000;
            default: return 0;
          }
        };

        const makeupShoot = updateData.makeupShoot !== undefined ? updateData.makeupShoot : reservation.makeupShoot;
        const paebaekShoot = updateData.paebaekShoot !== undefined ? updateData.paebaekShoot : reservation.paebaekShoot;
        const receptionShoot = updateData.receptionShoot !== undefined ? updateData.receptionShoot : reservation.receptionShoot;

        let additionalPrice = 0;
        if (makeupShoot) additionalPrice += 200000;
        if (paebaekShoot) additionalPrice += 50000;
        if (receptionShoot) additionalPrice += 50000;

        const basePrice = getProductBasePrice(newProductType);
        updateData.totalAmount = basePrice + additionalPrice;

        // 할인 재계산
        const depositAmount = reservation.depositAmount || 100000;
        let discountAmount = 0;

        // 신년할인 (가성비형 제외)
        const discountNewYear = updateData.discountNewYear !== undefined
          ? updateData.discountNewYear
          : reservation.discountNewYear;
        if (newProductType !== '가성비형' && discountNewYear) {
          discountAmount += 50000;
        }

        // 르메그라피 할인
        const mainSnapCompany = (updateData.mainSnapCompany !== undefined
          ? updateData.mainSnapCompany
          : reservation.mainSnapCompany) as string || '';
        const isLeme = mainSnapCompany.toLowerCase().includes('르메그라피') ||
                       mainSnapCompany.toLowerCase().includes('leme');
        if (isLeme && (newProductType === '기본형' || newProductType === '시네마틱형')) {
          discountAmount += 150000;
        }

        updateData.discountAmount = discountAmount;
        updateData.finalBalance = Math.max(
          0,
          (updateData.totalAmount as number) -
          depositAmount -
          discountAmount -
          (reservation.referralDiscount || 0) -
          (reservation.reviewDiscount || 0)
        );
      }

      // 트랜잭션으로 처리
      await prisma.$transaction([
        prisma.reservation.update({
          where: { id: pendingChange.reservationId },
          data: updateData as Parameters<typeof prisma.reservation.update>[0]['data'],
        }),
        prisma.pendingChange.update({
          where: { id: changeId },
          data: {
            status: 'APPROVED',
            reviewedBy: 'admin',
            reviewedAt: new Date(),
          },
        }),
      ]);

      return NextResponse.json({
        success: true,
        message: '변경 요청이 승인되었습니다.',
      });
    } else {
      // 거절
      if (!rejectReason) {
        return NextResponse.json(
          { error: '거절 사유를 입력해주세요.' },
          { status: 400 }
        );
      }

      await prisma.pendingChange.update({
        where: { id: changeId },
        data: {
          status: 'REJECTED',
          reviewedBy: 'admin',
          reviewedAt: new Date(),
          rejectReason,
        },
      });

      return NextResponse.json({
        success: true,
        message: '변경 요청이 거절되었습니다.',
      });
    }
  } catch (error) {
    console.error('변경 요청 처리 오류:', error);
    return NextResponse.json(
      { error: '변경 요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 변경 요청 삭제 (관리자)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 관리자 인증
    const authResponse = await requireAdminAuth(request);
    if (authResponse) {
      return authResponse;
    }

    const { id } = await params;
    const changeId = safeParseInt(id, 0, 1, 2147483647);
    if (changeId === 0) {
      return NextResponse.json(
        { error: '잘못된 ID입니다.' },
        { status: 400 }
      );
    }

    await prisma.pendingChange.delete({
      where: { id: changeId },
    });

    return NextResponse.json({
      success: true,
      message: '변경 요청이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('변경 요청 삭제 오류:', error);
    return NextResponse.json(
      { error: '변경 요청 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
