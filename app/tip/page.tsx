"use client";

import React from "react";

export default function TipPage() {
  return (
    <div className="rv-tip-wrap">
      <section className="rv-tip-section">
        <div className="rv-tip-container">
          <h2 className="rv-tip-title">본식영상 활용 팁</h2>
          
          <div className="rv-tip-intro">
            저희는 본래 영화, CF, 예능 등의 종합편집과 CG를 하는 사람들입니다.<br />
            현업에서 작업하던 방식을 웨딩영상에 적용하고 있어요.<br />
            아래 방식대로 따라주시면 더욱 좋게 시청하실 수 있습니다.
          </div>
          
          {/* 1. 최고의 방법으로 영상 시청 */}
          <div className="rv-main-section">
            <h3 className="rv-section-title">
              <span className="rv-num">01</span>
              최고의 방법으로 영상 시청하기
            </h3>
            
            <p className="rv-text">
              <strong className="rv-text-highlight">꼭 클라우드에서 파일을 다운로드 받아서 재생해주세요!</strong><br />
              클라우드 특성상 네트워크 속도에 따라 싱크밀림, 영상 깨짐, 재생 안됨 등의 문제가 발생할 수 있어요.
            </p>
            
            <p className="rv-text">
              화면은 캘리브레이션이 된 <strong>27인치 이상의 LED 패널</strong>이 좋아요.<br />
              시청 환경은 불빛이 다 꺼진 상태에서 <strong>백색의 무드등이나 간접등</strong>을 켜주시면 완벽합니다.
            </p>
            
            <p className="rv-note">*OLED 환경에서는 의도된 색과 밝기가 조금 다를 수 있어요</p>
            
            <div className="rv-subsection">
              <p className="rv-subsection-title">📱 아이폰 / 아이패드 / 맥북</p>
              <div className="rv-box">
                <p>밝기 바를 길게 터치 → <strong>1/3로 설정</strong></p>
                <p><strong>True Tone</strong>과 <strong>Night Shift</strong>는 꺼주세요.</p>
              </div>
            </div>
            
            <div className="rv-subsection">
              <p className="rv-subsection-title">📺 LG TV</p>
              <div className="rv-box">
                <p>화면모드에서 <strong>필름메이커 모드</strong>를 켜주세요.<br />없을 경우 <strong>시네마</strong>를 켜주세요</p>
              </div>
            </div>
          </div>
          
          <div className="rv-divider"></div>
          
          {/* 2. USB 활용 */}
          <div className="rv-main-section">
            <h3 className="rv-section-title">
              <span className="rv-num">02</span>
              USB로 TV에서 시청하기
            </h3>
            
            <p className="rv-text">
              라우브필름 USB를 TV 뒤편 USB 포트에 연결하고<br />
              TV 리모콘으로 미디어 탭에서 시청하시면 됩니다.
            </p>
            
            <p className="rv-text">
              TV에서 유튜브를 지원하는 경우, 핸드폰에서 TV로 바로 전송도 가능해요.<br />
              상담채널로 요청해주시면 유튜브 링크를 제공해드립니다.
            </p>
          </div>
          
          <div className="rv-divider"></div>
          
          {/* 3. 화질 손실 없이 저장 */}
          <div className="rv-main-section">
            <h3 className="rv-section-title">
              <span className="rv-num">03</span>
              화질 손실 없이 저장/공유하기
            </h3>
            
            <div className="rv-box">
              <p><strong>카카오톡</strong>으로 공유할 때는</p>
              <p>설정 → 채팅 → 채팅옵션 → <strong>"동영상 원본으로 보내기"</strong>를 꼭 켜주세요.</p>
            </div>
            
            <div className="rv-box">
              <p><strong>USB / 클라우드</strong>로 옮길 때는</p>
              <p>드래그 앤 드롭 후 <strong>이동된 영상이 정상인지 꼭 확인</strong>해주세요.</p>
            </div>
            
            <div className="rv-alert-box">
              <p>💡 만일 영상이 손실되었다면 저희에게 연락주세요!</p>
              <p>보관기한이 넘었더라도 영상이 아직 삭제되지 않았을 수도 있어요.</p>
            </div>
          </div>
          
          <div className="rv-divider"></div>
          
          {/* 4. 영상 커스텀 */}
          <div className="rv-main-section">
            <h3 className="rv-section-title">
              <span className="rv-num">04</span>
              영상 커스텀 방법
            </h3>
            
            <p className="rv-text">아래 항목들을 커스텀할 수 있어요.</p>
            
            <div className="rv-box">
              <ul className="rv-list" style={{ margin: 0 }}>
                <li><strong>BGM</strong> (배경음악) 선택</li>
                <li><strong>편집 스타일</strong> 변경</li>
                <li><strong>영상 연출</strong> 방식</li>
                <li><strong>전체적인 색감</strong></li>
              </ul>
            </div>
            
            <p className="rv-text">
              원하는 느낌이나 참고 링크를 카카오톡으로 전달해주시면<br />
              최대한 원하시는 방향으로 도와드릴게요. 편하게 말씀해주세요!
            </p>
            
            <div className="rv-alert-box">
              <p>⚠️ 예식일로부터 <strong>최소 1개월 이전</strong>에 요청해주셔야 가능합니다</p>
            </div>
          </div>
          
          <div className="rv-divider"></div>
          
          {/* 5. 생기 넘치는 영상 */}
          <div className="rv-main-section">
            <h3 className="rv-section-title">
              <span className="rv-num">05</span>
              생기 넘치는 영상 남기는 법
            </h3>
            
            <div className="rv-box">
              <p><strong>신랑신부님, 양가 부모님 인터뷰</strong>는 꼭 진행하시는 게 좋아요!</p>
              <p>너무 길지 않으면 하이라이트 영상에 함께 넣어드리고 있습니다.</p>
            </div>
            
            <p className="rv-text">본식 중에 이런 모습들이 담기면 영상이 훨씬 생동감 있어요.</p>
            
            <ul className="rv-list">
              <li>서로 마주보거나 하객분들 보고 <strong>웃는 모습</strong></li>
              <li>축하 공연이나 축하 말씀에 <strong>박수 쳐주기</strong></li>
              <li>입/퇴장 시 <strong>천천히</strong> 걸어주기</li>
            </ul>
            
            <p className="rv-note">*시간 여건상 불가능하거나 거절하시는 경우 인터뷰가 진행되지 못할 수 있어요</p>
          </div>
        </div>
      </section>

      <style jsx>{`
        .rv-tip-wrap,
        .rv-tip-wrap * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          font-family: "Apple SD Gothic Neo", "애플 SD 산돌고딕 Neo", sans-serif !important;
        }
        
        .rv-tip-wrap {
          background: transparent !important;
          color: #e5e7eb !important;
          line-height: 1.9 !important;
        }
        
        .rv-tip-container {
          max-width: 720px !important;
          margin: 0 auto !important;
          padding: 0 20px !important;
        }
        
        .rv-tip-section {
          padding: 80px 0 !important;
          background: transparent !important;
        }
        
        .rv-tip-title {
          font-size: 36px !important;
          font-weight: 700 !important;
          text-align: center !important;
          margin-bottom: 60px !important;
          color: #ffffff !important;
          position: relative !important;
          padding-bottom: 20px !important;
        }
        
        .rv-tip-title::after {
          content: '' !important;
          position: absolute !important;
          bottom: 0 !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 60px !important;
          height: 3px !important;
          background: #e50914 !important;
        }
        
        /* 인트로 */
        .rv-tip-intro {
          text-align: center !important;
          margin-bottom: 70px !important;
          color: #aaaaaa !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          line-height: 2 !important;
        }
        
        /* 메인 섹션 */
        .rv-main-section {
          margin-bottom: 70px !important;
        }
        
        .rv-section-title {
          font-size: 22px !important;
          font-weight: 700 !important;
          color: #ffffff !important;
          margin-bottom: 24px !important;
          display: flex !important;
          align-items: center !important;
          gap: 14px !important;
        }
        
        .rv-section-title .rv-num {
          color: #e50914 !important;
          font-size: 22px !important;
          font-weight: 700 !important;
        }
        
        /* 본문 */
        .rv-text {
          color: #cccccc !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          line-height: 2 !important;
          margin-bottom: 24px !important;
        }
        
        .rv-text strong {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        .rv-text-highlight {
          color: #e50914 !important;
          font-weight: 600 !important;
        }
        
        /* 서브섹션 */
        .rv-subsection {
          margin-top: 32px !important;
          padding-top: 24px !important;
          border-top: 1px solid #2a2a2a !important;
        }
        
        .rv-subsection-title {
          color: #ffffff !important;
          font-size: 17px !important;
          font-weight: 600 !important;
          margin-bottom: 16px !important;
        }
        
        /* 리스트 */
        .rv-list {
          list-style: none !important;
          margin: 20px 0 !important;
        }
        
        .rv-list li {
          position: relative !important;
          padding-left: 20px !important;
          margin-bottom: 14px !important;
          color: #cccccc !important;
          font-size: 16px !important;
          font-weight: 500 !important;
          line-height: 1.8 !important;
        }
        
        .rv-list li::before {
          content: '•' !important;
          position: absolute !important;
          left: 0 !important;
          color: #e50914 !important;
          font-weight: 700 !important;
        }
        
        .rv-list li strong {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        /* 노트 */
        .rv-note {
          color: #777777 !important;
          font-size: 14px !important;
          font-weight: 500 !important;
          line-height: 1.8 !important;
          margin-top: 16px !important;
        }
        
        /* 강조 박스 */
        .rv-box {
          background: #1a1a1a !important;
          border-radius: 10px !important;
          padding: 24px 28px !important;
          margin: 24px 0 !important;
          border-left: 3px solid #e50914 !important;
        }
        
        .rv-box p {
          color: #cccccc !important;
          font-size: 15px !important;
          font-weight: 500 !important;
          line-height: 1.9 !important;
          margin-bottom: 6px !important;
        }
        
        .rv-box p:last-child {
          margin-bottom: 0 !important;
        }
        
        .rv-box strong {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        /* 경고/안내 박스 */
        .rv-alert-box {
          background: rgba(229, 9, 20, 0.08) !important;
          border: 1px solid rgba(229, 9, 20, 0.25) !important;
          border-radius: 10px !important;
          padding: 24px 28px !important;
          margin: 24px 0 !important;
        }
        
        .rv-alert-box p {
          color: #dddddd !important;
          font-size: 15px !important;
          font-weight: 500 !important;
          line-height: 1.9 !important;
          margin-bottom: 6px !important;
        }
        
        .rv-alert-box p:last-child {
          margin-bottom: 0 !important;
        }
        
        .rv-alert-box strong {
          color: #ffffff !important;
          font-weight: 600 !important;
        }
        
        /* 구분선 */
        .rv-divider {
          height: 1px !important;
          background: #2a2a2a !important;
          margin: 50px 0 !important;
        }
        
        /* 반응형 */
        @media screen and (max-width: 768px) {
          .rv-tip-section {
            padding: 60px 0 !important;
          }
          
          .rv-tip-title {
            font-size: 28px !important;
          }
          
          .rv-section-title {
            font-size: 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
