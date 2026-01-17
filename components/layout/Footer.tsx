import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* 회사 정보 */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">RAUVFILM</h3>
            <p className="text-sm text-muted-foreground">
              웨딩 본식 DVD 및<br />
              시네마틱 영상 제작 전문
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">빠른 링크</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/portfolio"
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  포트폴리오
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  가격 안내
                </Link>
              </li>
              <li>
                <Link
                  href="/reservation"
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  예약 게시판
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-foreground">연락처</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>대표: 손세한</li>
              <li>이메일: contact@rauvfilm.co.kr</li>
              <li>영업시간: 평일 10:00 - 18:00</li>
            </ul>
          </div>
        </div>

        {/* 저작권 */}
        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} RAUVFILM. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
