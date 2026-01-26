import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { safeParseInt, sanitizeString, isValidUrl } from "@/lib/validation";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET: 리뷰 상세 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const reviewId = safeParseInt(id, 0, 1, 2147483647);
    if (reviewId === 0) {
      return NextResponse.json(
        { error: "잘못된 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    // ID가 100000 이상이면 고객 후기(ReviewSubmission)
    if (reviewId >= 100000) {
      const submissionId = reviewId - 100000;
      const submission = await prisma.reviewSubmission.findUnique({
        where: { id: submissionId },
        include: {
          reservation: {
            select: {
              author: true,
              brideName: true,
              groomName: true,
            },
          },
        },
      });

      if (!submission) {
        return NextResponse.json(
          { error: "리뷰를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      // Review 형태로 변환
      // 작성자명은 블로그/카페에서 추출된 닉네임만 사용 (고객 이름 사용 안 함)
      const authorName = submission.author || null;

      const review = {
        id: reviewId,
        title: submission.title || "라우브필름 촬영 후기",
        excerpt: submission.excerpt || null,
        imageUrl: submission.imageUrl || null,
        sourceUrl: submission.reviewUrl,
        sourceType: submission.platform === "NAVER_BLOG" ? "naver_blog" : submission.platform === "NAVER_CAFE" ? "naver_cafe" : "instagram",
        author: authorName,
        order: 999,
        isVisible: true,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        isCustomerReview: true,
      };

      return NextResponse.json(review);
    }

    // 관리자 등록 후기
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { error: "리뷰를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error fetching review:", error);
    return NextResponse.json(
      { error: "리뷰 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

// PUT: 리뷰 수정 (관리자만 가능)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { id } = await params;
    const reviewId = safeParseInt(id, 0, 1, 2147483647);
    if (reviewId === 0) {
      return NextResponse.json(
        { error: "잘못된 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, excerpt, sourceUrl, sourceType, author, isVisible, order, imageUrl } = body;

    // 입력 검증
    if (sourceUrl && !isValidUrl(sourceUrl)) {
      return NextResponse.json(
        { error: "올바른 URL 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // ID가 100000 이상이면 고객 후기(ReviewSubmission) 수정
    if (reviewId >= 100000) {
      const submissionId = reviewId - 100000;
      
      // sourceType을 platform enum으로 변환
      let platform: "NAVER_BLOG" | "NAVER_CAFE" | "INSTAGRAM" = "NAVER_BLOG";
      if (sourceType === "naver_cafe") {
        platform = "NAVER_CAFE";
      } else if (sourceType === "instagram") {
        platform = "INSTAGRAM";
      }

      // sourceUrl이 변경되면 메타데이터 자동 추출
      let finalTitle = title;
      let finalExcerpt = excerpt;
      let finalImageUrl = imageUrl;
      let finalAuthor = author;

      if (sourceUrl) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
          const metadataRes = await fetch(
            `${baseUrl}/api/reviews/fetch-thumbnail?url=${encodeURIComponent(sourceUrl)}`,
            { cache: 'no-store' }
          );
          
          if (metadataRes.ok) {
            const metadata = await metadataRes.json();
            if (!finalTitle && metadata.title) finalTitle = metadata.title;
            if (!finalExcerpt && metadata.excerpt) finalExcerpt = metadata.excerpt;
            if (!finalImageUrl && metadata.thumbnailUrl) finalImageUrl = metadata.thumbnailUrl;
            if (!finalAuthor && metadata.author) finalAuthor = metadata.author;
          }
        } catch (error) {
          console.error("메타데이터 추출 오류:", error);
        }
      }

      const submission = await prisma.reviewSubmission.update({
        where: { id: submissionId },
        data: {
          ...(finalTitle && { title: sanitizeString(finalTitle, 200) }),
          ...(finalExcerpt !== undefined && { excerpt: finalExcerpt ? sanitizeString(finalExcerpt, 1000) : null }),
          ...(sourceUrl && { reviewUrl: sanitizeString(sourceUrl, 2000) }),
          ...(sourceType && { platform }),
          ...(finalAuthor !== undefined && { author: finalAuthor || null }),
          ...(finalImageUrl !== undefined && { imageUrl: finalImageUrl || null }),
        },
        include: {
          reservation: {
            select: {
              author: true,
              brideName: true,
              groomName: true,
            },
          },
        },
      });

      // Review 형태로 변환하여 반환
      // 작성자명은 블로그/카페에서 추출된 닉네임만 사용 (고객 이름 사용 안 함)
      const authorName = submission.author || null;

      const review = {
        id: reviewId,
        title: submission.title || "라우브필름 촬영 후기",
        excerpt: submission.excerpt || null,
        imageUrl: submission.imageUrl || null,
        sourceUrl: submission.reviewUrl,
        sourceType: submission.platform === "NAVER_BLOG" ? "naver_blog" : submission.platform === "NAVER_CAFE" ? "naver_cafe" : "instagram",
        author: authorName,
        order: 999,
        isVisible: true,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        isCustomerReview: true,
      };

      return NextResponse.json(review);
    }

    // 관리자 등록 후기 수정
    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(title && { title: sanitizeString(title, 200) }),
        ...(excerpt !== undefined && { excerpt: excerpt ? sanitizeString(excerpt, 1000) : null }),
        ...(sourceUrl && { sourceUrl: sanitizeString(sourceUrl, 2000) }),
        ...(sourceType && { sourceType }),
        ...(author !== undefined && { author }),
        ...(typeof isVisible === "boolean" && { isVisible }),
        ...(typeof order === "number" && { order }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json(
      { error: "리뷰 수정에 실패했습니다." },
      { status: 500 }
    );
  }
}

// DELETE: 리뷰 삭제 (관리자만 가능)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const { id } = await params;
    const reviewId = safeParseInt(id, 0, 1, 2147483647);
    if (reviewId === 0) {
      return NextResponse.json(
        { error: "잘못된 리뷰 ID입니다." },
        { status: 400 }
      );
    }

    // ID가 100000 이상이면 고객 후기(ReviewSubmission) 삭제
    if (reviewId >= 100000) {
      const submissionId = reviewId - 100000;
      
      await prisma.reviewSubmission.delete({
        where: { id: submissionId },
      });

      return NextResponse.json({ message: "고객 후기가 삭제되었습니다." });
    }

    // 관리자 등록 후기 삭제
    await prisma.review.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({ message: "리뷰가 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      { error: "리뷰 삭제에 실패했습니다." },
      { status: 500 }
    );
  }
}
