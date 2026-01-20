"use client";

import React from "react";

const sections = [
  {
    number: "01",
    title: "최고의 방법으로 영상 시청하기",
    content: (
      <>
        <p className="mb-6">
          <strong className="text-accent font-semibold">꼭 클라우드에서 파일을 다운로드 받아서 재생해주세요!</strong>
          <br />
          클라우드 특성상 네트워크 속도에 따라 싱크밀림, 영상 깨짐, 재생 안됨 등의 문제가 발생할 수 있어요.
        </p>
        
        <p className="mb-6">
          화면은 캘리브레이션이 된 <strong className="text-white font-semibold">27인치 이상의 LED 패널</strong>이 좋아요.
          <br />
          시청 환경은 불빛이 다 꺼진 상태에서 <strong className="text-white font-semibold">백색의 무드등이나 간접등</strong>을 켜주시면 완벽합니다.
        </p>
        
        <p className="text-[#777777] text-sm font-medium leading-relaxed mt-4">
          *OLED 환경에서는 의도된 색과 밝기가 조금 다를 수 있어요
        </p>
        
        <div className="mt-8 pt-6 border-t border-[#2a2a2a]">
          <p className="text-white text-base font-semibold mb-4">📱 아이폰 / 아이패드 / 맥북</p>
          <div className="bg-muted rounded-lg p-6 border-l-4 border-accent">
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed mb-1.5">
              밝기 바를 길게 터치 → <strong className="text-white font-semibold">1/3로 설정</strong>
            </p>
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
              <strong className="text-white font-semibold">True Tone</strong>과 <strong className="text-white font-semibold">Night Shift</strong>는 꺼주세요.
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-[#2a2a2a]">
          <p className="text-white text-base font-semibold mb-4">📺 LG TV</p>
          <div className="bg-muted rounded-lg p-6 border-l-4 border-accent">
            <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
              화면모드에서 <strong className="text-white font-semibold">필름메이커 모드</strong>를 켜주세요.<br />
              없을 경우 <strong className="text-white font-semibold">시네마</strong>를 켜주세요
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    number: "02",
    title: "USB로 TV에서 시청하기",
    content: (
      <>
        <p className="mb-6">
          라우브필름 USB를 TV 뒤편 USB 포트에 연결하고
          <br />
          TV 리모콘으로 미디어 탭에서 시청하시면 됩니다.
        </p>
        
        <p className="mb-6">
          TV에서 유튜브를 지원하는 경우, 핸드폰에서 TV로 바로 전송도 가능해요.
          <br />
          상담채널로 요청해주시면 유튜브 링크를 제공해드립니다.
        </p>
      </>
    ),
  },
  {
    number: "03",
    title: "화질 손실 없이 저장/공유하기",
    content: (
      <>
        <div className="bg-muted rounded-lg p-6 border-l-4 border-accent mb-6">
          <p className="text-[#cccccc] text-sm font-medium leading-relaxed mb-1.5">
            <strong className="text-white font-semibold">카카오톡</strong>으로 공유할 때는
          </p>
          <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
            설정 → 채팅 → 채팅옵션 → <strong className="text-white font-semibold">"동영상 원본으로 보내기"</strong>를 꼭 켜주세요.
          </p>
        </div>
        
        <div className="bg-muted rounded-lg p-6 border-l-4 border-accent mb-6">
          <p className="text-[#cccccc] text-sm font-medium leading-relaxed mb-1.5">
            <strong className="text-white font-semibold">USB / 클라우드</strong>로 옮길 때는
          </p>
          <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
            드래그 앤 드롭 후 <strong className="text-white font-semibold">이동된 영상이 정상인지 꼭 확인</strong>해주세요.
          </p>
        </div>
        
        <div className="bg-accent/8 border border-accent/25 rounded-lg p-6">
          <p className="text-[#dddddd] text-sm font-medium leading-relaxed mb-1.5">
            💡 만일 영상이 손실되었다면 저희에게 연락주세요!
          </p>
          <p className="text-[#dddddd] text-sm font-medium leading-relaxed">
            보관기한이 넘었더라도 영상이 아직 삭제되지 않았을 수도 있어요.
          </p>
        </div>
      </>
    ),
  },
  {
    number: "04",
    title: "영상 커스텀 방법",
    content: (
      <>
        <p className="mb-6">아래 항목들을 커스텀할 수 있어요.</p>
        
        <div className="bg-muted rounded-lg p-6 border-l-4 border-accent mb-6">
          <ul className="list-none space-y-3.5">
            <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
              <span className="absolute left-0 text-accent font-bold">•</span>
              <strong className="text-white font-semibold">BGM</strong> (배경음악) 선택
            </li>
            <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
              <span className="absolute left-0 text-accent font-bold">•</span>
              <strong className="text-white font-semibold">편집 스타일</strong> 변경
            </li>
            <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
              <span className="absolute left-0 text-accent font-bold">•</span>
              <strong className="text-white font-semibold">영상 연출</strong> 방식
            </li>
            <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
              <span className="absolute left-0 text-accent font-bold">•</span>
              <strong className="text-white font-semibold">전체적인 색감</strong>
            </li>
          </ul>
        </div>
        
        <p className="mb-6">
          원하는 느낌이나 참고 링크를 카카오톡으로 전달해주시면
          <br />
          최대한 원하시는 방향으로 도와드릴게요. 편하게 말씀해주세요!
        </p>
        
        <div className="bg-accent/8 border border-accent/25 rounded-lg p-6">
          <p className="text-[#dddddd] text-sm font-medium leading-relaxed">
            ⚠️ 예식일로부터 <strong className="text-white font-semibold">최소 1개월 이전</strong>에 요청해주셔야 가능합니다
          </p>
        </div>
      </>
    ),
  },
  {
    number: "05",
    title: "생기 넘치는 영상 남기는 법",
    content: (
      <>
        <div className="bg-muted rounded-lg p-6 border-l-4 border-accent mb-6">
          <p className="text-[#cccccc] text-sm font-medium leading-relaxed mb-1.5">
            <strong className="text-white font-semibold">신랑신부님, 양가 부모님 인터뷰</strong>는 꼭 진행하시는 게 좋아요!
          </p>
          <p className="text-[#cccccc] text-sm font-medium leading-relaxed">
            너무 길지 않으면 하이라이트 영상에 함께 넣어드리고 있습니다.
          </p>
        </div>
        
        <p className="mb-6">본식 중에 이런 모습들이 담기면 영상이 훨씬 생동감 있어요.</p>
        
        <ul className="list-none space-y-3.5 mb-6">
          <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
            <span className="absolute left-0 text-accent font-bold">•</span>
            서로 마주보거나 하객분들 보고 <strong className="text-white font-semibold">웃는 모습</strong>
          </li>
          <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
            <span className="absolute left-0 text-accent font-bold">•</span>
            축하 공연이나 축하 말씀에 <strong className="text-white font-semibold">박수 쳐주기</strong>
          </li>
          <li className="relative pl-5 text-[#cccccc] text-base font-medium leading-relaxed">
            <span className="absolute left-0 text-accent font-bold">•</span>
            입/퇴장 시 <strong className="text-white font-semibold">천천히</strong> 걸어주기
          </li>
        </ul>
        
        <p className="text-[#777777] text-sm font-medium leading-relaxed">
          *시간 여건상 불가능하거나 거절하시는 경우 인터뷰가 진행되지 못할 수 있어요
        </p>
      </>
    ),
  },
];

export default function TipPage() {
  return (
    <div className="min-h-screen py-20 px-4 md:py-20">
      <div className="mx-auto max-w-3xl">
        {/* Title */}
        <div className="mb-15 text-center">
          <h1 className="relative inline-block text-3xl md:text-4xl font-bold text-white pb-5">
            본식영상 활용 팁
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-15 h-0.5 bg-accent" />
          </h1>
        </div>
        
        {/* Intro */}
        <div className="text-center mb-17 text-[#aaaaaa] text-base font-medium leading-loose">
          저희는 본래 영화, CF, 예능 등의 종합편집과 CG를 하는 사람들입니다.
          <br />
          현업에서 작업하던 방식을 웨딩영상에 적용하고 있어요.
          <br />
          아래 방식대로 따라주시면 더욱 좋게 시청하실 수 있습니다.
        </div>
        
        {/* Sections */}
        <div className="space-y-17">
          {sections.map((section, index) => (
            <div key={section.number}>
              {/* Section Title */}
              <h2 className="flex items-center gap-3.5 mb-6 text-xl md:text-2xl font-bold text-white">
                <span className="text-accent text-xl md:text-2xl font-bold">{section.number}</span>
                {section.title}
              </h2>
              
              {/* Section Content */}
              <div className="text-[#cccccc] text-base font-medium leading-loose">
                {section.content}
              </div>
              
              {/* Divider */}
              {index < sections.length - 1 && (
                <div className="h-px bg-[#2a2a2a] my-12" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
