"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ProductType = "본식DVD" | "가성비형" | "기본형" | "야외스냅" | "프리웨딩" | "";

export default function NewReservationPage() {
  const router = useRouter();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState({
    // 기본 정보
    title: "",
    author: "",
    password: "",
    content: "",
    isPrivate: false,
    
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
    
    // 개인정보 활용 동의
    privacyAgreed: false,
    
    // 본식DVD 예약 고객님 필수 추가 작성 항목
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
    seonwonpan: false,
    gimbalShoot: false,
    
    // 본식DVD 주 재생매체
    playbackDevice: "",
    
    // 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목
    shootDate: "",
    shootTimePlace: "",
    shootConcept: "",
    
    // 할인사항 및 특이사항 작성 항목
    specialNotes: "",
    discountInfo: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
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

    // 필수 항목 검증
    if (!formData.title || !formData.author || !formData.password) {
      setError("제목, 계약자 성함, 비밀번호는 필수 항목입니다.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.termsAgreed || !formData.faqRead || !formData.privacyAgreed) {
      setError("약관 동의 및 개인정보 활용 동의는 필수입니다.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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
      return formData.title && formData.author && formData.password;
    }
    if (section === 2) {
      return formData.brideName && formData.bridePhone && formData.groomName && formData.groomPhone;
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
          <h1 className="text-3xl font-bold">예약 문의 작성</h1>
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
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: 기본 정보 */}
          {currentSection === 1 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">1. 기본 정보</h2>
              </div>
              
              <div>
                <label htmlFor="title" className="mb-2 block text-sm font-medium">
                  제목 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예: 2024년 5월 본식DVD 예약 문의"
                />
              </div>

              <div>
                <label htmlFor="author" className="mb-2 block text-sm font-medium">
                  계약자(글쓴이) 성함 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  required
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium">
                  비밀번호 <span className="text-accent">*</span>
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="글 수정/삭제 시 필요"
                />
              </div>

              <div>
                <label htmlFor="content" className="mb-2 block text-sm font-medium">
                  문의 내용
                </label>
                <textarea
                  id="content"
                  name="content"
                  rows={4}
                  value={formData.content}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  placeholder="추가 문의사항이 있으시면 작성해주세요."
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPrivate"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                />
                <label htmlFor="isPrivate" className="text-sm">
                  비밀글로 작성 (작성자와 관리자만 열람 가능)
                </label>
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
                  <option value="본식DVD">본식DVD</option>
                  <option value="가성비형">가성비형</option>
                  <option value="기본형">기본형</option>
                  <option value="야외스냅">야외스냅</option>
                  <option value="프리웨딩">프리웨딩</option>
                </select>
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

          {/* Section 3: 개인정보 활용 동의 */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">3. 개인정보 활용 동의 (필수)</h2>
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

          {/* Section 4: 본식DVD 예약 고객님 필수 추가 작성 항목 */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">4. 본식DVD 예약 고객님 필수 추가 작성 항목</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formData.productType === "본식DVD" || formData.productType === "기본형" || formData.productType === "가성비형"
                    ? "본식DVD 관련 정보를 입력해주세요."
                    : "본식DVD가 아닌 경우 다음 단계로 진행하세요."}
                </p>
              </div>

              {(formData.productType === "본식DVD" || formData.productType === "기본형" || formData.productType === "가성비형") && (
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
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
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
                        메이크업샵 촬영
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
                        폐백 촬영
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
                        피로연(2부 예식) 촬영
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

                  <div>
                    <label htmlFor="deliveryAddress" className="mb-2 block text-sm font-medium">
                      (USB)상품받으실 거주지 주소 <span className="text-accent">*</span>
                    </label>
                    <textarea
                      id="deliveryAddress"
                      name="deliveryAddress"
                      required
                      rows={3}
                      value={formData.deliveryAddress}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                      placeholder="상세 주소까지 입력해주세요"
                    />
                  </div>

                  <div>
                    <label htmlFor="playbackDevice" className="mb-2 block text-sm font-medium">
                      본식DVD 주 재생매체
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

          {/* Section 5: 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목 */}
          {currentSection === 5 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">5. 야외스냅, 프리웨딩 이벤트 예약 고객님 필수 추가 작성 항목</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  상담 후 최종적으로 결정된 항목을 작성 부탁드립니다.
                </p>
              </div>

              {(formData.productType === "야외스냅" || formData.productType === "프리웨딩") && (
                <>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="shootDate" className="mb-2 block text-sm font-medium">
                        촬영 날짜 <span className="text-accent">*</span>
                      </label>
                      <input
                        type="date"
                        id="shootDate"
                        name="shootDate"
                        required
                        value={formData.shootDate}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="shootTimePlace" className="mb-2 block text-sm font-medium">
                      시간 및 장소 <span className="text-accent">*</span>
                    </label>
                    <textarea
                      id="shootTimePlace"
                      name="shootTimePlace"
                      required
                      rows={3}
                      value={formData.shootTimePlace}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                      placeholder="예: 오전 10시, 한강공원"
                    />
                  </div>

                  <div>
                    <label htmlFor="shootConcept" className="mb-2 block text-sm font-medium">
                      원하시는 컨셉 <span className="text-accent">*</span>
                    </label>
                    <textarea
                      id="shootConcept"
                      name="shootConcept"
                      required
                      rows={4}
                      value={formData.shootConcept}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                      placeholder="원하시는 촬영 컨셉을 자세히 작성해주세요"
                    />
                  </div>
                </>
              )}

              <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                <p className="text-sm text-accent font-medium">
                  ★예약 후 임의로 예약글을 변경하셔도 변경된 내용으로 예약이 안되고 누락됩니다.
                  바뀌는 내용이 있을 시 스스로 변경하지 마시고 꼭 카카오톡 채널로 남겨주세요★
                </p>
              </div>
            </div>
          )}

          {/* Section 6: 할인사항 및 특이사항 */}
          {currentSection === 6 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">6. 할인사항 및 특이사항 작성 항목</h2>
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

              <div>
                <label htmlFor="discountInfo" className="mb-2 block text-sm font-medium">
                  할인 사항
                </label>
                <textarea
                  id="discountInfo"
                  name="discountInfo"
                  rows={4}
                  value={formData.discountInfo}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                  placeholder="적용할 할인 사항이 있으시면 작성해주세요"
                />
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
                onClick={() => {
                  if (canProceed(currentSection)) {
                    setCurrentSection(currentSection + 1);
                  } else {
                    setError("필수 항목을 모두 입력해주세요.");
                  }
                }}
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
                {isSubmitting ? "등록 중..." : "등록하기"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
