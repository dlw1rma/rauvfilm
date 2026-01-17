import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 | 라우브필름",
  description: "라우브필름 서비스 이용약관입니다.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">이용약관</h1>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제1조 (목적)</h2>
            <p>
              본 약관은 라우브필름(이하 "회사")이 제공하는 웨딩 영상 촬영 서비스(이하 "서비스")의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제2조 (서비스의 내용)</h2>
            <p>회사가 제공하는 서비스는 다음과 같습니다.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>본식 DVD 촬영 서비스</li>
              <li>시네마틱 영상 제작 서비스</li>
              <li>하이라이트 영상 제작 서비스</li>
              <li>야외 스냅 촬영 서비스</li>
              <li>기타 웨딩 관련 영상 서비스</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제3조 (예약 및 계약)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>이용자는 회사가 정한 절차에 따라 예약을 신청할 수 있습니다.</li>
              <li>계약금 입금 시 예약이 확정되며, 계약이 성립됩니다.</li>
              <li>계약금은 총 서비스 금액의 30%입니다.</li>
              <li>잔금은 서비스 제공일(예식일) 7일 전까지 입금해야 합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제4조 (취소 및 환불)</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>서비스 제공일 30일 전 취소: 계약금 전액 환불</li>
              <li>서비스 제공일 14일 전 취소: 계약금의 50% 환불</li>
              <li>서비스 제공일 7일 이내 취소: 환불 불가</li>
              <li>날짜 변경은 1회에 한해 무료로 가능합니다.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제5조 (저작권)</h2>
            <p>
              서비스를 통해 제작된 영상물의 저작권은 회사에 있으며, 이용자에게는 개인적 용도의 사용권이 부여됩니다.
              상업적 목적의 사용을 원할 경우 회사와 별도 협의가 필요합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제6조 (면책조항)</h2>
            <p>
              회사는 천재지변, 전쟁, 테러 등 불가항력적인 사유로 인해 서비스를 제공하지 못하는 경우 책임을 지지 않습니다.
              단, 이 경우 회사는 이용자와 협의하여 대체 일정 조율 또는 환불을 진행합니다.
            </p>
          </section>

          <div className="pt-8 border-t border-border text-sm">
            <p>시행일: 2024년 1월 1일</p>
          </div>
        </div>
      </div>
    </div>
  );
}
