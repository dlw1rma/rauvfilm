"use client";

import Link from "next/link";
import Tabs from "@/components/ui/Tabs";

export default function AboutTabs() {
  return (
    <section className="py-20 px-4 bg-muted">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-widest">
          ABOUT US
        </h2>

        <Tabs
          tabs={[
            {
              id: "director",
              label: "DIRECTOR",
              content: (
                <div className="pt-8 space-y-6 text-muted-foreground">
                  <p className="leading-relaxed">
                    대표가 인정한 실력을 갖고 있는 감독님들만 있기에 예약이
                    불가능한 일정이 있을 수 있습니다.
                  </p>
                  <p className="leading-relaxed">
                    촬영 만큼 중요한 영상보정은 가장 아름답고 멋진 모습을
                    오랫동안 남겨드리기 위해서 VFX와 유튜브 프로덕션 출신의
                    대표감독이 직접 제작하고 있습니다.
                  </p>
                  <p className="leading-relaxed">
                    또한 영상의 비율 사용하는 프로그램, 보정 장비 등 모두 표준
                    DI 작업공간으로 맞춰 진행하고 있습니다.
                  </p>
                  <p className="leading-relaxed">
                    라우브필름{" "}
                    <Link href="/tip" className="text-accent hover:underline">
                      [TIP]
                    </Link>
                    에 표기된 방법을 따라하시면 본식DVD뿐만 아니라 영화와 드라마
                    등의 색감과 밝기를 더욱 정확한 상태에서 시청하실 수 있습니다.
                  </p>
                </div>
              ),
            },
            {
              id: "custom",
              label: "CUSTOM",
              content: (
                <div className="pt-8">
                  <div className="space-y-6 text-muted-foreground">
                    <p className="leading-relaxed">
                      신랑신부님의 가져가실 소중한 영상을 위해 대표 촬영
                      한정으로 원하시는 형식의 영상을 최대한 반영하여 작업하고
                      있습니다.
                    </p>
                    <p className="leading-relaxed">
                      원하시는 형식이 있다면 카카오톡 채널로 상담 이후 신청서
                      작성 부탁드립니다.
                    </p>
                    <p className="leading-relaxed">
                      따로 말씀이 없으실 경우 저희가 가장 자신 있는 시네마틱
                      하이라이트와 기록영상으로 진행될 예정입니다.
                    </p>
                    <p className="text-sm text-muted-foreground/80 italic">
                      (원하시는 형식에 따라 추가비용이 발생하거나 반영이 불가능
                      할 수 있습니다.)
                    </p>
                  </div>
                  <div className="mt-8 text-center">
                    <a
                      href="https://pf.kakao.com/_xlXAin/chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-12 items-center justify-center rounded-lg bg-[#FEE500] px-8 text-base font-medium text-[#3C1E1E] transition-all hover:brightness-95 hover:-translate-y-1"
                    >
                      카카오톡 상담하기
                    </a>
                  </div>
                </div>
              ),
            },
          ]}
          defaultTab="director"
        />
      </div>
    </section>
  );
}
