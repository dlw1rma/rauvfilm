import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 라우브필름",
  description: "라우브필름 개인정보처리방침입니다.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">개인정보처리방침</h1>

        <div className="prose prose-invert max-w-none space-y-8 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <p>라우브필름은 다음의 목적을 위하여 개인정보를 처리합니다.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>예약 및 상담 서비스 제공</li>
              <li>서비스 관련 안내 및 문의 응대</li>
              <li>계약 이행 및 서비스 제공</li>
              <li>마케팅 및 광고에 활용 (동의 시)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. 수집하는 개인정보 항목</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>필수항목: 성명, 연락처, 예식일, 예식장</li>
              <li>선택항목: 이메일, 상세 요청사항</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">3. 개인정보의 보유 및 이용기간</h2>
            <p>
              개인정보는 수집 및 이용 목적이 달성된 후에는 지체 없이 파기합니다.
              단, 관련 법령에 의해 보존할 필요가 있는 경우 법령에서 정한 기간 동안 보관합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>계약 또는 청약철회 등에 관한 기록: 5년</li>
              <li>대금결제 및 재화 등의 공급에 관한 기록: 5년</li>
              <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">4. 개인정보의 제3자 제공</h2>
            <p>
              라우브필름은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              다만, 아래의 경우에는 예외로 합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>이용자가 사전에 동의한 경우</li>
              <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">5. 개인정보의 파기</h2>
            <p>
              개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
              지체없이 해당 개인정보를 파기합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">6. 정보주체의 권리</h2>
            <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">7. 개인정보보호 책임자</h2>
            <ul className="list-none space-y-1">
              <li>성명: 손세한</li>
              <li>연락처: 010-4512-3587</li>
              <li>이메일: rauvfilm@naver.com</li>
            </ul>
          </section>

          <div className="pt-8 border-t border-border text-sm">
            <p>시행일: 2024년 1월 1일</p>
          </div>
        </div>
      </div>
    </div>
  );
}
