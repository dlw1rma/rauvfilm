"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Reservation {
  id: number;
  title: string;
  content: string | null;
  author: string;
  isPrivate: boolean;
  createdAt: string;
  // 필수 작성항목(공통)
  brideName: string | null;
  bridePhone: string | null;
  groomName: string | null;
  groomPhone: string | null;
  receiptPhone: string | null;
  depositName: string | null;
  productEmail: string | null;
  productType: string | null;
  partnerCode: string | null;
  foundPath: string | null;
  termsAgreed: boolean | null;
  faqRead: boolean | null;
  privacyAgreed: boolean | null;
  // 본식 영상 예약
  weddingDate: string | null;
  weddingTime: string | null;
  venueName: string | null;
  venueFloor: string | null;
  guestCount: number | null;
  makeupShoot: boolean | null;
  paebaekShoot: boolean | null;
  receptionShoot: boolean | null;
  mainSnapCompany: string | null;
  makeupShop: string | null;
  dressShop: string | null;
  deliveryAddress: string | null;
  seonwonpan: boolean | null;
  gimbalShoot: boolean | null;
  playbackDevice: string | null;
  // 이벤트 예약
  eventType: string | null;
  shootLocation: string | null;
  shootDate: string | null;
  shootTime: string | null;
  shootConcept: string | null;
  // 할인사항
  discountCouple: boolean | null;
  discountReview: boolean | null;
  discountNewYear: boolean | null;
  discountReviewBlog: boolean | null;
  // 특이사항
  specialNotes: string | null;
  reply: {
    id: number;
    content: string;
    createdAt: string;
  } | null;
}

export default function AdminReservationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAdminAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedId) {
      fetchReservationDetail(selectedId);
    }
  }, [selectedId]);

  const fetchReservations = async () => {
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (error) {
      console.error("Failed to fetch reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservationDetail = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/reservations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedReservation(data);
      }
    } catch (error) {
      console.error("Failed to fetch reservation detail:", error);
    }
  };

  const handleReply = async () => {
    if (!selectedId || !replyContent.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/reservations/${selectedId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent }),
      });

      if (res.ok) {
        await fetchReservations();
        await fetchReservationDetail(selectedId);
        setReplyContent("");
        alert("답변이 등록되었습니다.");
      } else {
        const data = await res.json();
        alert(data.error || "답변 등록에 실패했습니다.");
      }
    } catch (error) {
      console.error("Reply error:", error);
      alert("오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminDelete: true }),
      });

      if (res.ok) {
        await fetchReservations();
        setSelectedId(null);
        setSelectedReservation(null);
        alert("삭제되었습니다.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const downloadAsTxt = () => {
    if (!selectedReservation) return;

    let txt = "=".repeat(60) + "\n";
    txt += "예약 문의 상세 정보\n";
    txt += "=".repeat(60) + "\n\n";

    // 기본 정보
    txt += "[기본 정보]\n";
    txt += `제목: ${selectedReservation.title}\n`;
    txt += `작성자(계약자): ${selectedReservation.author}\n`;
    txt += `작성일: ${new Date(selectedReservation.createdAt).toLocaleString("ko-KR")}\n`;
    txt += `비밀글: ${selectedReservation.isPrivate ? "예" : "아니오"}\n`;
    if (selectedReservation.content) {
      txt += `문의 내용: ${selectedReservation.content}\n`;
    }
    txt += "\n";

    // 필수 작성항목(공통)
    txt += "[필수 작성항목(공통)]\n";
    txt += `신부님 성함: ${selectedReservation.brideName || "-"}\n`;
    txt += `신부님 전화번호: ${selectedReservation.bridePhone || "-"}\n`;
    txt += `신랑님 성함: ${selectedReservation.groomName || "-"}\n`;
    txt += `신랑님 전화번호: ${selectedReservation.groomPhone || "-"}\n`;
    txt += `현금 영수증 받으실 전화번호: ${selectedReservation.receiptPhone || "-"}\n`;
    txt += `예약금 입금자명: ${selectedReservation.depositName || "-"}\n`;
    txt += `상품 받으실 E-mail 주소: ${selectedReservation.productEmail || "-"}\n`;
    txt += `상품 종류: ${selectedReservation.productType || "-"}\n`;
    txt += `짝궁 코드: ${selectedReservation.partnerCode || "-"}\n`;
    txt += `라우브필름 알게된 경로: ${selectedReservation.foundPath || "-"}\n`;
    txt += `약관 동의: ${selectedReservation.termsAgreed ? "동의" : "미동의"}\n`;
    txt += `FAQ 읽음: ${selectedReservation.faqRead ? "읽음" : "미읽음"}\n`;
    txt += `개인정보 활용 동의: ${selectedReservation.privacyAgreed ? "동의" : "미동의"}\n`;
    txt += "\n";

    // 본식 영상 예약 정보
    if (selectedReservation.productType === "가성비형" || 
        selectedReservation.productType === "기본형" || 
        selectedReservation.productType === "시네마틱형") {
      txt += "[본식 영상 예약 정보]\n";
      txt += `예식 날짜: ${selectedReservation.weddingDate || "-"}\n`;
      txt += `예식 시간: ${selectedReservation.weddingTime || "-"}\n`;
      txt += `장소명: ${selectedReservation.venueName || "-"}\n`;
      txt += `층/홀이름: ${selectedReservation.venueFloor || "-"}\n`;
      txt += `초대인원: ${selectedReservation.guestCount || "-"}\n`;
      txt += `메이크업샵 촬영: ${selectedReservation.makeupShoot ? "예" : "아니오"}\n`;
      txt += `폐백 촬영: ${selectedReservation.paebaekShoot ? "예" : "아니오"}\n`;
      txt += `피로연(2부 예식) 촬영: ${selectedReservation.receptionShoot ? "예" : "아니오"}\n`;
      txt += `선원판 진행 여부: ${selectedReservation.seonwonpan ? "예" : "아니오"}\n`;
      txt += `짐벌(커스텀) 촬영: ${selectedReservation.gimbalShoot ? "예" : "아니오"}\n`;
      txt += `메인스냅 촬영 업체명: ${selectedReservation.mainSnapCompany || "-"}\n`;
      txt += `메이크업샵 상호명: ${selectedReservation.makeupShop || "-"}\n`;
      txt += `드레스샵 상호명: ${selectedReservation.dressShop || "-"}\n`;
      txt += `(USB)상품받으실 거주지 주소: ${selectedReservation.deliveryAddress || "-"}\n`;
      txt += `본식 영상 주 재생매체: ${selectedReservation.playbackDevice || "-"}\n`;
      txt += "\n";
    }

    // 이벤트 예약 정보
    if (selectedReservation.eventType) {
      txt += "[이벤트 예약 정보]\n";
      txt += `이벤트 촬영: ${selectedReservation.eventType}\n`;
      txt += `희망 촬영 장소: ${selectedReservation.shootLocation || "-"}\n`;
      txt += `촬영 날짜: ${selectedReservation.shootDate || "-"}\n`;
      txt += `촬영 시간: ${selectedReservation.shootTime || "-"}\n`;
      txt += `원하시는 컨셉: ${selectedReservation.shootConcept || "-"}\n`;
      txt += "\n";
    }

    // 할인사항
    const discounts: string[] = [];
    if (selectedReservation.discountNewYear) discounts.push("신년할인");
    if (selectedReservation.discountReview) discounts.push("블로그와 카페 촬영후기 (총 2만원 페이백)");
    if (selectedReservation.discountCouple) discounts.push("짝궁할인");
    if (selectedReservation.discountReviewBlog) discounts.push("블로그와 카페 예약후기 (총 2만원 +SNS영상 + 원본영상)");
    
    if (discounts.length > 0) {
      txt += "[할인사항]\n";
      discounts.forEach(discount => {
        txt += `- ${discount}\n`;
      });
      txt += "\n";
    }

    // 특이사항
    if (selectedReservation.specialNotes) {
      txt += "[특이사항 및 요구사항]\n";
      txt += `${selectedReservation.specialNotes}\n`;
      txt += "\n";
    }

    // 답변
    if (selectedReservation.reply) {
      txt += "[관리자 답변]\n";
      txt += `${selectedReservation.reply.content}\n`;
      txt += `답변일: ${new Date(selectedReservation.reply.createdAt).toLocaleString("ko-KR")}\n`;
      txt += "\n";
    }

    txt += "=".repeat(60) + "\n";

    // 파일 다운로드
    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `예약문의_${selectedReservation.id}_${selectedReservation.author}_${new Date(selectedReservation.createdAt).toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold">예약 관리</h1>
          <p className="mt-1 text-muted-foreground">
            고객 예약 문의를 확인하고 답변합니다.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* List */}
          <div className="lg:col-span-1 rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-medium">예약 목록</h2>
              <span className="text-sm text-muted-foreground">
                {reservations.filter((r) => !r.reply).length}건 대기중
              </span>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {reservations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  등록된 예약 문의가 없습니다.
                </div>
              ) : (
                reservations.map((reservation) => (
                  <button
                    key={reservation.id}
                    onClick={() => setSelectedId(reservation.id)}
                    className={`w-full text-left px-4 py-4 transition-colors hover:bg-muted/50 ${
                      selectedId === reservation.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!reservation.reply && (
                        <span className="h-2 w-2 rounded-full bg-accent" />
                      )}
                      <span className="font-medium text-sm">{reservation.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{reservation.author}</span>
                      <span>|</span>
                      <span>{reservation.createdAt.split("T")[0]}</span>
                      <span>|</span>
                      <span>{reservation.reply ? "답변완료" : "대기중"}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="lg:col-span-2 rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-medium">상세 정보</h2>
              {selectedReservation && (
                <button
                  onClick={downloadAsTxt}
                  className="text-sm text-accent hover:text-accent-hover transition-colors font-medium"
                >
                  TXT 다운로드
                </button>
              )}
            </div>
            {selectedReservation ? (
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">{selectedReservation.title}</h3>
                  <button
                    onClick={() => handleDelete(selectedReservation.id)}
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    삭제
                  </button>
                </div>

                {/* 기본 정보 */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-accent">기본 정보</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">작성자(계약자)</p>
                      <p className="font-medium">{selectedReservation.author}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">작성일</p>
                      <p className="font-medium">
                        {new Date(selectedReservation.createdAt).toLocaleString("ko-KR")}
                      </p>
                    </div>
                    {selectedReservation.content && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">문의 내용</p>
                        <p className="font-medium whitespace-pre-wrap">{selectedReservation.content}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 필수 작성항목(공통) */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3 text-accent">필수 작성항목(공통)</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">신부님 성함</p>
                      <p className="font-medium">{selectedReservation.brideName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">신부님 전화번호</p>
                      <p className="font-medium">{selectedReservation.bridePhone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">신랑님 성함</p>
                      <p className="font-medium">{selectedReservation.groomName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">신랑님 전화번호</p>
                      <p className="font-medium">{selectedReservation.groomPhone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">현금 영수증 전화번호</p>
                      <p className="font-medium">{selectedReservation.receiptPhone || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">예약금 입금자명</p>
                      <p className="font-medium">{selectedReservation.depositName || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">상품 받을 E-mail</p>
                      <p className="font-medium">{selectedReservation.productEmail || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">상품 종류</p>
                      <p className="font-medium">{selectedReservation.productType || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">짝궁 코드</p>
                      <p className="font-medium">{selectedReservation.partnerCode || "-"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">알게된 경로</p>
                      <p className="font-medium">{selectedReservation.foundPath || "-"}</p>
                    </div>
                  </div>
                </div>

                {/* 본식 영상 예약 정보 */}
                {(selectedReservation.productType === "가성비형" || 
                  selectedReservation.productType === "기본형" || 
                  selectedReservation.productType === "시네마틱형") && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-accent">본식 영상 예약 정보</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">예식 날짜</p>
                        <p className="font-medium">{selectedReservation.weddingDate || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">예식 시간</p>
                        <p className="font-medium">{selectedReservation.weddingTime || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">장소명</p>
                        <p className="font-medium">{selectedReservation.venueName || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">층/홀이름</p>
                        <p className="font-medium">{selectedReservation.venueFloor || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">초대인원</p>
                        <p className="font-medium">{selectedReservation.guestCount || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">주 재생매체</p>
                        <p className="font-medium">{selectedReservation.playbackDevice || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground mb-1">추가 촬영</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReservation.makeupShoot && <span className="px-2 py-1 bg-muted rounded text-xs">메이크업샵</span>}
                          {selectedReservation.paebaekShoot && <span className="px-2 py-1 bg-muted rounded text-xs">폐백</span>}
                          {selectedReservation.receptionShoot && <span className="px-2 py-1 bg-muted rounded text-xs">피로연(2부)</span>}
                          {selectedReservation.seonwonpan && <span className="px-2 py-1 bg-muted rounded text-xs">선원판</span>}
                          {selectedReservation.gimbalShoot && <span className="px-2 py-1 bg-muted rounded text-xs">짐벌(커스텀)</span>}
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">메인스냅 업체</p>
                        <p className="font-medium">{selectedReservation.mainSnapCompany || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">메이크업샵</p>
                        <p className="font-medium">{selectedReservation.makeupShop || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">드레스샵</p>
                        <p className="font-medium">{selectedReservation.dressShop || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">배송 주소</p>
                        <p className="font-medium">{selectedReservation.deliveryAddress || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 이벤트 예약 정보 */}
                {selectedReservation.eventType && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-accent">이벤트 예약 정보</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">이벤트 촬영</p>
                        <p className="font-medium">{selectedReservation.eventType}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">희망 촬영 장소</p>
                        <p className="font-medium">{selectedReservation.shootLocation || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">촬영 날짜</p>
                        <p className="font-medium">{selectedReservation.shootDate || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">촬영 시간</p>
                        <p className="font-medium">{selectedReservation.shootTime || "-"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">원하시는 컨셉</p>
                        <p className="font-medium whitespace-pre-wrap">{selectedReservation.shootConcept || "-"}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 할인사항 */}
                {(selectedReservation.discountCouple || 
                  selectedReservation.discountReview || 
                  selectedReservation.discountNewYear ||
                  selectedReservation.discountReviewBlog) && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-accent">할인사항</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedReservation.discountNewYear && <span className="px-3 py-1 bg-accent/10 text-accent rounded text-sm">신년할인</span>}
                      {selectedReservation.discountReview && <span className="px-3 py-1 bg-accent/10 text-accent rounded text-sm">블로그와 카페 촬영후기</span>}
                      {selectedReservation.discountCouple && <span className="px-3 py-1 bg-accent/10 text-accent rounded text-sm">짝궁할인</span>}
                      {selectedReservation.discountReviewBlog && <span className="px-3 py-1 bg-accent/10 text-accent rounded text-sm">블로그와 카페 예약후기</span>}
                    </div>
                  </div>
                )}

                {/* 특이사항 */}
                {selectedReservation.specialNotes && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-3 text-accent">특이사항 및 요구사항</h4>
                    <div className="rounded-lg bg-background p-4 text-sm whitespace-pre-wrap">
                      {selectedReservation.specialNotes}
                    </div>
                  </div>
                )}

                {/* 답변 */}
                {!selectedReservation.reply ? (
                  <div>
                    <h4 className="font-semibold mb-3 text-accent">답변 작성</h4>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={4}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="답변을 입력하세요..."
                    />
                    <button
                      onClick={handleReply}
                      disabled={submitting || !replyContent.trim()}
                      className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50"
                    >
                      {submitting ? "등록 중..." : "답변 등록"}
                    </button>
                  </div>
                ) : (
                  <div className="rounded-lg bg-accent/5 border border-accent/20 p-4">
                    <h4 className="text-sm font-medium text-accent mb-2">답변 완료</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedReservation.reply.content}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(selectedReservation.reply.createdAt).toLocaleString("ko-KR")}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                목록에서 예약을 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
