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
            <h2 className="text-xl font-bold text-foreground mb-4">제 1조 【약관의 적용】</h2>
            <p>
              서비스 이용자는 '라우브필름'이 제공하는 본식DVD 촬영 서비스에 대하여 충분한 상담을 받고 정확히 숙지하여 최종 결정하였으며, 계약 시 특별한 약정이 없는 한 이 이용약관이 적용됩니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제 2조 【정보 제공 동의】</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>
                '라우브필름'은 서비스를 원활히 제공하는 데 필요한 정보를 서비스 이용자에게 요구할 수 있으며,
                서비스 이용자는 정보를 제공하는 데 동의합니다.
              </li>
              <li>
                '라우브필름'은 서비스 이용자로부터 제공받은 정보를 계약 사항의 목적 외에 사용할 수 없으며,
                본래의 목적 외의 활동에 본 정보가 사용되었을 경우 서비스 이용자는 이의를 제기할 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제 3조 【예약의 무효】</h2>
            <p className="mb-2">아래와 같은 사유가 발생 시 예약은 별도의 통지 없이 자동으로 무효가 됩니다.</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>계약서가 허위로 작성되었거나 '라우브필름'이 제2조에 따른 정보를 충분히 제공받지 못한 경우.</li>
              <li>충분한 정보를 제공받으나, 예약금이 입금 안 된 경우.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제 4조 【환불】</h2>
            <p className="mb-2">
              예약금 입금 후 1주일 이내에 환불을 요청할 수 있으며, 그 이후에는 환불되지 않으니 참고하시어, 신중한 예약 부탁드립니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>단순 변심으로 취소 시 예약금 환불은 불가합니다.</li>
              <li>촬영 45일 전 예약 취소 시는 총 상품 금액의 50% 변상</li>
              <li>촬영 30일 전 예약 취소 시는 총 상품 금액의 100% 변상</li>
              <li>단, 부득이한 사유로 취소 시는 타인에게 양도할 수 있습니다.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제 5조 【보상 및 배상】</h2>
            <p className="mb-2">
              소비자 피해보상 규정에 따라 전체 촬영 본의 멸실 및 재해로 인한 사고 발생 시 촬영 계약금 전액을 환불해드립니다. 촬영 계약금 환불 이외에 별도의 피해보상은 아래 기준에 따르며, 상호 합의하에 최대 촬영 계약금액까지의 배상이 가능합니다.
            </p>
            <div className="mt-4">
              <p className="font-semibold mb-2">■ 촬영 후 기타사유 인한 촬영 본 손실의 경우 배상액 기준</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>1인 1캠[가성비형] 촬영 본 전체 손실 시 30만원</li>
                <li>1인 2캠[기본형] 중 한 개의 카메라 촬영 본 손실 시 30만원</li>
                <li>1인 2캠[기본형] 촬영 본 전체 손실 시 60만원</li>
                <li>영상파일 오디오 전체 손실 : 한 개 카메라당 150,000원 / 일부 손실은 협의</li>
                <li>촬영본 일부 손실 시 손실 정도에 따라 총 촬영시간 대비 손실 시간 비율로 협의</li>
              </ul>
            </div>
            <p className="mt-4">
              단순 변심 또는 영상 스타일이 마음에 들지 않거나 촬영 현장(기상 여건, 예식장 근무자의 부주의, 참석 하객의 부주의 등)의 문제로 발생한 모든 내용은 환불 및 기타 보상 대상 건에서 제외합니다.
            </p>
            <p className="mt-2">
              라우브필름이 계약한 촬영을 수행하기 어려운 상황이 발생했을 경우(배정된 촬영자가 촬영 진행이 불가한 상황에서 대체 촬영자를 수급하기 어려운 경우) 계약하신 원금의 환불까지를 보상의 원칙으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제 6조 【저작권 및 초상권】</h2>
            <p>저작권은 라우브필름이 소유하게 되며,</p>
            <p>해당 상품에 모든 인물의 초상권은 신랑 신부님의 권한입니다.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">제 7조 【비밀유지 사항】</h2>
            <p>계약서의 모든 내용은 외부로 유출할 수 없습니다.</p>
            <p>계약서 내용 불이행에 따라 피해 발생 시 상호 법적인 책임을 다하여야 합니다.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
