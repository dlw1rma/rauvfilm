'use client';

import Link from 'next/link';

export default function ReviewGuidePage() {
  return (
    <div className="min-h-screen bg-background py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            예약후기 작성 가이드
          </h1>
          <p className="text-muted-foreground text-lg">
            후기 작성 시 아래 가이드를 참고해주세요 💕
          </p>
        </div>

        {/* 기본 안내 */}
        <div className="text-center mb-16 space-y-3">
          <div className="bg-accent-subtle border border-accent/30 rounded-lg p-4 mb-4">
            <p className="text-foreground font-bold text-lg mb-2">
              ⚠️ 예약후기만 작성 가능합니다
            </p>
            <p className="text-muted-foreground text-sm">
              본 예약과 관련된 후기만 제출 가능하며, 최대 3건까지만 등록할 수 있습니다.
            </p>
          </div>
          <p className="text-foreground text-lg font-medium">
            예약후기는 <strong className="text-foreground">계약일로부터 1개월 안에</strong> 작성해주셔야 합니다.
          </p>
          <p className="text-foreground text-lg font-medium">
            작성 후 웹사이트에 제출해주시면 혜택 제공해드립니다!
          </p>
        </div>

        {/* 혜택 안내 */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>🎁</span>
            후기 작성 혜택
          </h2>
          <div className="space-y-4">
            <div className="bg-muted rounded-xl p-6 border-l-4 border-accent">
              <div className="flex items-start gap-4">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg mb-2">1건 작성 시</h3>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">1만원 할인</strong> 제공
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6 border-l-4 border-accent">
              <div className="flex items-start gap-4">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg mb-2">2건 작성 시</h3>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">2만원 할인</strong> + <strong className="text-foreground">SNS 영상 제공</strong>
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6 border-l-4 border-accent">
              <div className="flex items-start gap-4">
                <div className="bg-accent text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-foreground font-bold text-lg mb-2">3건 작성 시</h3>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">3만원 할인</strong> + <strong className="text-foreground">SNS 영상 제공</strong> + <strong className="text-foreground">원본 전체 제공</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>※ 블로그/카페 각 1건씩 작성 가능 (최대 2건)</p>
            <p>※ 3건 이상은 등록할 수 없습니다</p>
          </div>
        </div>

        <div className="h-px bg-border my-12"></div>

        {/* 블로그/카페 가이드 */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>📝</span>
            블로그 / 카페 작성 가이드
          </h2>
          <ul className="space-y-4 list-none">
            <li className="relative pl-6 text-muted-foreground text-base leading-relaxed">
              <span className="absolute left-0 top-2.5 w-2 h-2 bg-accent rounded-full"></span>
              제목은 <strong className="text-foreground">'진행 예정이신 웨딩홀' + '라우브필름' + '본식DVD'</strong>를 포함하여 작성해주세요
            </li>
            <li className="relative pl-6 text-muted-foreground text-base leading-relaxed">
              <span className="absolute left-0 top-2.5 w-2 h-2 bg-accent rounded-full"></span>
              본문에 <strong className="text-foreground">라우브필름 홈페이지 포트폴리오 영상을 캡쳐하여 10장 이상</strong> 활용과 <br className="hidden md:block" />
              <strong className="text-foreground">라우브필름 홈페이지, 카카오톡채널</strong> 링크를 기입해주세요!
            </li>
            <li className="relative pl-6 text-muted-foreground text-base leading-relaxed">
              <span className="absolute left-0 top-2.5 w-2 h-2 bg-accent rounded-full"></span>
              내용은 본식DVD 촬영 진행 계기와 라우브필름 선택 이유 등 자유롭게 작성해주시면 됩니다
            </li>
            <li className="relative pl-6 text-muted-foreground text-base leading-relaxed">
              <span className="absolute left-0 top-2.5 w-2 h-2 bg-accent rounded-full"></span>
              카페 글은 꼭 <strong className="text-foreground">전체공개</strong>로 작성 부탁드립니다 😊
            </li>
          </ul>
        </div>

        {/* 추천 웨딩 카페 */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>💒</span>
            추천 웨딩 카페
          </h2>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
            진행하시는 플래너 업체 카페가 있다면 <strong className="text-foreground">비제휴 업체 언급 가능 여부</strong> 확인 후<br className="hidden md:block" />
            DVD 관련 탭 또는 짝궁구하기 탭에 작성해주세요.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">메이크마이웨딩</div>
              <div className="text-muted-foreground text-sm mb-2">→ 본식 및 기타 DVD</div>
              <div className="text-muted-foreground/70 text-xs">(대가성 X 기입)</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">아이니웨딩</div>
              <div className="text-muted-foreground text-sm mb-2">→ 본식스냅 / DVD 후기</div>
              <div className="text-muted-foreground/70 text-xs">(업체 진행 시 작성 가능)</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">제이웨딩</div>
              <div className="text-muted-foreground text-sm mb-2">→ 자랑 탭</div>
              <div className="text-muted-foreground/70 text-xs">(업체 진행 시 작성 가능)</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">위위유</div>
              <div className="text-muted-foreground text-sm">→ 최종결정</div>
            </div>
            <div className="bg-muted rounded-lg p-6 text-center border border-border">
              <div className="text-accent font-bold text-lg mb-1.5">요즘웨딩</div>
              <div className="text-muted-foreground text-sm">→ 본식사진/DVD후기</div>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-accent-subtle border border-accent/30 rounded-lg p-5 md:p-6 mt-5">
            <span className="text-lg flex-shrink-0 mt-0.5">⚠️</span>
            <span className="text-accent/90 text-sm md:text-base font-medium leading-relaxed">
              <strong className="text-foreground">다이렉트 웨딩</strong> 카페는 게시글/댓글 작성 불가
            </span>
          </div>
        </div>

        <div className="h-px bg-border my-12"></div>

        {/* 짝궁코드 TIP */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>💡</span>
            후기 작성 TIP
          </h2>
          <p className="text-foreground text-base md:text-lg font-medium leading-relaxed mb-5">
            하단부에 <strong className="text-foreground">&quot;예식날짜 + 계약자 성함&quot;</strong>으로 짝궁코드를 작성해주시면<br className="hidden md:block" />
            다른 신부님들이 보시고 작성해주시면 <strong className="text-foreground">잔금에서 1만원씩 할인</strong>되니 꼭 적어주세요!
          </p>
          <span className="inline-block bg-accent text-white px-4 py-2 rounded-md text-sm md:text-base font-semibold mt-3">
            예시) 250516 이지은
          </span>
        </div>

        <div className="h-px bg-border my-12"></div>

        {/* 짝궁 구하는 방법 */}
        <div className="mb-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-foreground mb-7">
            <span>🎯</span>
            짝궁 구하는 확률 높이기
          </h2>
          <p className="text-muted-foreground/80 text-sm md:text-base mb-8">
            쓰레드나 웨딩카페/웨딩홀 단톡방에 댓글 또는 게시글을 작성할 때 아래 문구를 활용해보세요
          </p>

          <div className="space-y-5">
            <div className="bg-muted rounded-xl p-7 border-l-4 border-accent">
              <div className="text-foreground font-bold text-base md:text-lg mb-4">
                쓰레드 / 웨딩카페 소개 댓글
              </div>
              <div className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                쓰레드에 게시글 또는 &quot;결혼준비&quot; 키워드의 DVD가 미정인 신랑신부님들께 댓글로 남겨주세요 😊
              </div>
              <div className="bg-background rounded-lg p-5 mt-4 text-muted-foreground/80 text-sm md:text-base leading-relaxed italic">
                &quot;라우브필름 계약했는데 만족스러워서 추천드려요!<br />
                제 짝궁코드 사용하시면 할인도 되니까 같이 짝궁해요 :)<br />
                예식날짜 + 계약자 성함&quot;
              </div>
            </div>

            <div className="bg-muted rounded-xl p-7 border-l-4 border-accent">
              <div className="text-foreground font-bold text-base md:text-lg mb-4">
                웨딩홀 단톡방 / 웨딩카페 추천글
              </div>
              <div className="text-muted-foreground text-sm md:text-base leading-relaxed mb-4">
                단톡방과 웨딩카페에 추천글 작성 또는 댓글을 남겨주시면<br className="hidden md:block" />
                보다 많은 분들의 짝궁을 구해 할인 금액이 올라갑니다!
              </div>
              <div className="bg-background rounded-lg p-5 mt-4 text-muted-foreground/80 text-sm md:text-base leading-relaxed italic">
                &quot;고민 많이 하다가 라우브필름으로 결정했는데<br />
                포트폴리오와 이벤트 혜택이 다양하더라구요!<br />
                같이 짝궁해요 :)&quot;
              </div>
            </div>

            <div className="bg-muted rounded-xl p-7 border-l-4 border-accent">
              <div className="text-foreground font-bold text-base md:text-lg mb-4">
                웨딩카페 추천 쪽지
              </div>
              <div className="text-muted-foreground text-sm md:text-base leading-relaxed">
                DVD추천을 원하시는 분들에게 <strong className="text-foreground">&quot;진행하신 상품 + 추천이유 + 짝궁코드&quot;</strong>를 기입하여 쪽지로 전달주시면 짝궁구할 확률 UP!
              </div>
            </div>
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="text-center mt-12">
          <Link
            href="/mypage/review"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            후기 제출 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
