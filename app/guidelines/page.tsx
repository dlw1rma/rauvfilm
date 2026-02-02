import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "규정안내 | 라우브필름",
  description: "라우브필름 촬영 전/후 규정 및 안내사항입니다.",
};

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-8">규정안내</h1>

        <div className="prose prose-invert max-w-none space-y-10 text-muted-foreground">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">1. 촬영 전 규정/안내</h2>
            <ul className="space-y-3 list-disc pl-6">
              <li>
                예약의 확정은 예약금 100,000원 입금과 라우브필름 홈페이지 예약 글 작성 후 확정됩니다.
              </li>
              <li>
                촬영 가능 통보를 받았다 하더라도 예약금 입금과 예약 글 작성 전까지 해당 날짜에 통보 없이 마감될 수 있습니다.
              </li>
              <li>
                촬영은 신부대기실 - 본식 - 기념사진(원판사진)촬영 - *옵션사항 (피로연(2부 행사) or 폐백촬영)으로 진행됩니다.
                <p className="text-sm mt-1">
                  (피로연(2부 행사) or 폐백 진행 시 추가금 발생), (옵션사항 마다 종료시각 상이함)
                </p>
              </li>
              <li>
                촬영시작은 예식 1시간 전 신부대기실부터 시작됩니다.
              </li>
              <li>
                촬영 전 확인 연락은 촬영일 기준 4~5일 전에 드립니다.
              </li>
              <li>
                예약금을 제외한 잔금은 촬영일 기준 1일 전에 입금해 주시면 됩니다.
              </li>
              <li>
                모든 파일은 클라우드를 통해 전송됩니다.
              </li>
              <li>
                일부 촬영본은 고객의 사전 동의 후 라우브필름의 SNS 또는 홈페이지에 업로드될 수 있습니다.
              </li>
              <li>
                촬영환경에 따라 촬영 방법이 달라질 수 있으며, 사전에 협의가 이루어지지 않은 예상치 못한 상황은 촬영이 불가할 수 있습니다.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-4">2. 촬영 후 규정/안내</h2>
            <ul className="space-y-3 list-disc pl-6">
              <li>
                본식 영상은 촬영일 기준 약 60~80일이 소요됩니다.
              </li>
              <li>
                영상 원본과 편집본은 최종 발송일 기준 2개월 동안 보관하며, 이후 통보 없이 삭제됩니다.
              </li>
              <li>
                납품된 영상편집본의 수정은 1회 무료로 가능합니다. (추가 요청 시 요금 발생)
              </li>
              <li>
                발송된 파일은 신속히 내려받으시길 바라며, 고객의 파일 다운로드 방법 미숙지, 압축해제 오류 등으로 인해 늦어지는 시간과 무관합니다.
              </li>
              <li>
                모든 상담과 요청 사항은 카카오톡 라우브필름상담채널을 통해 이뤄지고 있으니, 카카오톡상담채널을 유지하셔야 합니다. 카카오톡상담채널 나가기로 인한 피해에 대해서는 책임지지 않습니다.
              </li>
              <li>
                내부 사정에 따라 파일의 발송일이 변동될 수 있습니다.
              </li>
              <li>
                원본 영상이 삭제될 경우 재전송은 불가합니다.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
