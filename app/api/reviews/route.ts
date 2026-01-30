import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

// 플랫폼 enum을 sourceType으로 변환
function platformToSourceType(platform: string): string {
  switch (platform) {
    case "NAVER_BLOG": return "naver_blog";
    case "NAVER_CAFE": return "naver_cafe";
    case "INSTAGRAM": return "instagram";
    default: return "other";
  }
}

// GET: 리뷰 목록 조회 (관리자 등록 + 고객 제출 승인된 후기 통합)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const admin = searchParams.get("admin");

    // admin=true인 경우 관리자 인증 필수
    let reviewWhere: { isVisible?: boolean } = { isVisible: true };
    if (admin === "true") {
      const { requireAdminAuth } = await import("@/lib/auth");
      const authResponse = await requireAdminAuth(request);
      if (authResponse) {
        return authResponse;
      }
      reviewWhere = {};
    }

    // 1+2. 관리자 등록 리뷰 + 고객 승인 후기 병렬 조회
    const [adminReviews, approvedSubmissions] = await Promise.all([
      prisma.review.findMany({
        where: reviewWhere,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      }),
      prisma.reviewSubmission.findMany({
        where: {
          status: { in: ["APPROVED", "AUTO_APPROVED"] },
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
        orderBy: { createdAt: "desc" },
      }),
    ]);

    // ReviewSubmission을 Review 형태로 변환
    const customerReviews = approvedSubmissions.map((submission) => {
      // 작성자명은 블로그/카페에서 추출된 닉네임만 사용 (고객 이름 사용 안 함)
      const authorName = submission.author || null; // 블로그/카페에서 추출된 작성자만 사용

      return {
        id: submission.id + 100000, // ID 충돌 방지
        title: submission.title || "라우브필름 촬영 후기", // 추출된 제목 사용
        excerpt: submission.excerpt || null, // 추출된 내용 요약
        imageUrl: submission.imageUrl || null, // 추출된 썸네일
        sourceUrl: submission.reviewUrl,
        sourceType: platformToSourceType(submission.platform),
        author: authorName,
        order: 999, // 관리자 등록 후기 뒤에 표시
        isVisible: true,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        isCustomerReview: true, // 고객 후기 구분용
      };
    });

    // 통합 및 정렬 (관리자 후기 우선, 그 다음 고객 후기)
    const allReviews = [...adminReviews, ...customerReviews];

    const response = NextResponse.json({ reviews: allReviews });
    if (admin !== "true") {
      response.headers.set("Cache-Control", "public, s-maxage=600, stale-while-revalidate=1200");
    }
    return response;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "리뷰를 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 후기 URL에서 메타데이터 추출
async function fetchReviewMetadata(url: string): Promise<{
  title: string | null;
  excerpt: string | null;
  imageUrl: string | null;
  author: string | null;
}> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = await fetch(
      `${baseUrl}/api/reviews/fetch-thumbnail?url=${encodeURIComponent(url)}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.error('메타데이터 추출 실패:', response.status);
      return { title: null, excerpt: null, imageUrl: null, author: null };
    }

    const data = await response.json();
    return {
      title: data.title || null,
      excerpt: data.excerpt || null,
      imageUrl: data.thumbnailUrl || null,
      author: data.author || null,
    };
  } catch (error) {
    console.error('메타데이터 추출 오류:', error);
    return { title: null, excerpt: null, imageUrl: null, author: null };
  }
}

// POST: 리뷰 등록 (관리자만 가능)
export async function POST(request: NextRequest) {
  // 관리자 인증 필수
  const { requireAdminAuth } = await import("@/lib/auth");
  const authResponse = await requireAdminAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const body = await request.json();
    const { sourceUrl, sourceType, title, excerpt, author, imageUrl } = body;

    if (!sourceUrl) {
      return NextResponse.json(
        { error: "원본 URL은 필수입니다." },
        { status: 400 }
      );
    }

    // URL에서 메타데이터 자동 추출
    const metadata = await fetchReviewMetadata(sourceUrl);

    // 가장 큰 order 값 조회
    const maxOrder = await prisma.review.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    // sourceType 자동 감지 (URL 기반)
    let detectedSourceType = sourceType || "naver_blog";
    if (sourceUrl.includes("cafe.naver.com")) {
      detectedSourceType = "naver_cafe";
    } else if (sourceUrl.includes("blog.naver.com")) {
      detectedSourceType = "naver_blog";
    } else if (sourceUrl.includes("instagram.com")) {
      detectedSourceType = "instagram";
    }

    const review = await prisma.review.create({
      data: {
        title: title || metadata.title || "후기 제목",
        excerpt: excerpt || metadata.excerpt || null,
        sourceUrl,
        sourceType: detectedSourceType,
        author: author || metadata.author || null,
        imageUrl: imageUrl || metadata.imageUrl || null,
        order: (maxOrder?.order || 0) + 1,
        isVisible: true,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "리뷰 등록에 실패했습니다." },
      { status: 500 }
    );
  }
}
