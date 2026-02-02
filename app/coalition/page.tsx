import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "제휴 안내 | 라우브필름",
  description: "라우브필름과 함께하는 제휴 파트너를 소개합니다.",
  openGraph: {
    title: "제휴 안내 | 라우브필름",
    description: "라우브필름과 함께하는 제휴 파트너를 소개합니다.",
  },
};

async function getCoalitionImage() {
  try {
    const image = await prisma.siteImage.findFirst({
      where: {
        category: "coalition",
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        secureUrl: true,
        alt: true,
        width: true,
        height: true,
      },
    });
    return image;
  } catch (error) {
    console.error("Failed to fetch coalition image:", error);
    return null;
  }
}

export default async function CoalitionPage() {
  const coalitionImage = await getCoalitionImage();
  const lemeGraphyUrl = "http://leumewedding.com/"; // 르메그라피 링크

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-widest">제휴 안내</h1>
          <p className="text-lg text-muted-foreground">
            라우브필름과 함께하는 파트너사를 소개합니다
          </p>
        </div>

        {/* 제휴사 이미지 - 이미지 비율에 맞춰 박스 조절, 잘리지 않게 표시 */}
        {coalitionImage && (
          <div className="mb-12">
            <a
              href={lemeGraphyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full max-w-full rounded-xl overflow-hidden bg-muted border border-border hover:shadow-lg transition-shadow cursor-pointer"
            >
              {coalitionImage.width && coalitionImage.height ? (
                <Image
                  src={coalitionImage.secureUrl}
                  alt={coalitionImage.alt || "제휴사 이미지"}
                  width={coalitionImage.width}
                  height={coalitionImage.height}
                  className="w-full h-auto object-contain"
                  sizes="(max-width: 896px) 100vw, 896px"
                  priority
                />
              ) : (
                <span className="block relative w-full" style={{ aspectRatio: "16/9" }}>
                  <Image
                    src={coalitionImage.secureUrl}
                    alt={coalitionImage.alt || "제휴사 이미지"}
                    fill
                    className="object-contain"
                    sizes="(max-width: 896px) 100vw, 896px"
                    priority
                  />
                </span>
              )}
            </a>
          </div>
        )}

        {/* 제휴 파트너 혜택 */}
        <div className="bg-muted rounded-xl p-8 border border-border">
          <h2 className="text-xl font-bold mb-4">제휴사 혜택 안내</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="text-accent">•</span>
              <span>르메그라피 계약 시 15만원 할인!</span>
            </li>

          </ul>
        </div>
      </div>
    </div>
  );
}
