"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import DateInput from "@/components/ui/DateInput";
import TimeInput from "@/components/ui/TimeInput";
import { useMypageTranslation } from "@/components/mypage/MypageTranslationProvider";

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
  eventSnapApplications?: Array<{
    id: number;
    type: string;
    status: string;
    shootDate: string | null;
    shootTime: string | null;
    shootLocation: string | null;
  }>;
}

export default function MyReservationEditPage() {
  const params = useParams();
  const router = useRouter();
  const t = useMypageTranslation();

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
    playbackDevice: [] as string[],
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
  const [originalPartnerCode, setOriginalPartnerCode] = useState<string | null>(null);
  const [originalDiscountCouple, setOriginalDiscountCouple] = useState(false);
  const [partnerCodeSearch, setPartnerCodeSearch] = useState("");
  const [partnerCodeResults, setPartnerCodeResults] = useState<Array<{ code: string; author: string }>>([]);
  const [isSearchingPartnerCode, setIsSearchingPartnerCode] = useState(false);
  const [selectedPartnerCode, setSelectedPartnerCode] = useState("");
  const [eventSnapApplications, setEventSnapApplications] = useState<ReservationData["eventSnapApplications"]>([]);

  // 짝궁코드 검색 함수
  const searchPartnerCode = async (query: string) => {
    if (query.length < 2) {
      setPartnerCodeResults([]);
      return;
    }

    setIsSearchingPartnerCode(true);
    try {
      const res = await fetch(`/api/reservations/referral-code/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setPartnerCodeResults(data.results || []);
      } else {
        setPartnerCodeResults([]);
      }
    } catch (error) {
      console.error('짝궁코드 검색 오류:', error);
      setPartnerCodeResults([]);
    } finally {
      setIsSearchingPartnerCode(false);
    }
  };

  // 짝궁코드 선택 함수 (검색 결과에서 선택 시)
  const selectPartnerCode = (code: string) => {
    setSelectedPartnerCode(code);
    setFormData((prev) => ({ ...prev, partnerCode: code }));
    setPartnerCodeSearch(code);
    setPartnerCodeResults([]);
    setError("");
  };

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
        // 마이페이지 세션으로 예약 조회
        const res = await fetch(`/api/mypage/reservations/${params.id}`);
        if (!res.ok) {
          if (res.status === 401) {
            router.push('/mypage/login');
            return;
          }
          throw new Error(t.loadFailed || "예약 정보를 불러올 수 없습니다.");
        }
        const data: ReservationData = await res.json();
        setEventSnapApplications(data.eventSnapApplications ?? []);

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
          playbackDevice: parseArrayField(data.playbackDevice),
          eventType: (data.eventType as EventType) || "",
          shootLocation: data.shootLocation || "",
          shootDate: data.shootDate?.split("T")[0] || "",
          shootTime: data.shootTime || "",
          shootConcept: data.shootConcept || "",
          discountCouple: data.discountCouple || false,
          discountReview: data.discountReview || false,
          // 가성비형이면 신년할인과 예약후기 할인 제거, 기본형/시네마틱형이면 신년할인 자동 체크
          discountNewYear: data.productType === "가성비형" ? false : (data.productType === "기본형" || data.productType === "시네마틱형" ? true : (data.discountNewYear ?? true)),
          discountReviewBlog: data.productType === "가성비형" ? false : (data.discountReviewBlog || false),
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
        
        // 원본 값 저장 (수정 불가 여부 확인용)
        setOriginalPartnerCode(data.partnerCode);
        setOriginalDiscountCouple(data.discountCouple || false);
      } catch (err) {
        setError(err instanceof Error ? err.message : (t.errorOccurred || "오류가 발생했습니다."));
      } finally {
        setLoading(false);
      }
    }

    fetchReservation();
  }, [params.id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // 상품 타입 변경 시 가성비형이면 신년할인과 예약후기 할인 제거, 기본형/시네마틱형이면 신년할인 자동 체크
    if (name === "productType") {
      const newProductType = value as ProductType;
      setFormData((prev) => ({
        ...prev,
        [name]: newProductType,
        // 가성비형으로 변경 시 신년할인과 예약후기 할인 제거
        // 기본형/시네마틱형으로 변경 시 신년할인 자동 체크
        discountNewYear: newProductType === "가성비형" ? false : (newProductType === "기본형" || newProductType === "시네마틱형" ? true : prev.discountNewYear),
        discountReviewBlog: newProductType === "가성비형" ? false : prev.discountReviewBlog,
      }));
      return;
    }

    // 짝궁할인 체크박스 - 이미 입력된 경우 수정 불가
    if (name === "discountCouple" && type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      // 이미 입력된 경우 체크 해제 불가
      if (originalPartnerCode && !checked) {
        return;
      }
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        // 체크 해제 시 짝궁코드 초기화
        partnerCode: checked ? prev.partnerCode : "",
      }));
      if (!checked) {
        setPartnerCodeSearch("");
        setSelectedPartnerCode("");
        setPartnerCodeResults([]);
      }
      return;
    }

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
      // 마이페이지 세션으로 수정 (비밀번호 불필요)
      const res = await fetch(`/api/mypage/reservations/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // 배열 필드를 문자열로 변환
          playbackDevice: Array.isArray(formData.playbackDevice) ? formData.playbackDevice.join(", ") : formData.playbackDevice,
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
        throw new Error(data.error || (t.editFailed || "수정에 실패했습니다."));
      }

      router.push(`/mypage/reservations`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : (t.errorOccurred || "오류가 발생했습니다."));
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

  // 다음 버튼 클릭 시 검증
  const canProceed = async (section: number): Promise<boolean> => {
    if (section === 1) {
      // 섹션 1: 필수 항목 체크
      return !!(formData.brideName && formData.bridePhone && formData.groomName && formData.groomPhone);
    }
    if (section === 2) {
      // 섹션 2: 상품 종류 필수
      return !!formData.productType;
    }
    if (section === 3) {
      // 섹션 3: 짝궁할인 체크 시 짝궁코드 검증
      if (formData.discountCouple) {
        if (!formData.partnerCode) {
          setError(t.editPartnerCodeRequired || "짝궁코드를 검색하여 선택해주세요.");
          return false;
        }
        // 이미 입력된 경우는 통과
        if (originalPartnerCode) {
          return true;
        }
        // 검색 결과에서 선택한 경우는 통과
        if (selectedPartnerCode) {
          return true;
        }
        // 검색 결과에서 선택하지 않은 경우 DB 확인
        try {
          const res = await fetch(`/api/reservations/referral-code/search?q=${encodeURIComponent(formData.partnerCode)}`);
          if (res.ok) {
            const data = await res.json();
            const exists = data.results?.some((r: { code: string }) => r.code === formData.partnerCode);
            if (!exists) {
              setError(t.editPartnerCodeNotFound || "짝궁코드가 존재하지 않습니다.");
              return false;
            }
            // DB에 존재하는 경우 선택 처리
            setSelectedPartnerCode(formData.partnerCode);
            return true;
          } else {
            setError(t.editPartnerCodeRequired || "짝궁코드를 검색하여 선택해주세요.");
            return false;
          }
        } catch (err) {
          setError(t.editPartnerCodeVerifyError || "짝궁코드 검증 중 오류가 발생했습니다.");
          return false;
        }
      }
      return true;
    }
    if (section === 4) {
      // 섹션 4: 특이사항 (선택사항이므로 항상 통과)
      return true;
    }
    return true;
  };

  const handleNext = async () => {
    setError("");
    const canGoNext = await canProceed(currentSection);
    if (canGoNext) {
      setCurrentSection(currentSection + 1);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/mypage/reservations"
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
            {t.editBackToList || '예약글 목록으로'}
          </Link>
          <h1 className="text-3xl font-bold">{t.editReservationTitle || '예약 문의 수정'}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.editReservationSub || '예약 정보를 수정할 수 있습니다.'}
          </p>
          {(eventSnapApplications ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {eventSnapApplications!.map((ev) => (
                <span
                  key={ev.id}
                  className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium ${ev.status === "CONFIRMED" ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}
                >
                  {ev.type} {ev.status === "CONFIRMED" ? (t.confirmed || "확정") : (t.registered || "등록됨")}
                </span>
              ))}
            </div>
          )}
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
        <form onSubmit={(e) => {
          e.preventDefault();
          // 마지막 섹션이 아니면 제출 방지
          if (currentSection < totalSections) {
            return;
          }
          handleSubmit(e);
        }} className="space-y-8">
          {/* Section 1: 기본 정보 */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">{t.editSection1 || '1. 예약자 정보'}</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="brideName" className="mb-2 block text-sm font-medium">
                    {t.brideName || '신부님 성함'} <span className="text-accent">*</span>
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
                    {t.bridePhone || '신부님 전화번호'} <span className="text-accent">*</span>
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
                    {t.groomName || '신랑님 성함'} <span className="text-accent">*</span>
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
                    {t.groomPhone || '신랑님 전화번호'} <span className="text-accent">*</span>
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
                  {t.receiptPhone || '현금 영수증 받으실 전화번호'}
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
                    {t.depositNameLabel || '예약금 입금자명'}
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
                    {t.productEmailLabel || '상품 받으실 E-mail'}
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
                  {t.foundPathLabel || '라우브필름 알게된 경로'}
                </label>
                <input
                  type="text"
                  id="foundPath"
                  name="foundPath"
                  value={formData.foundPath}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder={t.foundPathPlaceholder || "예: 네이버 카페, 네이버 블로그, SNS 등"}
                />
              </div>
            </div>
          )}

          {/* Section 2: 예식 정보 */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">{t.editSection2 || '2. 예식 정보'}</h2>
              </div>

              <div>
                <label htmlFor="productType" className="mb-2 block text-sm font-medium">
                  {t.productTypeLabel || '상품 종류'}
                </label>
                <select
                  id="productType"
                  name="productType"
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">{t.editSelectPlease || '선택해주세요'}</option>
                  <option value="가성비형">{t.editBudget || '가성비형'}</option>
                  <option value="기본형">{t.editBasic || '기본형'}</option>
                  <option value="시네마틱형">{t.editCinematic || '시네마틱형'}</option>
                </select>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="weddingDate" className="mb-2 block text-sm font-medium">
                    {t.weddingDateLabel || '예식 날짜'}
                  </label>
                  <DateInput
                    id="weddingDate"
                    name="weddingDate"
                    value={formData.weddingDate}
                    onChange={handleChange}
                    className="rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  />
                </div>
                <div>
                  <label htmlFor="weddingTime" className="mb-2 block text-sm font-medium">
                    {t.weddingTimeLabel || '예식 시간'}
                  </label>
                  <TimeInput
                    id="weddingTime"
                    name="weddingTime"
                    value={formData.weddingTime}
                    onChange={handleChange}
                    className="rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="venueName" className="mb-2 block text-sm font-medium">
                    {t.venueNameLabel || '장소명'}
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
                    {t.venueFloorLabel || '층/홀이름'}
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
                  {t.guestCountLabel || '초대인원'}
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
                    {t.editMakeupShoot || '메이크업샵 촬영 (20만원)'}
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
                    {t.editPaebaekShoot || '폐백 촬영 (5만원)'}
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
                    {t.editReceptionShoot || '피로연(2부 예식) 촬영 (5만원)'}
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
                    {t.editUsbOption || 'USB 추가 (개당 2만원)'}
                  </label>
                </div>
              </div>

              {formData.usbOption && (
                <div>
                  <label htmlFor="deliveryAddress" className="mb-2 block text-sm font-medium">
                    {t.editDeliveryAddress || 'USB 배송 주소'}
                  </label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    rows={2}
                    value={formData.deliveryAddress}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                    placeholder={t.editDeliveryAddressPlaceholder || "상세 주소까지 입력해주세요"}
                  />
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="mainSnapCompany" className="mb-2 block text-sm font-medium">
                    {t.mainSnapCompanyLabel || '메인스냅 촬영 업체명'}
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
                    {t.makeupShopLabel || '메이크업샵 상호명'}
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
                <label className="mb-2 block text-sm font-medium">
                  {t.playbackDeviceLabel || '본식 영상 주 재생매체'}
                </label>
                <div className="space-y-3">
                  {["핸드폰", "LED TV", "OLED TV", "빔프로젝터"].map((device) => (
                    <div key={device} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={`playbackDevice-${device}`}
                        checked={formData.playbackDevice.includes(device)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              playbackDevice: [...prev.playbackDevice, device],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              playbackDevice: prev.playbackDevice.filter((d) => d !== device),
                            }));
                          }
                        }}
                        className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                      />
                      <label htmlFor={`playbackDevice-${device}`} className="text-sm cursor-pointer">
                        {device}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 3: 할인 및 이벤트 */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">{t.editSection3 || '3. 할인 및 이벤트'}</h2>
              </div>

              <div className="rounded-lg border border-border bg-muted p-4">
                <h3 className="mb-3 text-sm font-medium">{t.editDiscountEvents || '할인 이벤트'}</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="discountNewYear"
                      name="discountNewYear"
                      checked={formData.discountNewYear}
                      onChange={handleChange}
                      disabled={formData.productType === "가성비형"}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <label htmlFor="discountNewYear" className={`text-sm ${formData.productType === "가성비형" ? "text-muted-foreground" : ""}`}>
                      {t.editDiscountNewYear || '2026년 신년할인 (5만원)'}
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
                      {t.editDiscountReview || '블로그와 카페 촬영후기 (총 2만원 페이백)'}
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
                      {t.editDiscountCouple || '짝궁할인 (소개 받는 분 1만원, 소개 하는 분 무제한)'}
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
                      {formData.productType === "가성비형"
                        ? (t.editDiscountReviewBlogBudget || "블로그와 카페 예약후기 (할인없이 원본전체 전달)")
                        : (t.editDiscountReviewBlog || "블로그와 카페 예약후기 (총 2만원 +SNS영상 + 원본영상)")}
                    </label>
                  </div>
                </div>
              </div>

              {/* 짝궁코드 입력 */}
              {formData.discountCouple && (
                <div>
                  <label htmlFor="partnerCode" className="mb-2 block text-sm font-medium">
                    {t.partnerCode || '짝궁 코드'} {!originalPartnerCode && <span className="text-accent">*</span>}
                  </label>
                  {originalPartnerCode ? (
                    // 이미 입력된 경우 - 읽기 전용
                    <>
                      <input
                        type="text"
                        id="partnerCode"
                        name="partnerCode"
                        value={formData.partnerCode}
                        disabled
                        readOnly
                        className="w-full rounded-lg border border-border bg-muted px-4 py-3 text-muted-foreground cursor-not-allowed"
                        placeholder={t.editPartnerCodeReadonly || "짝궁 코드는 수정할 수 없습니다"}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.editPartnerCodeReadonly || '짝궁 코드는 수정할 수 없습니다.'}
                      </p>
                    </>
                  ) : (
                    // 새로 입력하는 경우 - 검색 기능 제공
                    <div className="relative">
                      <input
                        type="text"
                        id="partnerCode"
                        name="partnerCode"
                        value={formData.partnerCode || partnerCodeSearch}
                        onChange={(e) => {
                          const value = e.target.value;
                          setPartnerCodeSearch(value);
                          setFormData((prev) => ({ ...prev, partnerCode: value }));
                          setSelectedPartnerCode(""); // 직접 입력 시 선택 해제
                          if (value.length >= 2) {
                            searchPartnerCode(value);
                          } else {
                            setPartnerCodeResults([]);
                          }
                        }}
                        onKeyDown={(e) => {
                          // Enter 키로 직접 입력 방지
                          if (e.key === 'Enter') {
                            e.preventDefault();
                          }
                        }}
                        onBlur={() => {
                          // 검색 결과만 닫기
                          setTimeout(() => {
                            setPartnerCodeResults([]);
                          }, 200);
                        }}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        placeholder={t.editPartnerCodeSearchPlaceholder || "짝궁 코드를 검색하여 선택해주세요"}
                        required
                      />
                      {isSearchingPartnerCode && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-accent" />
                        </div>
                      )}
                      {partnerCodeResults.length > 0 && (
                        <div className="absolute z-10 mt-1 w-full rounded-lg border border-border bg-background shadow-lg">
                          {partnerCodeResults.map((result) => (
                            <button
                              key={result.code}
                              type="button"
                              onClick={() => selectPartnerCode(result.code)}
                              className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${
                                selectedPartnerCode === result.code ? "bg-muted" : ""
                              }`}
                            >
                              <div className="font-medium">{result.code}</div>
                              <div className="text-xs text-muted-foreground">{t.editReferrer || '추천인'}: {result.author}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {formData.discountCouple && !formData.partnerCode && (
                        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">{t.editPartnerCodeWarning || '짝궁코드를 검색하여 선택해주세요.'}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 이벤트 촬영 */}
              <div>
                <label htmlFor="eventType" className="mb-2 block text-sm font-medium">
                  {t.editEventShoot || '이벤트 촬영'}
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">{t.editEventNone || '미진행 (선택사항)'}</option>
                  <option value="야외스냅">{t.eventSnapOutdoor || '야외스냅'}</option>
                  <option value="프리웨딩">{t.eventSnapPrewedding || '프리웨딩'}</option>
                </select>
              </div>

              {(formData.eventType === "야외스냅" || formData.eventType === "프리웨딩") && (
                <>
                  <div>
                    <label htmlFor="shootLocation" className="mb-2 block text-sm font-medium">
                      {t.eventSnapShootLocation || '희망 촬영 장소'}
                    </label>
                    <input
                      type="text"
                      id="shootLocation"
                      name="shootLocation"
                      value={formData.shootLocation}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder={t.editShootLocationPlaceholder || "예: 노을공원, 창경궁 등"}
                    />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="shootDate" className="mb-2 block text-sm font-medium">
                        {t.editShootDate || '촬영 날짜'}
                      </label>
                      <DateInput
                        id="shootDate"
                        name="shootDate"
                        value={formData.shootDate}
                        onChange={handleChange}
                        className="rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                      />
                    </div>
                    <div>
                      <label htmlFor="shootTime" className="mb-2 block text-sm font-medium">
                        {t.editShootTime || '촬영 시간'}
                      </label>
                      <TimeInput
                        id="shootTime"
                        name="shootTime"
                        value={formData.shootTime}
                        onChange={handleChange}
                        className="rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="shootConcept" className="mb-2 block text-sm font-medium">
                      {t.eventSnapConcept || '원하시는 컨셉'}
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
                <h2 className="text-xl font-semibold">{t.editSection4 || '4. 특이사항'}</h2>
              </div>

              <div>
                <label htmlFor="specialNotes" className="mb-2 block text-sm font-medium">
                  {t.editSpecialNotes || '특이사항 및 요구사항'}
                </label>
                <textarea
                  id="specialNotes"
                  name="specialNotes"
                  rows={6}
                  value={formData.specialNotes}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  placeholder={t.editSpecialNotesPlaceholder || "특이사항이나 요구사항이 있으시면 작성해주세요"}
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
                    {t.editCustomShootingRequest || '커스텀 촬영 요청 (대표 또는 수석실장 촬영만 해당)'}
                  </label>
                </div>

                {formData.customShootingRequest && (
                  <div className="space-y-6 mt-4 pt-4 border-t border-border">
                    {/* 안내 문구 */}
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t.editCustomNote1 || '계약을 완료한 후 카카오톡 채널을 통해 커스텀 신청 부탁드립니다.'}
                        <br />
                        {t.editCustomNote2 || '여건에 따라 불가한 옵션이 있을 수 있습니다.'}
                        <br />
                        {t.editCustomNote3 || '카카오톡 채널로 말씀없이 작성하시면 적용되지 않습니다!!'}
                      </p>
                    </div>

                    {/* 영상 스타일 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        {t.editVideoStyle || '영상 스타일'} <span className="text-accent">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["시네마틱", "다큐멘터리"].map((style) => (
                          <div key={style} className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`customStyle-${style}`}
                              name="customStyle"
                              value={style}
                              checked={formData.customStyle.includes(style)}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customStyle: [style],
                                }));
                              }}
                              className="h-4 w-4 border-border bg-background text-accent focus:ring-accent"
                            />
                            <label htmlFor={`customStyle-${style}`} className="text-sm cursor-pointer">
                              {style}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 편집 스타일 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        {t.editEditStyle || '편집 스타일'} <span className="text-accent">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "빠른 컷 편집", label: "빠른 템포의 컷 편집" },
                          { value: "부드러운 전환", label: "느린 템포의 컷 편집" },
                          { value: "영화 같은 편집", label: "영화 같은 편집" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`customEditStyle-${option.value}`}
                              name="customEditStyle"
                              value={option.value}
                              checked={formData.customEditStyle.includes(option.value)}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customEditStyle: [option.value],
                                }));
                              }}
                              className="h-4 w-4 border-border bg-background text-accent focus:ring-accent"
                            />
                            <label htmlFor={`customEditStyle-${option.value}`} className="text-sm cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 음악 장르 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        {t.editMusicGenre || '음악 장르'} <span className="text-accent">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {["클래식", "팝", "발라드", "재즈", "인디", "K-pop", "영화 OST", "직접 선곡"].map((music) => (
                          <div key={music} className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`customMusic-${music}`}
                              name="customMusic"
                              value={music}
                              checked={formData.customMusic.includes(music)}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customMusic: [music],
                                }));
                              }}
                              className="h-4 w-4 border-border bg-background text-accent focus:ring-accent"
                            />
                            <label htmlFor={`customMusic-${music}`} className="text-sm cursor-pointer">
                              {music}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 영상 진행형식 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        {t.editVideoFormat || '영상 진행형식'} <span className="text-accent">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "하이라이트 (3-5분)", label: "뮤직비디오 (2-3분)" },
                          { value: "예능형 (10-15분)", label: "예능형 (10-15분)(추가비용 발생)" },
                          { value: "다큐멘터리(20-30분)", label: "다큐멘터리(15-30분)" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`customLength-${option.value}`}
                              name="customLength"
                              value={option.value}
                              checked={formData.customLength.includes(option.value)}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customLength: [option.value],
                                }));
                              }}
                              className="h-4 w-4 border-border bg-background text-accent focus:ring-accent"
                            />
                            <label htmlFor={`customLength-${option.value}`} className="text-sm cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 추가효과 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">{t.editExtraEffects || '추가효과'}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "타임랩스", label: "적절한 슬로우 모션" },
                          { value: "자막/나레이션", label: "자막/나레이션(다큐멘터리 추천)" },
                          { value: "인터뷰 삽입", label: "인터뷰 삽입" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`customEffect-${option.value}`}
                              name="customEffect"
                              value={option.value}
                              checked={formData.customEffect.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    customEffect: [...prev.customEffect, option.value],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    customEffect: prev.customEffect.filter((e) => e !== option.value),
                                  }));
                                }
                              }}
                              className="h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent"
                            />
                            <label htmlFor={`customEffect-${option.value}`} className="text-sm cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 추가 옵션 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">{t.editExtraOptions || '추가 옵션 (추가비용 발생)'}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "드론 촬영", label: "드론 촬영 (촬영 여건에 따라 불가할 수 있습니다.)" },
                          { value: "수석 촬영자 추가", label: "수석 촬영자 추가(25만원)" },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`customContent-${option.value}`}
                              name="customContent"
                              value={option.value}
                              checked={formData.customContent.includes(option.value)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData((prev) => ({
                                    ...prev,
                                    customContent: [...prev.customContent, option.value],
                                  }));
                                } else {
                                  setFormData((prev) => ({
                                    ...prev,
                                    customContent: prev.customContent.filter((c) => c !== option.value),
                                  }));
                                }
                              }}
                              className="h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent"
                            />
                            <label htmlFor={`customContent-${option.value}`} className="text-sm cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 특별 요청사항 */}
                    <div>
                      <label htmlFor="customSpecialRequest" className="mb-2 block text-sm font-medium">
                        {t.editCustomSpecialRequest || '특별 요청사항'}
                      </label>
                      <textarea
                        id="customSpecialRequest"
                        name="customSpecialRequest"
                        rows={4}
                        value={formData.customSpecialRequest}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                        placeholder={t.editCustomSpecialRequestPlaceholder || "특별히 담고 싶은 순간이나 요청사항을 자유롭게 작성해주세요."}
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
                {t.editPrevious || '이전'}
              </button>
            )}
            {currentSection < totalSections ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover"
              >
                {t.editNext || '다음'}
              </button>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (t.editSubmitting || "수정 중...") : (t.edit || "수정하기")}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
