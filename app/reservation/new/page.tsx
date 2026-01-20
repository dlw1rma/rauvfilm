"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProductType = "가성비형" | "기본형" | "시네마틱형" | "야외스냅" | "프리웨딩" | "";
type EventType = "야외스냅" | "프리웨딩" | "";

export default function NewReservationPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState({
    // 기본 정보
    title: "본식DVD 예약합니다",
    password: "",
    isPrivate: true, // 비밀글만 가능
    isBrideContractor: false, // 신부님이 계약자인지
    isGroomContractor: false, // 신랑님이 계약자인지
    
    // 개인정보 활용 동의 (1번째로 이동)
    privacyAgreed: false,
    
    // 필수 작성항목(공통)
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
    termsAgreed: false,
    faqRead: false,
    
    // 본식 영상 예약 고객님 필수 추가 작성 항목
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
    usbOption: false, // USB 추가 옵션
    seonwonpan: false,
    gimbalShoot: false,
    playbackDevice: "",
    
    // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
    eventType: "" as EventType,
    shootLocation: "",
    shootDate: "",
    shootTime: "",
    shootConcept: "",
    
    // 할인사항 (체크박스)
    discountNewYear: true, // 신년할인 (항상 체크)
    discountReview: false, // 블로그와 카페 촬영후기 (총 2만원 페이백)
    discountCouple: false, // 짝궁할인
    discountReviewBlog: false, // 블로그와 카페 예약후기 (총 2만원 +SNS영상 + 원본영상)
    
    // 특이사항
    specialNotes: "",
    
    // 커스텀 촬영 요청
    customShootingRequest: false,
    customStyle: [] as string[],
    customEditStyle: [] as string[],
    customMusic: [] as string[],
    customLength: [] as string[],
    customEffect: [] as string[],
    customContent: [] as string[],
    customSpecialRequest: "",
  });
  
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

  // 전화번호에서 하이픈 제거
  const removeHyphens = (value: string): string => {
    return value.replace(/-/g, "");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    // 전화번호 필드는 하이픈 자동 추가
    if ((name === "bridePhone" || name === "groomPhone" || name === "receiptPhone") && type !== "checkbox") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => {
        const updated = {
          ...prev,
          [name]: formatted,
        };
        
        // 계약자 전화번호가 변경되면 비밀번호 자동 업데이트
        if (name === "bridePhone" && prev.isBrideContractor) {
          updated.password = removeHyphens(formatted);
        } else if (name === "groomPhone" && prev.isGroomContractor) {
          updated.password = removeHyphens(formatted);
        }
        
        return updated;
      });
      return;
    }
    
    // 계약자 체크박스 처리
    if (name === "isBrideContractor") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        isBrideContractor: isChecked,
        isGroomContractor: isChecked ? false : prev.isGroomContractor,
        password: isChecked ? removeHyphens(prev.bridePhone) : (prev.isGroomContractor ? removeHyphens(prev.groomPhone) : ""),
      }));
      return;
    }
    
    if (name === "isGroomContractor") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        isGroomContractor: isChecked,
        isBrideContractor: isChecked ? false : prev.isBrideContractor,
        password: isChecked ? removeHyphens(prev.groomPhone) : (prev.isBrideContractor ? removeHyphens(prev.bridePhone) : ""),
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

  // 미작성 필드로 스크롤 이동
  const scrollToFirstError = (fieldId: string) => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.focus();
    }
  };

  // 다음 섹션으로 이동하는 함수 (제출 로직 없음)
  const handleNext = () => {
    // 마지막 섹션이면 다음으로 이동하지 않음
    if (currentSection >= totalSections) {
      return;
    }

    if (canProceed(currentSection)) {
      setCurrentSection(currentSection + 1);
      setError("");
    } else {
      // 현재 섹션의 첫 번째 미작성 필드로 스크롤
      let firstErrorId = "";
      if (currentSection === 1) {
        if (!formData.privacyAgreed) firstErrorId = "privacyAgreed";
      } else if (currentSection === 2) {
        if (!formData.brideName) firstErrorId = "brideName";
        else if (!formData.bridePhone) firstErrorId = "bridePhone";
        else if (!formData.groomName) firstErrorId = "groomName";
        else if (!formData.groomPhone) firstErrorId = "groomPhone";
        else if (!formData.isBrideContractor && !formData.isGroomContractor) firstErrorId = "isBrideContractor";
        else if (!formData.receiptPhone) firstErrorId = "receiptPhone";
        else if (!formData.depositName) firstErrorId = "depositName";
        else if (!formData.productEmail) firstErrorId = "productEmail";
        else if (!formData.productType) firstErrorId = "productType";
        else if (!formData.foundPath) firstErrorId = "foundPath";
        else if (!formData.termsAgreed) firstErrorId = "termsAgreed";
        else if (!formData.faqRead) firstErrorId = "faqRead";
      } else if (currentSection === 3) {
        if (formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") {
          if (!formData.weddingDate) firstErrorId = "weddingDate";
          else if (!formData.weddingTime) firstErrorId = "weddingTime";
          else if (!formData.venueName) firstErrorId = "venueName";
          else if (formData.usbOption && !formData.deliveryAddress) firstErrorId = "deliveryAddress";
        }
      }
      
      if (firstErrorId) {
        setError("필수 항목을 모두 입력해주세요.");
        setTimeout(() => scrollToFirstError(firstErrorId), 100);
      } else {
        setError("필수 항목을 모두 입력해주세요.");
      }
    }
  };

  // 폼 제출 함수 (마지막 섹션에서만 실행)
  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    // 이벤트가 있으면 기본 동작 방지
    if (e) {
    e.preventDefault();
      e.stopPropagation();
    }
    
    // 안전 장치: 현재 섹션이 마지막 섹션이 아니면 제출하지 않음
    if (currentSection !== totalSections) {
      return;
    }
    
    // 이미 제출 중이면 중복 제출 방지
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    // 필수 항목 검증 및 스크롤 이동
    if (!formData.privacyAgreed) {
      setError("개인정보 활용 동의는 필수입니다.");
      setCurrentSection(1);
      setTimeout(() => scrollToFirstError("privacyAgreed"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.brideName) {
      setError("신부님 성함을 입력해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("brideName"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.bridePhone) {
      setError("신부님 전화번호를 입력해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("bridePhone"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.groomName) {
      setError("신랑님 성함을 입력해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("groomName"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.groomPhone) {
      setError("신랑님 전화번호를 입력해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("groomPhone"), 100);
      setIsSubmitting(false);
      return;
    }

    // 계약자 확인
    if (!formData.isBrideContractor && !formData.isGroomContractor) {
      setError("계약자를 선택해주세요. (신부님 또는 신랑님 중 한 명)");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("isBrideContractor"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.receiptPhone) {
      setError("현금 영수증 받으실 전화번호를 입력해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("receiptPhone"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.depositName) {
      setError("예약금 입금자명을 입력해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("depositName"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.productEmail) {
      setError("상품 받으실 E-mail 주소를 입력해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("productEmail"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.productType) {
      setError("상품 종류를 선택해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("productType"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.foundPath) {
      setError("라우브필름 알게된 경로를 입력해주세요.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("foundPath"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.termsAgreed) {
      setError("홈페이지 규정 안내 및 약관동의서 읽음 및 동의는 필수입니다.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("termsAgreed"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.faqRead) {
      setError("홈페이지 FAQ 읽음 및 숙지 여부는 필수입니다.");
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("faqRead"), 100);
      setIsSubmitting(false);
      return;
    }

    // 본식 영상 예약 필수 항목 검증
    if (formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") {
      if (!formData.weddingDate) {
        setError("예식 날짜를 선택해주세요.");
        setCurrentSection(3);
        setTimeout(() => scrollToFirstError("weddingDate"), 100);
        setIsSubmitting(false);
        return;
      }

      if (!formData.weddingTime) {
        setError("예식 시간을 선택해주세요.");
        setCurrentSection(3);
        setTimeout(() => scrollToFirstError("weddingTime"), 100);
        setIsSubmitting(false);
        return;
      }

      if (!formData.venueName) {
        setError("장소명을 입력해주세요.");
        setCurrentSection(3);
        setTimeout(() => scrollToFirstError("venueName"), 100);
        setIsSubmitting(false);
        return;
      }

      if (formData.usbOption && !formData.deliveryAddress) {
        setError("USB 추가 옵션 선택 시 거주지 주소를 입력해주세요.");
        setCurrentSection(3);
        setTimeout(() => scrollToFirstError("deliveryAddress"), 100);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // 계약자 이름 설정
      const contractorName = formData.isBrideContractor ? formData.brideName : formData.groomName;
      
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          author: contractorName, // 계약자 이름으로 설정
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
        throw new Error(data.error || "등록에 실패했습니다.");
      }

      router.push("/reservation");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSections = 6;
  const canProceed = (section: number) => {
    if (section === 1) {
      // 1번 탭은 개인정보 활용 동의만 체크
      return formData.privacyAgreed;
    }
    if (section === 2) {
      const hasNames = formData.brideName && formData.groomName;
      const hasPhones = formData.bridePhone && formData.groomPhone;
      const hasContractor = formData.isBrideContractor || formData.isGroomContractor;
      return hasNames && hasPhones && hasContractor;
    }
    return true;
  };

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/reservation"
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
            목록으로
          </Link>
          <h1 className="text-3xl font-bold">예약글 작성</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            예약 정보를 정확히 입력해주세요. 예약 후 변경사항은 카카오톡 채널로 문의해주세요.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3, 4, 5, 6].map((section) => (
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
        <form 
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {/* Section 1: 개인정보 활용 동의 (1번째로 이동) */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">1. 개인정보 활용 동의 (필수)</h2>
              </div>

              <div className="rounded-lg border border-border bg-muted p-6 space-y-4">
                <p className="text-sm leading-relaxed">
                  본인은 귀사의 식별, 예약 및 행사 고객 관리 위해 귀사가 본인의 개인 정보를 수집이용하고자 하는 경우
                  개인정보보호법 제15조, 제22조에 따라 동의를 얻어야 합니다.
                  이에 본식 촬영 계약을 위하여 아래와 같이 개인정보를 수집 이용 및 제공하고자 합니다.
                  내용을 자세히 읽으신 후 동의 여부를 결정하여 주십시오.
                </p>

                <div className="space-y-2">
                  <h3 className="font-semibold">개인정보 수집 이용 내역</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>항목: 이름, 휴대폰번호, 이메일, 예약자 성함, 예식자이름(신랑,신부), 자택주소</li>
                    <li>수집 및 이용 목적: 식별, 예약 및 행사 고객 관리, 실물 상품 발송</li>
                    <li>보유기간: 계약일로 부터 5년</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <p className="text-sm text-accent font-medium">
                    위의 개인정보 수집 이용에 대한 동의를 거부할 권리가 있습니다.
                    그러나, 동의를 거부할 경우 본식 촬영 계약이 진행되지 않음을 알려드립니다.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="privacyAgreed"
                    name="privacyAgreed"
                    required
                    checked={formData.privacyAgreed}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <label htmlFor="privacyAgreed" className="text-sm font-medium">
                    위와 같이 개인정보를 수집·이용하는데 동의하십니까? <span className="text-accent">*</span>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* Section 2: 필수 작성항목(공통) */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">2. 필수 작성항목(공통)</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
          <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="brideName" className="block text-sm font-medium">
                      신부님 성함 <span className="text-accent">*</span>
            </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isBrideContractor"
                        name="isBrideContractor"
                        checked={formData.isBrideContractor}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent"
                      />
                      <label htmlFor="isBrideContractor" className="text-xs text-muted-foreground">
                        계약자
                      </label>
                    </div>
                  </div>
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
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="groomName" className="block text-sm font-medium">
                      신랑님 성함 <span className="text-accent">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isGroomContractor"
                        name="isGroomContractor"
                        checked={formData.isGroomContractor}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-border bg-background text-accent focus:ring-accent"
                      />
                      <label htmlFor="isGroomContractor" className="text-xs text-muted-foreground">
                        계약자
                      </label>
                    </div>
                  </div>
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
                  현금 영수증 받으실 전화번호 <span className="text-accent">*</span>
              </label>
              <input
                type="tel"
                  id="receiptPhone"
                  name="receiptPhone"
                  required
                  value={formData.receiptPhone}
                onChange={handleChange}
                  maxLength={13}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
                <label htmlFor="depositName" className="mb-2 block text-sm font-medium">
                  예약금 입금자명 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="depositName"
                  name="depositName"
                  required
                  value={formData.depositName}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label htmlFor="productEmail" className="mb-2 block text-sm font-medium">
                  상품 받으실 E-mail 주소 <span className="text-accent">*</span>
              </label>
              <input
                type="email"
                  id="productEmail"
                  name="productEmail"
                  required
                  value={formData.productEmail}
                onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="example@email.com"
              />
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

              <div>
                <label htmlFor="foundPath" className="mb-2 block text-sm font-medium">
                  라우브필름 알게된 경로 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="foundPath"
                  name="foundPath"
                  required
                  value={formData.foundPath}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예: 네이버 카페, 네이버 블로그, SNS 등"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="termsAgreed"
                    name="termsAgreed"
                    required
                    checked={formData.termsAgreed}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <label htmlFor="termsAgreed" className="text-sm">
                    홈페이지 규정 안내 및 약관동의서 읽음 및 동의 <span className="text-accent">*</span>
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="faqRead"
                    name="faqRead"
                    required
                    checked={formData.faqRead}
                    onChange={handleChange}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <label htmlFor="faqRead" className="text-sm">
                    홈페이지 FAQ 읽음 및 숙지 여부 <span className="text-accent">*</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: 본식 영상 예약 고객님 필수 추가 작성 항목 */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">3. 본식 영상 예약 고객님 필수 추가 작성 항목</h2>
              </div>

              <div>
                <label htmlFor="productType" className="mb-2 block text-sm font-medium">
                  상품 종류 <span className="text-accent">*</span>
                </label>
                <select
                  id="productType"
                  name="productType"
                  required
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

              {(formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") && (
                <>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="weddingDate" className="mb-2 block text-sm font-medium">
                        예식 날짜 <span className="text-accent">*</span>
              </label>
              <input
                type="date"
                id="weddingDate"
                name="weddingDate"
                        required
                value={formData.weddingDate}
                onChange={handleChange}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          // 입력 필드 클릭 시 달력 열기
                          if (e.currentTarget.showPicker) {
                            e.currentTarget.showPicker();
                          }
                        }}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-foreground cursor-pointer"
                        style={{ colorScheme: 'light' }}
              />
            </div>
            <div>
                      <label htmlFor="weddingTime" className="mb-2 block text-sm font-medium">
                        예식 시간 <span className="text-accent">*</span>
                      </label>
                      <input
                        type="time"
                        id="weddingTime"
                        name="weddingTime"
                        required
                        value={formData.weddingTime}
                        onChange={handleChange}
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          // 입력 필드 클릭 시 시간 선택기 열기
                          if (e.currentTarget.showPicker) {
                            e.currentTarget.showPicker();
                          }
                        }}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-foreground cursor-pointer"
                        style={{ colorScheme: 'light' }}
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="venueName" className="mb-2 block text-sm font-medium">
                        장소명 <span className="text-accent">*</span>
              </label>
              <input
                type="text"
                        id="venueName"
                        name="venueName"
                        required
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
                        id="seonwonpan"
                        name="seonwonpan"
                        checked={formData.seonwonpan}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                      />
                      <label htmlFor="seonwonpan" className="text-sm">
                        선원판 진행 여부
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="gimbalShoot"
                        name="gimbalShoot"
                        checked={formData.gimbalShoot}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                      />
                      <label htmlFor="gimbalShoot" className="text-sm">
                        짐벌(커스텀) 촬영 (희망 시 카카오채널로 말씀 부탁드립니다)
                      </label>
                    </div>
                  </div>

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

                  <div className="grid gap-6 sm:grid-cols-2">
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
                    <div>
                      <label htmlFor="dressShop" className="mb-2 block text-sm font-medium">
                        드레스샵 상호명
                      </label>
                      <input
                        type="text"
                        id="dressShop"
                        name="dressShop"
                        value={formData.dressShop}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="usbOption"
                        name="usbOption"
                        checked={formData.usbOption}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                      />
                      <label htmlFor="usbOption" className="text-sm font-medium">
                        USB 추가 (개당 2만원)
                      </label>
                    </div>
                    {formData.usbOption && (
                      <div>
                        <label htmlFor="deliveryAddress" className="mb-2 block text-sm font-medium">
                          (USB)상품받으실 거주지 주소 <span className="text-accent">*</span>
            </label>
            <textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          required={formData.usbOption}
                          rows={3}
                          value={formData.deliveryAddress}
              onChange={handleChange}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                          placeholder="USB 추가 옵션 선택 시 상세 주소까지 입력해주세요"
            />
                      </div>
                    )}
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
                </>
              )}
            </div>
          )}

          {/* Section 4: 할인사항 */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">4. 할인사항</h2>
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
            </div>
          )}

          {/* Section 5: 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목 */}
          {currentSection === 5 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">5. 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목</h2>
              </div>

              <div>
                <label htmlFor="eventType" className="mb-2 block text-sm font-medium">
                  이벤트 촬영
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={(e) => {
                    const newValue = e.target.value as EventType;
                    setFormData((prev) => ({
                      ...prev,
                      eventType: newValue,
                      // 이벤트 촬영을 선택 해제하면 관련 필드도 초기화
                      ...(newValue === "" && {
                        shootLocation: "",
                        shootDate: "",
                        shootTime: "",
                        shootConcept: "",
                      }),
                    }));
                  }}
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
                      placeholder="예: 노을공원, 창경궁, 동작대교, 잠수교, 올림픽공원, 서울숲 등"
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
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          // 입력 필드 클릭 시 달력 열기
                          if (e.currentTarget.showPicker) {
                            e.currentTarget.showPicker();
                          }
                        }}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-foreground cursor-pointer"
                        style={{ colorScheme: 'light' }}
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
                        onKeyDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                          // 입력 필드 클릭 시 시간 선택기 열기
                          if (e.currentTarget.showPicker) {
                            e.currentTarget.showPicker();
                          }
                        }}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-foreground cursor-pointer"
                        style={{ colorScheme: 'light' }}
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
                      rows={4}
                      value={formData.shootConcept}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                      placeholder="원하시는 촬영 컨셉을 자세히 작성해주세요"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Section 6: 특이사항 */}
          {currentSection === 6 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">6. 특이사항</h2>
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
                  onKeyDown={(e) => {
                    // Enter 키로 인한 자동 제출 방지
                    if (e.key === "Enter" && e.ctrlKey) {
                      // Ctrl+Enter는 허용 (줄바꿈)
                      return;
                    }
                    if (e.key === "Enter" && !e.shiftKey) {
                      // Shift+Enter가 아닌 Enter는 기본 동작 방지
                      e.preventDefault();
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  placeholder="특이사항이나 요구사항이 있으시면 작성해주세요"
                />
              </div>

              {/* 커스텀 촬영 요청 */}
              <div className="mt-6 rounded-lg border border-border bg-muted p-4">
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
                    🎬 커스텀 촬영 요청 (대표지정 or 대표배정 촬영만 해당)
                  </label>
                </div>

                {formData.customShootingRequest && (
                  <div className="space-y-6 mt-4 pt-4 border-t border-border">
                    {/* 안내 문구 */}
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        ✅ 계약을 완료한 후 카카오톡 채널을 통해 커스텀 신청 부탁드립니다.
                        <br />
                        ✅ 여건에 따라 불가한 옵션이 있을 수 있습니다.
                        <br />
                        🚨 카카오톡 채널로 말씀없이 작성하시면 적용되지 않습니다!!
                      </p>
                    </div>

                    {/* 영상 스타일 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        🎬 영상 스타일 <span className="text-accent">*</span>
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
                        ✂️ 편집 스타일 <span className="text-accent">*</span>
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
                        🎵 음악 장르 <span className="text-accent">*</span>
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
                        ⏱️ 영상 진행형식 <span className="text-accent">*</span>
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
                      <label className="mb-3 block text-sm font-medium">✨ 추가효과</label>
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
                      <label className="mb-3 block text-sm font-medium">📱 추가 옵션 (추가비용 발생)</label>
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
                        💝 특별 요청사항
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
                onClick={handleNext}
                className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover"
              >
                다음
              </button>
            ) : (
              <button
                type="button"
              disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // 마지막 섹션에서만 제출 허용
                  if (currentSection === totalSections) {
                    handleSubmit(e as any);
                  }
                }}
              className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
