"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatDateTime } from "@/lib/formatDate";
import { useMypageTranslation } from "@/components/mypage/MypageTranslationProvider";

interface ReservationDetail {
  id: number;
  title: string;
  content: string | null;
  author: string;
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
  usbOption: boolean | null;
  seonwonpan: boolean | null;
  gimbalShoot: boolean | null;
  playbackDevice: string | null;
  eventType: string | null;
  shootLocation: string | null;
  shootDate: string | null;
  shootTime: string | null;
  shootConcept: string | null;
  discountCouple: boolean | null;
  discountReview: boolean | null;
  discountNewYear: boolean | null;
  discountReviewBlog: boolean | null;
  specialNotes: string | null;
  customShootingRequest: boolean | null;
  customStyle: string | null;
  customEditStyle: string | null;
  customMusic: string | null;
  customLength: string | null;
  customEffect: string | null;
  customContent: string | null;
  customSpecialRequest: string | null;
  eventSnapApplications?: Array<{
    id: number;
    type: string;
    status: string;
    shootDate: string | null;
    shootTime: string | null;
    shootLocation: string | null;
  }>;
  reviewLink?: string | null;
  reviewRefundAccount?: string | null;
  reviewRefundDepositorName?: string | null;
  createdAt?: string | null;
}

function DetailRow({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
  fullWidth?: boolean;
}) {
  const display =
    value === null || value === undefined || value === ""
      ? "—"
      : typeof value === "boolean"
        ? value
          ? "예"
          : "아니오"
        : String(value);
  if (fullWidth) {
    return (
      <div className="py-3 border-b border-border/50 last:border-0">
        <div className="text-sm font-medium text-muted-foreground mb-1">{label}</div>
        <div className="text-sm text-foreground whitespace-pre-wrap break-words">{display}</div>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-x-4 gap-y-1 py-2 border-b border-border/50 last:border-0 items-baseline">
      <span className="text-sm font-medium text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm break-words">{display}</span>
    </div>
  );
}

export default function MypageReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useMypageTranslation();
  const [data, setData] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDetail() {
      try {
        const res = await fetch(`/api/mypage/reservations/${params.id}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push("/mypage/login");
            return;
          }
          if (res.status === 403) {
            setError(t.noPermission || "권한이 없습니다.");
            return;
          }
          setError(t.loadFailed || "예약 정보를 불러올 수 없습니다.");
          return;
        }
        const json = await res.json();
        setData(json);
      } catch {
        setError(t.errorOccurred || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [params.id, router, t]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-muted border-t-accent" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/mypage/reservations" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm">
          {t.backToReservationList || '← 예약글 목록'}
        </Link>
        <div className="rounded-xl border border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">{error || (t.reservationNotFound || "예약을 찾을 수 없습니다.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/mypage/reservations" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm">
          {t.backToReservationList || '← 예약글 목록'}
        </Link>
        <Link
          href={`/mypage/reservations/${params.id}/edit`}
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          {t.edit || '수정하기'}
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-background overflow-hidden">
        <div className="border-b border-border px-6 py-4 bg-muted/30">
          <h1 className="text-xl font-bold">{data.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <p className="text-sm text-muted-foreground">{t.reservationDetailMypage || '예약글 상세 (마이페이지)'}</p>
            {data.createdAt && (
              <p className="text-sm text-muted-foreground">
                {t.createdDate || '작성일'}: {formatDateTime(data.createdAt)}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* 기본 정보 */}
          <section className="rounded-lg border border-border/50 p-4 bg-muted/20">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t.basicInfo || '기본 정보'}</h2>
            <div className="space-y-0">
              <DetailRow label={t.contractorAuthor || "계약자(작성자)"} value={data.author} />
              <DetailRow label={t.inquiryContent || "문의 내용"} value={data.content} fullWidth />
            </div>
          </section>

          {/* 필수 작성항목(공통) */}
          <section className="rounded-lg border border-border/50 p-4 bg-muted/20">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t.requiredFields || '필수 작성항목(공통)'}</h2>
            <div className="space-y-0">
              <DetailRow label={t.brideName || "신부님 성함"} value={data.brideName} />
              <DetailRow label={t.bridePhone || "신부님 전화번호"} value={data.bridePhone} />
              <DetailRow label={t.groomName || "신랑님 성함"} value={data.groomName} />
              <DetailRow label={t.groomPhone || "신랑님 전화번호"} value={data.groomPhone} />
              <DetailRow label={t.receiptPhone || "현금 영수증 받으실 전화번호"} value={data.receiptPhone} />
              <DetailRow label={t.depositNameLabel || "예약금 입금자명"} value={data.depositName} />
              <DetailRow label={t.productEmailLabel || "상품 받으실 이메일"} value={data.productEmail} />
              <DetailRow label={t.foundPathLabel || "라우브필름 알게된 경로"} value={data.foundPath} />
              {data.discountCouple && <DetailRow label={t.partnerCode} value={data.partnerCode} />}
            </div>
          </section>

          {/* 본식 영상 예약 */}
          {(data.productType === "가성비형" || data.productType === "기본형" || data.productType === "시네마틱형") && (
            <section className="rounded-lg border border-border/50 p-4 bg-muted/20">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t.weddingVideoReservation || '본식 영상 예약'}</h2>
              <div className="space-y-0">
                <DetailRow label={t.productTypeLabel || "상품 종류"} value={data.productType} />
                <DetailRow label={t.weddingDateLabel || "예식 날짜"} value={data.weddingDate} />
                <DetailRow label={t.weddingTimeLabel || "예식 시간"} value={data.weddingTime} />
                <DetailRow label={t.venueNameLabel || "장소명"} value={data.venueName} />
                <DetailRow label={t.venueFloorLabel || "층/홀"} value={data.venueFloor} />
                <DetailRow label={t.guestCountLabel || "초대 인원"} value={data.guestCount} />
                <DetailRow label={t.makeupShootLabel || "메이크업샵 촬영"} value={data.makeupShoot} />
                <DetailRow label={t.paebaekShootLabel || "폐백 촬영"} value={data.paebaekShoot} />
                <DetailRow label={t.receptionShootLabel || "피로연(2부) 촬영"} value={data.receptionShoot} />
                <DetailRow label={t.mainSnapCompanyLabel || "메인스냅 촬영 업체"} value={data.mainSnapCompany} />
                <DetailRow label={t.makeupShopLabel || "메이크업샵 상호"} value={data.makeupShop} />
                <DetailRow label={t.dressShopLabel || "드레스샵 상호"} value={data.dressShop} />
                <DetailRow label={t.usbOptionLabel || "USB 추가"} value={data.usbOption} />
                <DetailRow label={t.seonwonpanLabel || "선원판 진행"} value={data.seonwonpan} />
                <DetailRow label={t.gimbalShootLabel || "짐벌(커스텀) 촬영"} value={data.gimbalShoot} />
                <DetailRow label={t.playbackDeviceLabel || "주 재생매체"} value={data.playbackDevice} />
                {data.usbOption && <DetailRow label={t.deliveryAddressLabel || "상품 받으실 주소"} value={data.deliveryAddress} />}
              </div>
            </section>
          )}

          {/* 할인사항 */}
          <section className="rounded-lg border border-border/50 p-4 bg-muted/20">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t.discountSection || '할인사항'}</h2>
            <div className="space-y-0">
              <DetailRow label={t.discountNewYearLabel || "2026 신년할인"} value={data.discountNewYear} />
              <DetailRow label={t.discountReviewLabel || "촬영후기 페이백"} value={data.discountReview} />
              <DetailRow label={t.discountCoupleLabel || "짝꿍할인"} value={data.discountCouple} />
              <DetailRow label={t.discountReviewBlogLabel || "예약후기 할인"} value={data.discountReviewBlog} />
            </div>
          </section>

          {/* 특이사항 */}
          {(data.specialNotes || data.customShootingRequest || data.customSpecialRequest) && (
            <section className="rounded-lg border border-border/50 p-4 bg-muted/20">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t.specialNotesSection || '특이사항 및 요청'}</h2>
              <div className="space-y-0">
                <DetailRow label={t.specialNotesLabel || "특이사항"} value={data.specialNotes} fullWidth />
                <DetailRow label={t.customShootingLabel || "커스텀 촬영 요청"} value={data.customShootingRequest} />
                <DetailRow label={t.customStyleLabel || "커스텀 스타일"} value={data.customStyle} />
                <DetailRow label={t.customEditStyleLabel || "편집 스타일"} value={data.customEditStyle} />
                <DetailRow label={t.customMusicLabel || "음악 장르"} value={data.customMusic} />
                <DetailRow label={t.customLengthLabel || "영상 길이"} value={data.customLength} />
                <DetailRow label={t.customEffectLabel || "추가 효과"} value={data.customEffect} />
                <DetailRow label={t.customContentLabel || "추가 옵션"} value={data.customContent} />
                <DetailRow label={t.customSpecialRequestLabel || "특별 요청사항"} value={data.customSpecialRequest} fullWidth />
              </div>
            </section>
          )}

          {/* 야외스냅/프리웨딩 신청 */}
          {(data.eventSnapApplications?.length ?? 0) > 0 && (
            <section className="rounded-lg border border-border/50 p-4 bg-muted/20">
              <h2 className="text-sm font-semibold text-muted-foreground mb-3">{t.eventSnapApply}</h2>
              <ul className="space-y-2">
                {data.eventSnapApplications!.map((ev) => (
                  <li key={ev.id} className="rounded-lg border border-border p-3 text-sm">
                    <span className="font-medium">{ev.type}</span>
                    {ev.status === "CONFIRMED" && <span className="ml-2 text-green-600 text-xs">{t.confirmed || '확정'}</span>}
                    {ev.shootDate && <span className="ml-2">{ev.shootDate}</span>}
                    {ev.shootTime && <span className="ml-2">{ev.shootTime}</span>}
                    {ev.shootLocation && <span className="ml-2 text-muted-foreground">{ev.shootLocation}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
