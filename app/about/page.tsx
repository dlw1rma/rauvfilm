"use client";

export default function AboutPage() {
  return (
    <>
      <style jsx>{`
        /* 아임웹 위젯 컨테이너 리셋 */
        .rv-wrap,
        .rv-wrap *,
        .rv-section,
        .rv-section * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          font-family: "Apple SD Gothic Neo", "애플 SD 산돌고딕 Neo", sans-serif !important;
          line-height: 1.6 !important;
          border: none !important;
          outline: none !important;
        }
        
        .rv-wrap {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .rv-section {
          max-width: 1100px !important;
          margin: 0 auto !important;
          padding: 80px 24px !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        /* 메인 타이틀 */
        .rv-main-title {
          text-align: center !important;
          font-size: 28px !important;
          font-weight: 500 !important;
          color: #e50914 !important;
          margin-bottom: 60px !important;
          letter-spacing: -0.5px !important;
          line-height: 1.5 !important;
        }
        
        /* 히어로 영역 */
        .rv-hero {
          display: flex !important;
          flex-direction: row !important;
          justify-content: center !important;
          align-items: center !important;
          margin-bottom: 60px !important;
        }
        
        .rv-hero-text {
          flex: none !important;
          text-align: center !important;
          max-width: 700px !important;
        }
        
        .rv-hero-text p {
          font-size: 18px !important;
          line-height: 2 !important;
          color: #e5e7eb !important;
          font-weight: 300 !important;
          margin-bottom: 28px !important;
        }
        
        .rv-hero-text p:last-child {
          margin-bottom: 0 !important;
        }
        
        /* 구분선 */
        .rv-divider {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          margin: 60px 0 !important;
          height: 20px !important;
        }
        
        .rv-divider-line {
          flex: 1 !important;
          height: 1px !important;
          background: #444444 !important;
        }
        
        .rv-divider-dot {
          width: 8px !important;
          height: 8px !important;
          background-color: #e50914 !important;
          transform: rotate(45deg) !important;
          margin: 0 20px !important;
          flex-shrink: 0 !important;
        }
        
        /* 카드 그리드 */
        .rv-cards {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 24px !important;
        }
        
        /* 텍스트 카드 */
        .rv-card {
          background: transparent !important;
          border: 1px solid #333333 !important;
          border-radius: 8px !important;
          padding: 40px 36px !important;
          transition: transform 0.2s ease, border-color 0.2s ease !important;
          cursor: default !important;
        }
        
        .rv-card:hover {
          transform: translateY(-4px) !important;
          border-color: #e50914 !important;
        }
        
        .rv-card-title {
          font-size: 20px !important;
          font-weight: 600 !important;
          color: #ffffff !important;
          margin-bottom: 22px !important;
          letter-spacing: -0.3px !important;
          line-height: 1.4 !important;
          white-space: normal !important;
        }
        
        .rv-card-title .rv-red {
          color: #e50914 !important;
          font-weight: 600 !important;
        }
        
        .rv-card-desc {
          font-size: 15px !important;
          line-height: 1.9 !important;
          color: #e5e7eb !important;
          font-weight: 300 !important;
        }
        
        .rv-card-desc .rv-white {
          color: #ffffff !important;
          font-weight: 500 !important;
        }
        
        /* 모바일 반응형 */
        @media screen and (max-width: 768px) {
          .rv-section {
            padding: 60px 16px !important;
          }
          
          .rv-main-title {
            font-size: 22px !important;
            margin-bottom: 40px !important;
          }
          
          .rv-hero {
            flex-direction: column !important;
          }
          
          .rv-hero-text {
            text-align: center !important;
          }
          
          .rv-hero-text p {
            font-size: 16px !important;
          }
          
          .rv-cards {
            grid-template-columns: 1fr !important;
          }
          
          .rv-card {
            padding: 32px 28px !important;
          }
          
          .rv-card-title {
            font-size: 18px !important;
          }
          
          .rv-card-desc {
            font-size: 14px !important;
          }
        }
      `}</style>

      <div className="rv-wrap">
        <div className="rv-section">
          {/* 메인 타이틀 */}
          <h2 className="rv-main-title">'감정을 영원히 보존할 수 있게 기억을 담는 일을 합니다.'</h2>
          
          {/* 히어로 콘텐츠 */}
          <div className="rv-hero">
            <div className="rv-hero-text">
              <p>
                단순히 카메라를 들고 촬영하는 사람이 아닌.<br />
                특별한 날의 모습과 감정을 이해하고 <br />
                가장 아름다운 방식으로 기억하는 스토리텔러입니다.
              </p>
            </div>
          </div>
          
          {/* 구분선 */}
          <div className="rv-divider">
            <div className="rv-divider-line"></div>
            <div className="rv-divider-dot"></div>
            <div className="rv-divider-line"></div>
          </div>
          
          {/* 카드 그리드 */}
          <div className="rv-cards">
            {/* 카드 1 */}
            <div className="rv-card">
              <h3 className="rv-card-title">생생하게 담아내는 <span className="rv-red">영화 같은 영상미</span></h3>
              <p className="rv-card-desc">
                지금 감정이, 오래 지나도 낯설지 않도록<br />
                과한 연출과 인위적 촬영보다는<br />
                느낌과 분위기를 살린 감정이 실린 영상을 만듭니다.<br />
                한 번 보고 끝나는 영상이 아니라,<br />
                <span className="rv-white">10년 후에도 더 따뜻해지는 영상</span>이 되길 바랍니다.
              </p>
            </div>
            
            {/* 카드 2 */}
            <div className="rv-card">
              <h3 className="rv-card-title">기록이 아닌, <span className="rv-red">기억을 담기 위해</span></h3>
              <p className="rv-card-desc">
                예식장의 분위기, 드레스, 부케, 메이크업 하나<br />
                흘려보지 않고 담아냅니다.<br />
                가장 예쁜 모습의 기억을 남겨드리기 위한 사명감이 있기에<br />
                우리가 <span className="rv-white">영화처럼 촬영, 색감/피부보정, 편집</span>하는 이유입니다.
              </p>
            </div>
            
            {/* 카드 3 */}
            <div className="rv-card">
              <h3 className="rv-card-title">외주 없이, <span className="rv-red">끝까지 직접</span></h3>
              <p className="rv-card-desc">
                라우브필름의 영상은 알바 인력이 아닌<br />
                전속 감독과 대표의 손끝에서 완성됩니다.<br />
                전문화된 교육과정을 통과한 감독님들로 구성되어 촬영하며<br />
                자연스럽게 흐르도록 편집합니다.<br />
                <span className="rv-white">오래 기억에 남는 영상</span>은 수많은 고민 끝에 만들어집니다.
              </p>
            </div>
            
            {/* 카드 4 */}
            <div className="rv-card">
              <h3 className="rv-card-title">시간이 지나도 <span className="rv-red">선명한 고화질로</span></h3>
              <p className="rv-card-desc">
                결혼식은 짧지만,<br />
                기억을 담은 영상은 평생갑니다.<br />
                라우브필름은 그 하루가 흐릿해지지 않도록,<br />
                선명한 화질인 4K와 천만원이 넘는 장비들로 작업됩니다.<br />
                지금보다 시간이 지날수록 소중해지는 영상<br />
                그래서 우리는 <span className="rv-white">시간이 지나도 소중한 영상</span>을 만듭니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
