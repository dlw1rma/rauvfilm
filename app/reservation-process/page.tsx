import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "예약절차 | 라우브필름",
  description: "간단한 3단계로 예약이 완료됩니다. 카카오톡 채널로 촬영 가능여부 확인부터 확정문자와 계약서 받기까지.",
  openGraph: {
    title: "예약절차 | 라우브필름",
    description: "간단한 3단계로 예약이 완료됩니다.",
  },
};

export default function ReservationProcessPage() {
  return (
    <div className="rv-process-wrap">
      <section className="rv-process-section">
        <div className="rv-process-container">
          <h2 className="rv-process-title">예약절차</h2>
          <p className="rv-process-subtitle">간단한 3단계로 예약이 완료됩니다</p>
          
          <div className="rv-process-grid">
            {/* Step 1 */}
            <div className="rv-process-step">
              <span className="rv-step-num">1</span>
              <div className="rv-step-icon">💬</div>
              <p className="rv-step-label">카카오톡 채널로</p>
              <p className="rv-step-text">촬영 가능여부 확인</p>
            </div>
            
            {/* Step 2 */}
            <div className="rv-process-step">
              <span className="rv-step-num">2</span>
              <div className="rv-step-icon">📋</div>
              <p className="rv-step-label">계약 희망 시 카카오톡 채널로</p>
              <p className="rv-step-text">예약방법 안내 받기</p>
            </div>
            
            {/* Step 3 */}
            <div className="rv-process-step">
              <span className="rv-step-num">3</span>
              <div className="rv-step-icon">✉️</div>
              <p className="rv-step-label">안내 따라서 완료 후</p>
              <p className="rv-step-text">확정문자와 계약서 받기</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .rv-process-wrap,
        .rv-process-wrap * {
          margin: 0 !important;
          padding: 0 !important;
          box-sizing: border-box !important;
          font-family: "Apple SD Gothic Neo", "애플 SD 산돌고딕 Neo", sans-serif !important;
        }
        
        .rv-process-wrap {
          background: transparent !important;
          color: #e5e7eb !important;
          line-height: 1.7 !important;
        }
        
        .rv-process-container {
          max-width: 1000px !important;
          margin: 0 auto !important;
          padding: 0 20px !important;
        }
        
        .rv-process-section {
          padding: 80px 0 !important;
          background: transparent !important;
        }
        
        .rv-process-title {
          font-size: 36px !important;
          font-weight: 700 !important;
          text-align: center !important;
          margin-bottom: 16px !important;
          color: #ffffff !important;
          position: relative !important;
          padding-bottom: 16px !important;
        }
        
        .rv-process-title::after {
          content: '' !important;
          position: absolute !important;
          bottom: 0 !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          width: 60px !important;
          height: 3px !important;
          background: #e50914 !important;
        }
        
        .rv-process-subtitle {
          text-align: center !important;
          margin-bottom: 60px !important;
          color: #888888 !important;
          font-size: 16px !important;
          font-weight: 500 !important;
        }
        
        /* 스텝 그리드 */
        .rv-process-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 24px !important;
        }
        
        .rv-process-step {
          background: #1a1a1a !important;
          border-radius: 16px !important;
          padding: 40px 28px !important;
          text-align: center !important;
          border: 1px solid #333333 !important;
          transition: border-color 0.3s ease, transform 0.3s ease !important;
          position: relative !important;
        }
        
        .rv-process-step:hover {
          border-color: #e50914 !important;
          transform: translateY(-4px) !important;
        }
        
        /* 스텝 번호 */
        .rv-step-num {
          position: absolute !important;
          top: -16px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: #e50914 !important;
          color: #ffffff !important;
          width: 32px !important;
          height: 32px !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 14px !important;
          font-weight: 700 !important;
        }
        
        /* 아이콘 */
        .rv-step-icon {
          width: 80px !important;
          height: 80px !important;
          margin: 0 auto 24px !important;
          background: #222222 !important;
          border-radius: 50% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          font-size: 36px !important;
        }
        
        /* 작은 레이블 */
        .rv-step-label {
          color: #e50914 !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          margin-bottom: 8px !important;
        }
        
        /* 메인 텍스트 */
        .rv-step-text {
          color: #ffffff !important;
          font-size: 18px !important;
          font-weight: 700 !important;
          line-height: 1.5 !important;
        }
        
        /* 화살표 (데스크탑) */
        .rv-process-step::after {
          content: '→' !important;
          position: absolute !important;
          right: -24px !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          color: #444444 !important;
          font-size: 24px !important;
          font-weight: 300 !important;
        }
        
        .rv-process-step:last-child::after {
          display: none !important;
        }
        
        /* 반응형 */
        @media screen and (max-width: 768px) {
          .rv-process-section {
            padding: 60px 0 !important;
          }
          
          .rv-process-title {
            font-size: 28px !important;
          }
          
          .rv-process-grid {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          
          .rv-process-step::after {
            content: '↓' !important;
            right: 50% !important;
            top: auto !important;
            bottom: -32px !important;
            transform: translateX(50%) !important;
          }
          
          .rv-process-step:last-child::after {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
