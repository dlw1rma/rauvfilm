"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type ProductType = "가성비형" | "기본형" | "시네마틱형" | "야외스냅" | "프리웨딩" | "";
type EventType = "야외스냅" | "프리웨딩" | "";

interface ReservationData {
  id: number;
  title: string;
  content: string;
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
}

export default function EditReservationPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const passwordFromQuery = searchParams.get("token") || "";

  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    brideName: "",
    bridePhone: "",
    groomName: "",
    groomPhone: "",
    receiptPhone: "",
    depositName: "",
    productEmail: "",
    productType: "" as ProductType,
    partnerCode: "",
    foundPath: "",
    weddingDate: "",
    weddingTime: "",
    venueName: "",
    venueFloor: "",
    guestCount: "",
    makeupShoot: false,
    paebaekShoot: false,
    receptionShoot: false,
    mainSnapCompany: "",
    makeupShop: "",
    dressShop: "",
    deliveryAddress: "",
    usbOption: false,
    seonwonpan: false,
    gimbalShoot: false,
    playbackDevice: "",
    eventType: "" as EventType,
    shootLocation: "",
    shootDate: "",
    shootTime: "",
    shootConcept: "",
    discountCouple: false,
    discountReview: false,
    discountNewYear: true,
    discountReviewBlog: false,
    specialNotes: "",
    customShootingRequest: false,
    customStyle: [] as string[],
    customEditStyle: [] as string[],
    customMusic: [] as string[],
    customLength: [] as string[],
    customEffect: [] as string[],
    customContent: [] as string[],
    customSpecialRequest: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 전화번호 포맷팅 (하이픈 추가)
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/[^0-9]/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    if (numbers.length <= 11) return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  useEffect(() => {
    async function fetchReservation() {
      try {
        const res = await fetch(`/api/reservations/${params.id}?password=${encodeURIComponent(passwordFromQuery)}`);
        if (!res.ok) {
          throw new Error("예약 정보를 불러올 수 없습니다.");
        }
        const data: ReservationData = await res.json();

        // 콤마로 구분된 문자열을 배열로 변환
        const parseArrayField = (value: string | null): string[] => {
          if (!value) return [];
          return value.split(", ").filter(Boolean);
        };

        setFormData({
          title: data.title || "",
          brideName: data.brideName || "",
          bridePhone: data.bridePhone ? formatPhoneNumber(data.bridePhone) : "",
          groomName: data.groomName || "",
          groomPhone: data.groomPhone ? formatPhoneNumber(data.groomPhone) : "",
          receiptPhone: data.receiptPhone ? formatPhoneNumber(data.receiptPhone) : "",
          depositName: data.depositName || "",
          productEmail: data.productEmail || "",
          productType: (data.productType as ProductType) || "",
          partnerCode: data.partnerCode || "",
          foundPath: data.foundPath || "",
          weddingDate: data.weddingDate?.split("T")[0] || "",
          weddingTime: data.weddingTime || "",
          venueName: data.venueName || "",
          venueFloor: data.venueFloor || "",
          guestCount: data.guestCount?.toString() || "",
          makeupShoot: data.makeupShoot || false,
          paebaekShoot: data.paebaekShoot || false,
          receptionShoot: data.receptionShoot || false,
          mainSnapCompany: data.mainSnapCompany || "",
          makeupShop: data.makeupShop || "",
          dressShop: data.dressShop || "",
          deliveryAddress: data.deliveryAddress || "",
          usbOption: data.usbOption || false,
          seonwonpan: data.seonwonpan || false,
          gimbalShoot: data.gimbalShoot || false,
          playbackDevice: data.playbackDevice || "",
          eventType: (data.eventType as EventType) || "",
          shootLocation: data.shootLocation || "",
          shootDate: data.shootDate?.split("T")[0] || "",
          shootTime: data.shootTime || "",
          shootConcept: data.shootConcept || "",
          discountCouple: data.discountCouple || false,
          discountReview: data.discountReview || false,
          discountNewYear: data.discountNewYear ?? true,
          discountReviewBlog: data.discountReviewBlog || false,
          specialNotes: data.specialNotes || "",
          customShootingRequest: data.customShootingRequest || false,
          customStyle: parseArrayField(data.customStyle),
          customEditStyle: parseArrayField(data.customEditStyle),
          customMusic: parseArrayField(data.customMusic),
          customLength: parseArrayField(data.customLength),
          customEffect: parseArrayField(data.customEffect),
          customContent: parseArrayField(data.customContent),
          customSpecialRequest: data.customSpecialRequest || "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchReservation();
  }, [params.id, passwordFromQuery]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // 전화번호 필드는 하이픈 자동 추가
    if ((name === "bridePhone" || name === "groomPhone" || name === "receiptPhone") && type !== "checkbox") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({
        ...prev,
        [name]: formatted,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/reservations/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          password: passwordFromQuery,
          // 배열 필드를 문자열로 변환
          customStyle: Array.isArray(formData.customStyle) ? formData.customStyle.join(", ") : formData.customStyle,
          customEditStyle: Array.isArray(formData.customEditStyle) ? formData.customEditStyle.join(", ") : formData.customEditStyle,
          customMusic: Array.isArray(formData.customMusic) ? formData.customMusic.join(", ") : formData.customMusic,
          customLength: Array.isArray(formData.customLength) ? formData.customLength.join(", ") : formData.customLength,
          customEffect: Array.isArray(formData.customEffect) ? formData.customEffect.join(", ") : formData.customEffect,
          customContent: Array.isArray(formData.customContent) ? formData.customContent.join(", ") : formData.customContent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "수정에 실패했습니다.");
      }

      router.push(`/reservation/${params.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    );
  }

  const totalSections = 4;

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/reservation/${params.id}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            돌아가기
          </Link>
          <h1 className="text-3xl font-bold">예약 문의 수정</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            예약 정보를 수정할 수 있습니다.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4].map((section) => (
              <div
                key={section}
                className={`flex-1 h-2 rounded-full mx-1 ${
                  section <= currentSection
                    ? "bg-accent"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-center text-muted-foreground">
            {currentSection} / {totalSections}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-accent/30 bg-accent/5 p-4">
            <p className="text-sm text-accent">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: 기본 정보 */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">1. 예약자 정보</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="brideName" className="mb-2 block text-sm font-medium">
                    신부님 성함 <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="brideName"
                    name="brideName"
                    required
                    value={formData.brideName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="bridePhone" className="mb-2 block text-sm font-medium">
                    신부님 전화번호 <span className="text-accent">*</span>
                  </label>
                  <input
                    type="tel"
                    id="bridePhone"
                    name="bridePhone"
                    required
                    value={formData.bridePhone}
                    onChange={handleChange}
                    maxLength={13}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="010-1234-5678"
                  />
                </div>
                <div>
                  <label htmlFor="groomName" className="mb-2 block text-sm font-medium">
                    신랑님 성함 <span className="text-accent">*</span>
                  </label>
                  <input
                    type="text"
                    id="groomName"
                    name="groomName"
                    required
                    value={formData.groomName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="groomPhone" className="mb-2 block text-sm font-medium">
                    신랑님 전화번호 <span className="text-accent">*</span>
                  </label>
                  <input
                    type="tel"
                    id="groomPhone"
                    name="groomPhone"
                    required
                    value={formData.groomPhone}
                    onChange={handleChange}
                    maxLength={13}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="receiptPhone" className="mb-2 block text-sm font-medium">
                  현금 영수증 받으실 전화번호
                </label>
                <input
                  type="tel"
                  id="receiptPhone"
                  name="receiptPhone"
                  value={formData.receiptPhone}
                  onChange={handleChange}
                  maxLength={13}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="010-1234-5678"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="depositName" className="mb-2 block text-sm font-medium">
                    예약금 입금자명
                  </label>
                  <input
                    type="text"
                    id="depositName"
                    name="depositName"
                    value={formData.depositName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="productEmail" className="mb-2 block text-sm font-medium">
                    상품 받으실 E-mail
                  </label>
                  <input
                    type="email"
                    id="productEmail"
                    name="productEmail"
                    value={formData.productEmail}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                    placeholder="example@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="foundPath" className="mb-2 block text-sm font-medium">
                  라우브필름 알게된 경로
                </label>
                <input
                  type="text"
                  id="foundPath"
                  name="foundPath"
                  value={formData.foundPath}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예: 네이버 카페, 네이버 블로그, SNS 등"
                />
              </div>
            </div>
          )}

          {/* Section 2: 예식 정보 */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">2. 예식 정보</h2>
              </div>

              <div>
                <label htmlFor="productType" className="mb-2 block text-sm font-medium">
                  상품 종류
                </label>
                <select
                  id="productType"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">선택해주세요</option>
                  <option value="가성비형">가성비형</option>
                  <option value="기본형">기본형</option>
                  <option value="시네마틱형">시네마틱형</option>
                </select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="weddingDate" className="mb-2 block text-sm font-medium">
                    예식 날짜
                  </label>
                  <input
                    type="date"
                    id="weddingDate"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="weddingTime" className="mb-2 block text-sm font-medium">
                    예식 시간
                  </label>
                  <input
                    type="time"
                    id="weddingTime"
                    name="weddingTime"
                    value={formData.weddingTime}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="venueName" className="mb-2 block text-sm font-medium">
                    장소명
                  </label>
                  <input
                    type="text"
                    id="venueName"
                    name="venueName"
                    value={formData.venueName}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="venueFloor" className="mb-2 block text-sm font-medium">
                    층/홀이름
                  </label>
                  <input
                    type="text"
                    id="venueFloor"
                    name="venueFloor"
                    value={formData.venueFloor}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="guestCount" className="mb-2 block text-sm font-medium">
                  초대인원
                </label>
                <input
                  type="number"
                  id="guestCount"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예: 150"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="makeupShoot"
                    name="makeupShoot"
                    checked={formData.makeupShoot}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <label htmlFor="makeupShoot" className="text-sm">
                    메이크업샵 촬영 (20만원)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="paebaekShoot"
                    name="paebaekShoot"
                    checked={formData.paebaekShoot}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <label htmlFor="paebaekShoot" className="text-sm">
                    폐백 촬영 (5만원)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="receptionShoot"
                    name="receptionShoot"
                    checked={formData.receptionShoot}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <label htmlFor="receptionShoot" className="text-sm">
                    피로연(2부 예식) 촬영 (5만원)
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="usbOption"
                    name="usbOption"
                    checked={formData.usbOption}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <label htmlFor="usbOption" className="text-sm">
                    USB 추가 (개당 2만원)
                  </label>
                </div>
              </div>

              {formData.usbOption && (
                <div>
                  <label htmlFor="deliveryAddress" className="mb-2 block text-sm font-medium">
                    USB 배송 주소
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    rows={2}
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    placeholder="상세 주소까지 입력해주세요"
                  />
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="mainSnapCompany" className="mb-2 block text-sm font-medium">
                    메인스냅 촬영 업체명
                  </label>
                  <input
                    type="text"
                    id="mainSnapCompany"
                    name="mainSnapCompany"
                    value={formData.mainSnapCompany}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label htmlFor="makeupShop" className="mb-2 block text-sm font-medium">
                    메이크업샵 상호명
                  </label>
                  <input
                    type="text"
                    id="makeupShop"
                    name="makeupShop"
                    value={formData.makeupShop}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="playbackDevice" className="mb-2 block text-sm font-medium">
                  본식 영상 주 재생매체
                </label>
                <select
                  id="playbackDevice"
                  name="playbackDevice"
                  value={formData.playbackDevice}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">선택해주세요</option>
                  <option value="핸드폰">핸드폰</option>
                  <option value="LED TV">LED TV</option>
                  <option value="OLED TV">OLED TV</option>
                  <option value="빔프로젝터">빔프로젝터</option>
                </select>
              </div>
            </div>
          )}

          {/* Section 3: 할인 및 이벤트 */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">3. 할인 및 이벤트</h2>
              </div>

              <div className="rounded-lg border border-border bg-muted p-4">
                <h3 className="mb-3 text-sm font-medium">할인 이벤트</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="discountNewYear"
                      name="discountNewYear"
                      checked={formData.discountNewYear}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <label htmlFor="discountNewYear" className="text-sm">
                      2026년 신년할인 (5만원)
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="discountReview"
                      name="discountReview"
                      checked={formData.discountReview}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <label htmlFor="discountReview" className="text-sm">
                      블로그와 카페 촬영후기 (총 2만원 페이백)
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="discountCouple"
                      name="discountCouple"
                      checked={formData.discountCouple}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <label htmlFor="discountCouple" className="text-sm">
                      짝궁할인 (소개 받는 분 1만원, 소개 하는 분 무제한)
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="discountReviewBlog"
                      name="discountReviewBlog"
                      checked={formData.discountReviewBlog}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <label htmlFor="discountReviewBlog" className="text-sm">
                      블로그와 카페 예약후기 (총 2만원 +SNS영상 + 원본영상)
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="partnerCode" className="mb-2 block text-sm font-medium">
                  짝궁 코드
                </label>
                <input
                  type="text"
                  id="partnerCode"
                  name="partnerCode"
                  value={formData.partnerCode}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="짝궁 코드가 있으시면 입력해주세요"
                />
              </div>

              {/* 이벤트 촬영 */}
              <div>
                <label htmlFor="eventType" className="mb-2 block text-sm font-medium">
                  이벤트 촬영
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">미진행 (선택사항)</option>
                  <option value="야외스냅">야외스냅</option>
                  <option value="프리웨딩">프리웨딩</option>
                </select>
              </div>

              {(formData.eventType === "야외스냅" || formData.eventType === "프리웨딩") && (
                <>
                  <div>
                    <label htmlFor="shootLocation" className="mb-2 block text-sm font-medium">
                      희망 촬영 장소
                    </label>
                    <input
                      type="text"
                      id="shootLocation"
                      name="shootLocation"
                      value={formData.shootLocation}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder="예: 노을공원, 창경궁 등"
                    />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="shootDate" className="mb-2 block text-sm font-medium">
                        촬영 날짜
                      </label>
                      <input
                        type="date"
                        id="shootDate"
                        name="shootDate"
                        value={formData.shootDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label htmlFor="shootTime" className="mb-2 block text-sm font-medium">
                        촬영 시간
                      </label>
                      <input
                        type="time"
                        id="shootTime"
                        name="shootTime"
                        value={formData.shootTime}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="shootConcept" className="mb-2 block text-sm font-medium">
                      원하시는 컨셉
                    </label>
                    <textarea
                      id="shootConcept"
                      name="shootConcept"
                      rows={3}
                      value={formData.shootConcept}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Section 4: 특이사항 */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">4. 특이사항</h2>
              </div>

              <div>
                <label htmlFor="specialNotes" className="mb-2 block text-sm font-medium">
                  특이사항 및 요구사항
                </label>
                <textarea
                  id="specialNotes"
                  name="specialNotes"
                  rows={6}
                  value={formData.specialNotes}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  placeholder="특이사항이나 요구사항이 있으시면 작성해주세요"
                />
              </div>

              {/* 커스텀 촬영 요청 */}
              <div className="rounded-lg border border-border bg-muted p-4">
                <div className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    id="customShootingRequest"
                    name="customShootingRequest"
                    checked={formData.customShootingRequest}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <label htmlFor="customShootingRequest" className="text-sm font-medium">
                    커스텀 촬영 요청
                  </label>
                </div>

                {formData.customShootingRequest && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <label htmlFor="customSpecialRequest" className="mb-2 block text-sm font-medium">
                        특별 요청사항
                      </label>
                      <textarea
                        id="customSpecialRequest"
                        name="customSpecialRequest"
                        rows={4}
                        value={formData.customSpecialRequest}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                        placeholder="특별히 담고 싶은 순간이나 요청사항을 자유롭게 작성해주세요."
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border">
            {currentSection > 1 && (
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection - 1)}
                className="flex-1 rounded-lg border border-border py-3 text-center font-medium transition-colors hover:bg-muted"
              >
                이전
              </button>
            )}
            {currentSection < totalSections ? (
              <button
                type="button"
                onClick={() => setCurrentSection(currentSection + 1)}
                className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover"
              >
                다음
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "수정 중..." : "수정하기"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
