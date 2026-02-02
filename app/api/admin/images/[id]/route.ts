import { NextRequest, NextResponse } from 'next/server';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { validateSessionToken } from '@/lib/auth';

async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session');
  if (!adminSession?.value) return false;
  return validateSessionToken(adminSession.value);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // "event-snap" or "site"

    const imageId = parseInt(id);

    if (type === 'event-snap') {
      const image = await prisma.eventSnapImage.findUnique({ where: { id: imageId } });
      if (!image) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      // Cloudinary에서 삭제
      await deleteFromCloudinary(image.publicId);

      // DB에서 삭제
      await prisma.eventSnapImage.delete({ where: { id: imageId } });
    } else {
      const image = await prisma.siteImage.findUnique({ where: { id: imageId } });
      if (!image) {
        return NextResponse.json({ error: 'Image not found' }, { status: 404 });
      }

      await deleteFromCloudinary(image.publicId);
      await prisma.siteImage.delete({ where: { id: imageId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}

// 이미지 정보 업데이트
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: '관리자 로그인이 필요합니다.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const body = await request.json();

    const imageId = parseInt(id);

    if (type === 'event-snap') {
      const image = await prisma.eventSnapImage.update({
        where: { id: imageId },
        data: {
          title: body.title,
          alt: body.alt,
          order: body.order,
          isVisible: body.isVisible,
          isFeatured: body.isFeatured,
        },
      });
      return NextResponse.json({ success: true, image });
    } else {
      const image = await prisma.siteImage.update({
        where: { id: imageId },
        data: {
          title: body.title,
          alt: body.alt,
          isActive: body.isActive,
        },
      });
      return NextResponse.json({ success: true, image });
    }
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
