"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import LocaleLink from "@/components/ui/LocaleLink";
import { useLocale } from "@/lib/useLocale";
import { isBudgetProduct } from "@/lib/constants";
import DateInput from "@/components/ui/DateInput";
import TimeInput from "@/components/ui/TimeInput";
import { useReservationTranslation } from '@/components/reservation/ReservationTranslationProvider';

const RESERVATION_DRAFT_KEY = "rauvfilm_reservation_draft";

type ProductType = "가성비형" | "기본형" | "시네마틱형" | "";

type FormState = {
  title: string;
  password: string;
  isPrivate: boolean;
  isBrideContractor: boolean;
  isGroomContractor: boolean;
  privacyAgreed: boolean;
  overseasResident: boolean;
  brideName: string;
  bridePhone: string;
  groomName: string;
  groomPhone: string;
  receiptPhone: string;
  depositName: string;
  productEmail: string;
  productType: ProductType;
  partnerCode: string;
  referralNickname: string;
  foundPath: string;
  termsAgreed: boolean;
  faqRead: boolean;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  venueRegion: string;
  venueFloor: string;
  guestCount: string;
  makeupShoot: boolean;
  paebaekShoot: boolean;
  receptionShoot: boolean;
  mainSnapCompany: string;
  makeupShop: string;
  dressShop: string;
  deliveryAddress: string;
  usbOption: boolean;
  seonwonpan: boolean;
  gimbalShoot: boolean;
  playbackDevice: string[];
  eventType: string;
  shootLocation: string;
  shootDate: string;
  shootTime: string;
  shootConcept: string;
  discountNewYear: boolean;
  discountReview: boolean;
  discountCouple: boolean;
  discountReviewBlog: boolean;
  specialNotes: string;
  customShootingRequest: boolean;
  customStyle: string[];
  customEditStyle: string[];
  customMusic: string[];
  customLength: string[];
  customEffect: string[];
  customContent: string[];
  customSpecialRequest: string;
};

function hasMeaningfulDraft(f: FormState): boolean {
  const hasText = (s: string) => (s || "").trim().length > 0;
  return (
    hasText(f.brideName) ||
    hasText(f.groomName) ||
    hasText(f.bridePhone) ||
    hasText(f.groomPhone) ||
    hasText(f.productEmail) ||
    hasText(f.foundPath) ||
    hasText(f.venueName) ||
    hasText(f.mainSnapCompany) ||
    hasText(f.specialNotes) ||
    hasText(f.customSpecialRequest) ||
    hasText(f.shootLocation) ||
    hasText(f.shootConcept) ||
    f.productType !== "" ||
    f.discountCouple ||
    f.discountReview ||
    f.discountReviewBlog ||
    f.makeupShoot ||
    f.paebaekShoot ||
    f.receptionShoot
  );
}

function saveDraftToStorage(formData: FormState, currentSection: number) {
  if (!hasMeaningfulDraft(formData)) return;
  const { password: _, ...rest } = formData;
  try {
    localStorage.setItem(
      RESERVATION_DRAFT_KEY,
      JSON.stringify({ formData: rest, currentSection, savedAt: Date.now() })
    );
  } catch {
    // ignore
  }
}

function loadDraftFromStorage(): { formData: Partial<FormState>; currentSection: number } | null {
  try {
    const raw = localStorage.getItem(RESERVATION_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.formData || typeof parsed.currentSection !== "number") return null;
    return { formData: parsed.formData, currentSection: Math.min(4, Math.max(1, parsed.currentSection)) };
  } catch {
    return null;
  }
}

function clearDraftFromStorage() {
  try {
    localStorage.removeItem(RESERVATION_DRAFT_KEY);
  } catch {
    // ignore
  }
}

export default function NewReservationPage() {
  const router = useRouter();
  const locale = useLocale();
  const { t } = useReservationTranslation();
  const productTypeLabels: Record<string, string> = {
    "가성비형": t.budget,
    "기본형": t.standard,
    "시네마틱형": t.cinematic,
  };
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

    // 해외 거주 (한국 번호 없음) - 비밀번호=이메일, SMS 미발송
    overseasResident: false,
    
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
    referralNickname: "",
    foundPath: "",
    termsAgreed: false,
    faqRead: false,
    
    // 본식 영상 예약 고객님 필수 추가 작성 항목
    weddingDate: "",
    weddingTime: "",
    venueName: "",
    venueAddress: "",
    venueRegion: "",
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
    playbackDevice: [] as string[],
    
    // 이벤트 예약
    eventType: "",
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
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [partnerCodeSearch, setPartnerCodeSearch] = useState("");
  const [partnerCodeResults, setPartnerCodeResults] = useState<Array<{ code: string; author: string }>>([]);
  const [isSearchingPartnerCode, setIsSearchingPartnerCode] = useState(false);
  const [hasSearchedPartnerCode, setHasSearchedPartnerCode] = useState(false);
  const [selectedPartnerCode, setSelectedPartnerCode] = useState("");
  const [showConfirmPage, setShowConfirmPage] = useState(false);
  const [lemeGraphyDiscount, setLemeGraphyDiscount] = useState(0);
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [showNewYearTooltip, setShowNewYearTooltip] = useState(false);
  const [showPartnerCodeModal, setShowPartnerCodeModal] = useState(false);


  // 예약금 입금 안내 모달
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositCopied, setDepositCopied] = useState(false);
  const [createdReservationId, setCreatedReservationId] = useState<number | null>(null);

  // 초안 저장: 이탈 시(탭 닫기, 다른 페이지 이동) 저장
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveDraftToStorage(formData, currentSection);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      saveDraftToStorage(formData, currentSection);
    };
  }, [formData, currentSection]);

  // 마운트 시 저장된 초안 있으면 이어서 작성 여부 묻기
  useEffect(() => {
    const draft = loadDraftFromStorage();
    if (!draft?.formData || Object.keys(draft.formData).length === 0) return;
    if (hasMeaningfulDraft(formData as FormState)) return; // 이미 복원된 상태면 무시
    setShowDraftModal(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDraftRestore = useCallback(() => {
    const draft = loadDraftFromStorage();
    if (!draft?.formData) {
      setShowDraftModal(false);
      return;
    }
    const fd = draft.formData;
    setFormData((prev) => ({
      ...prev,
      title: fd.title ?? prev.title,
      isPrivate: fd.isPrivate ?? prev.isPrivate,
      isBrideContractor: fd.isBrideContractor ?? prev.isBrideContractor,
      isGroomContractor: fd.isGroomContractor ?? prev.isGroomContractor,
      privacyAgreed: fd.privacyAgreed ?? prev.privacyAgreed,
      overseasResident: fd.overseasResident ?? prev.overseasResident,
      brideName: fd.brideName ?? prev.brideName,
      bridePhone: fd.bridePhone ?? prev.bridePhone,
      groomName: fd.groomName ?? prev.groomName,
      groomPhone: fd.groomPhone ?? prev.groomPhone,
      receiptPhone: fd.receiptPhone ?? prev.receiptPhone,
      depositName: fd.depositName ?? prev.depositName,
      productEmail: fd.productEmail ?? prev.productEmail,
      productType: (fd.productType as ProductType) ?? prev.productType,
      partnerCode: fd.partnerCode ?? prev.partnerCode,
      foundPath: fd.foundPath ?? prev.foundPath,
      termsAgreed: fd.termsAgreed ?? prev.termsAgreed,
      faqRead: fd.faqRead ?? prev.faqRead,
      weddingDate: fd.weddingDate ?? prev.weddingDate,
      weddingTime: fd.weddingTime ?? prev.weddingTime,
      venueName: fd.venueName ?? prev.venueName,
      venueAddress: (fd as { venueAddress?: string }).venueAddress ?? prev.venueAddress,
      venueRegion: (fd as { venueRegion?: string }).venueRegion ?? prev.venueRegion,
      venueFloor: fd.venueFloor ?? prev.venueFloor,
      guestCount: fd.guestCount ?? prev.guestCount,
      makeupShoot: fd.makeupShoot ?? prev.makeupShoot,
      paebaekShoot: fd.paebaekShoot ?? prev.paebaekShoot,
      receptionShoot: fd.receptionShoot ?? prev.receptionShoot,
      mainSnapCompany: fd.mainSnapCompany ?? prev.mainSnapCompany,
      makeupShop: fd.makeupShop ?? prev.makeupShop,
      dressShop: fd.dressShop ?? prev.dressShop,
      deliveryAddress: fd.deliveryAddress ?? prev.deliveryAddress,
      usbOption: fd.usbOption ?? prev.usbOption,
      seonwonpan: fd.seonwonpan ?? prev.seonwonpan,
      gimbalShoot: fd.gimbalShoot ?? prev.gimbalShoot,
      playbackDevice: Array.isArray(fd.playbackDevice) ? fd.playbackDevice : prev.playbackDevice,
      discountNewYear: fd.discountNewYear ?? prev.discountNewYear,
      discountReview: fd.discountReview ?? prev.discountReview,
      discountCouple: fd.discountCouple ?? prev.discountCouple,
      discountReviewBlog: fd.discountReviewBlog ?? prev.discountReviewBlog,
      specialNotes: fd.specialNotes ?? prev.specialNotes,
      customShootingRequest: fd.customShootingRequest ?? prev.customShootingRequest,
      customStyle: Array.isArray(fd.customStyle) ? fd.customStyle : prev.customStyle,
      customEditStyle: Array.isArray(fd.customEditStyle) ? fd.customEditStyle : prev.customEditStyle,
      customMusic: Array.isArray(fd.customMusic) ? fd.customMusic : prev.customMusic,
      customLength: Array.isArray(fd.customLength) ? fd.customLength : prev.customLength,
      customEffect: Array.isArray(fd.customEffect) ? fd.customEffect : prev.customEffect,
      customContent: Array.isArray(fd.customContent) ? fd.customContent : prev.customContent,
      customSpecialRequest: fd.customSpecialRequest ?? prev.customSpecialRequest,
      eventType: (fd as { eventType?: string }).eventType ?? prev.eventType,
      shootLocation: (fd as { shootLocation?: string }).shootLocation ?? prev.shootLocation,
      shootDate: (fd as { shootDate?: string }).shootDate ?? prev.shootDate,
      shootTime: (fd as { shootTime?: string }).shootTime ?? prev.shootTime,
      shootConcept: (fd as { shootConcept?: string }).shootConcept ?? prev.shootConcept,
    }));
    setCurrentSection(draft.currentSection);
    setPartnerCodeSearch((fd.partnerCode as string) ?? "");
    setShowDraftModal(false);
  }, []);

  const handleDraftDiscard = useCallback(() => {
    clearDraftFromStorage();
    setShowDraftModal(false);
  }, []);

  // 짝궁코드 검색 함수
  const searchPartnerCode = async (query: string) => {
    if (query.length < 2) {
      setPartnerCodeResults([]);
      return;
    }

    setIsSearchingPartnerCode(true);
    setHasSearchedPartnerCode(false);
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
      setHasSearchedPartnerCode(true);
    }
  };


  // 짝궁코드 선택 함수 (검색 결과에서 선택 시)
  const selectPartnerCode = (code: string) => {
    setSelectedPartnerCode(code);
    setFormData((prev) => ({ ...prev, partnerCode: code }));
    setPartnerCodeSearch(code);
    setPartnerCodeResults([]);
    setError("");
    setMissingFields([]);
  };

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
        
        // 계약자 전화번호가 변경되면 비밀번호 자동 업데이트 (해외거주 시에는 이메일이 비밀번호)
        if (!prev.overseasResident) {
          if (name === "bridePhone" && prev.isBrideContractor) {
            updated.password = removeHyphens(formatted);
          } else if (name === "groomPhone" && prev.isGroomContractor) {
            updated.password = removeHyphens(formatted);
          }
        }
        
        return updated;
      });
      return;
    }
    
    // 계약자 체크박스 처리 (해외거주 시 비밀번호=이메일이므로 전화번호로 설정하지 않음)
    if (name === "isBrideContractor") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        isBrideContractor: isChecked,
        isGroomContractor: isChecked ? false : prev.isGroomContractor,
        password: prev.overseasResident ? prev.productEmail : (isChecked ? removeHyphens(prev.bridePhone) : (prev.isGroomContractor ? removeHyphens(prev.groomPhone) : "")),
      }));
      return;
    }
    
    if (name === "isGroomContractor") {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        isGroomContractor: isChecked,
        isBrideContractor: isChecked ? false : prev.isBrideContractor,
        password: prev.overseasResident ? prev.productEmail : (isChecked ? removeHyphens(prev.groomPhone) : (prev.isBrideContractor ? removeHyphens(prev.bridePhone) : "")),
      }));
      return;
    }

    // 해외 거주 체크 시 비밀번호 = 이메일
    if (name === "overseasResident") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        overseasResident: checked,
        password: checked ? prev.productEmail : (prev.isBrideContractor ? removeHyphens(prev.bridePhone) : prev.isGroomContractor ? removeHyphens(prev.groomPhone) : ""),
      }));
      return;
    }

    // 해외 거주 시 이메일 변경하면 비밀번호도 이메일로 동기화
    if (name === "productEmail" && formData.overseasResident) {
      setFormData((prev) => ({ ...prev, productEmail: value, password: value }));
      return;
    }
    
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]:
          type === "checkbox"
            ? (e.target as HTMLInputElement).checked
            : value,
      };
      
      // 상품 종류가 가성비형/1인1캠으로 변경되면 신년할인 해제
      if (name === "productType" && isBudgetProduct(value)) {
        updated.discountNewYear = false;
      }
      
      // 메인스냅이 르메그라피일 때 처리
      if (name === "mainSnapCompany") {
        const isLemeGraphy = value.toLowerCase().includes("르메그라피") || value.toLowerCase().includes("leme");
        if (isLemeGraphy && (updated.productType === "기본형" || updated.productType === "시네마틱형")) {
          // 1인 2캠(기본형) 또는 2인 3캠(시네마틱형)에 15만원 할인
          setLemeGraphyDiscount(150000);
          updated.discountNewYear = false; // 신년할인 비활성화
        } else {
          setLemeGraphyDiscount(0);
        }
      }
      
      // 상품 타입 변경 시 메인스냅이 르메그라피인지 확인
      if (name === "productType") {
        const isLemeGraphy = updated.mainSnapCompany.toLowerCase().includes("르메그라피") || updated.mainSnapCompany.toLowerCase().includes("leme");
        if (isLemeGraphy && (value === "기본형" || value === "시네마틱형")) {
          setLemeGraphyDiscount(150000);
          updated.discountNewYear = false;
        } else {
          setLemeGraphyDiscount(0);
        }
      }
      
      // 짝궁할인 체크 해제 시 짝궁코드 초기화
      if (name === "discountCouple" && !(e.target as HTMLInputElement).checked) {
        updated.partnerCode = "";
        setPartnerCodeSearch("");
        setSelectedPartnerCode("");
        setPartnerCodeResults([]);
      }
      
      return updated;
    });
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
  const handleNext = async () => {
    // 마지막 섹션이면 다음으로 이동하지 않음
    if (currentSection >= totalSections) {
      return;
    }

    // 섹션 4에서 짝궁코드 검증이 필요한 경우
    if (currentSection === 4 && formData.discountCouple && formData.partnerCode) {
      try {
        // 타임아웃 설정 (30초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        const res = await fetch(`/api/reservations/referral-code/validate?code=${encodeURIComponent(formData.partnerCode.trim())}`, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: '검증 요청 실패' }));
          setError(t.validationPartnerCodeNotFound);
          setMissingFields([t.validationPartnerCodeNotFound]);
          const element = document.getElementById("partnerCode");
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          return;
        }
        const data = await res.json();
        if (!data.valid) {
          setError(t.validationPartnerCodeNotFound);
          setMissingFields([t.validationPartnerCodeNotFound]);
          const element = document.getElementById("partnerCode");
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setError(t.validationTimeout);
          setMissingFields([t.validationTimeout]);
        } else {
          console.error('짝궁코드 검증 오류:', error);
          setError(t.validationPartnerCodeError);
          setMissingFields([t.validationPartnerCodeError]);
        }
        const element = document.getElementById("partnerCode");
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
        return;
      }
    }

    if (canProceed(currentSection)) {
      setCurrentSection(currentSection + 1);
      setError("");
      setMissingFields([]);
    } else {
      // 현재 섹션의 모든 누락된 필수 항목 찾기
      const missing: string[] = [];
      let firstErrorId = "";

      if (currentSection === 1) {
        if (!formData.privacyAgreed) {
          missing.push(t.fieldPrivacyAgreed);
          if (!firstErrorId) firstErrorId = "privacyAgreed";
        }
      } else if (currentSection === 2) {
        if (!formData.brideName) {
          missing.push(t.fieldBrideName);
          if (!firstErrorId) firstErrorId = "brideName";
        }
        if (!formData.overseasResident && !formData.bridePhone) {
          missing.push(t.fieldBridePhone);
          if (!firstErrorId) firstErrorId = "bridePhone";
        }
        if (!formData.groomName) {
          missing.push(t.fieldGroomName);
          if (!firstErrorId) firstErrorId = "groomName";
        }
        if (!formData.overseasResident && !formData.groomPhone) {
          missing.push(t.fieldGroomPhone);
          if (!firstErrorId) firstErrorId = "groomPhone";
        }
        if (!formData.isBrideContractor && !formData.isGroomContractor) {
          missing.push(t.fieldContractor);
          if (!firstErrorId) firstErrorId = "isBrideContractor";
        }
        if (!formData.overseasResident && !formData.receiptPhone) {
          missing.push(t.fieldReceiptPhone);
          if (!firstErrorId) firstErrorId = "receiptPhone";
        }
        if (!formData.depositName) {
          missing.push(t.fieldDepositName);
          if (!firstErrorId) firstErrorId = "depositName";
        }
        if (!formData.productEmail) {
          missing.push(t.fieldProductEmail);
          if (!firstErrorId) firstErrorId = "productEmail";
        }
        if (!formData.foundPath) {
          missing.push(t.fieldFoundPath);
          if (!firstErrorId) firstErrorId = "foundPath";
        }
        if (!formData.termsAgreed) {
          missing.push(t.fieldTermsAgreed);
          if (!firstErrorId) firstErrorId = "termsAgreed";
        }
        if (!formData.faqRead) {
          missing.push(t.fieldFaqRead);
          if (!firstErrorId) firstErrorId = "faqRead";
        }
      } else if (currentSection === 3) {
        // 섹션 3: 상품 종류 필수 체크
        if (!formData.productType) {
          missing.push(t.fieldProductType);
          if (!firstErrorId) firstErrorId = "productType";
        }
        // 본식 영상 예약 필수 항목 체크
        if (formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") {
          if (!formData.weddingDate) {
            missing.push(t.fieldWeddingDate);
            if (!firstErrorId) firstErrorId = "weddingDate";
          }
          if (!formData.weddingTime) {
            missing.push(t.fieldWeddingTime);
            if (!firstErrorId) firstErrorId = "weddingTime";
          }
          if (!formData.venueName) {
            missing.push(t.fieldVenueName);
            if (!firstErrorId) firstErrorId = "venueName";
          }
          if (formData.usbOption && !formData.deliveryAddress) {
            missing.push(t.fieldUsbAddress);
            if (!firstErrorId) firstErrorId = "deliveryAddress";
          }
        }
      } else if (currentSection === 4) {
        // 짝궁할인 체크 시 짝궁코드 필수 및 DB 검증
        if (formData.discountCouple) {
          if (!formData.partnerCode) {
            missing.push(t.fieldPartnerCode);
            if (!firstErrorId) firstErrorId = "partnerCode";
          } else {
            // DB에 존재하는지 검증 (비동기)
            // 검증은 handleNext에서 async로 처리
          }
        }
      }
      
      if (missing.length > 0) {
        setMissingFields(missing);
        if (currentSection === 4 && formData.discountCouple && !formData.partnerCode) {
          setError(t.validationPartnerCodeRequired);
        } else {
          setError(t.validationRequired);
        }
        setTimeout(() => scrollToFirstError(firstErrorId), 100);
      } else {
        setError(t.validationAllRequired);
        setMissingFields([]);
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
    
    // 확인 페이지가 아니면 확인 페이지로 이동
    if (currentSection !== totalSections) {
      setShowConfirmPage(true);
      setCurrentSection(totalSections);
      return;
    }
    
    // 확인 페이지에서 실제 제출
    
    // 이미 제출 중이면 중복 제출 방지
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setError("");

    // 필수 항목 검증 및 스크롤 이동
    if (!formData.privacyAgreed) {
      setError(t.validationPrivacyRequired);
      setCurrentSection(1);
      setTimeout(() => scrollToFirstError("privacyAgreed"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.brideName) {
      setError(t.validationBrideName);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("brideName"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.overseasResident && !formData.bridePhone) {
      setError(t.validationBridePhone);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("bridePhone"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.groomName) {
      setError(t.validationGroomName);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("groomName"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.overseasResident && !formData.groomPhone) {
      setError(t.validationGroomPhone);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("groomPhone"), 100);
      setIsSubmitting(false);
      return;
    }

    // 계약자 확인
    if (!formData.isBrideContractor && !formData.isGroomContractor) {
      setError(t.validationContractor);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("isBrideContractor"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.overseasResident && !formData.receiptPhone) {
      setError(t.validationReceiptPhone);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("receiptPhone"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.depositName) {
      setError(t.validationDepositName);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("depositName"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.productEmail) {
      setError(t.validationProductEmail);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("productEmail"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.productType) {
      setError(t.validationProductType);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("productType"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.foundPath) {
      setError(t.validationFoundPath);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("foundPath"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.termsAgreed) {
      setError(t.validationTerms);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("termsAgreed"), 100);
      setIsSubmitting(false);
      return;
    }

    if (!formData.faqRead) {
      setError(t.validationFaq);
      setCurrentSection(2);
      setTimeout(() => scrollToFirstError("faqRead"), 100);
      setIsSubmitting(false);
      return;
    }

    // 짝궁코드 닉네임 필수 검증
    if (!formData.referralNickname || formData.referralNickname.trim().length < 2) {
      setError(t.validationReferralNickname);
      setCurrentSection(4);
      setTimeout(() => scrollToFirstError("referralNickname"), 100);
      setIsSubmitting(false);
      return;
    }

    // 짝궁할인 체크 시 짝궁코드 필수 검증
    if (formData.discountCouple && !formData.partnerCode) {
      setError(t.validationPartnerCodeSelect);
      setCurrentSection(4);
      setTimeout(() => scrollToFirstError("partnerCode"), 100);
      setIsSubmitting(false);
      return;
    }

    // 본식 영상 예약 필수 항목 검증
    if (formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") {
      if (!formData.weddingDate) {
        setError(t.validationWeddingDate);
        setCurrentSection(3);
        setTimeout(() => scrollToFirstError("weddingDate"), 100);
        setIsSubmitting(false);
        return;
      }

      if (!formData.weddingTime) {
        setError(t.validationWeddingTime);
        setCurrentSection(3);
        setTimeout(() => scrollToFirstError("weddingTime"), 100);
        setIsSubmitting(false);
        return;
      }

      if (!formData.venueName) {
        setError(t.validationVenueName);
        setCurrentSection(3);
        setTimeout(() => scrollToFirstError("venueName"), 100);
        setIsSubmitting(false);
        return;
      }

      if (formData.usbOption && !formData.deliveryAddress) {
        setError(t.validationUsbAddress);
        setCurrentSection(3);
        setTimeout(() => scrollToFirstError("deliveryAddress"), 100);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      // 계약자 이름/비밀번호 자동 설정
      const contractorName = formData.isBrideContractor ? formData.brideName : formData.groomName;
      const contractorPhone = formData.isBrideContractor
        ? removeHyphens(formData.bridePhone)
        : removeHyphens(formData.groomPhone);
      const autoPassword = formData.overseasResident ? formData.productEmail : contractorPhone;

      // 상품 정가 계산
      const productPrices: Record<string, number> = {
        '가성비형': 340000,
        '기본형': 600000,
        '시네마틱형': 950000,
      };
      const basePrice = productPrices[formData.productType] || 0;

      // 추가 옵션 계산
      const makeupShootPrice = formData.makeupShoot ? 200000 : 0;
      const paebaekShootPrice = formData.paebaekShoot ? 50000 : 0;
      const receptionShootPrice = formData.receptionShoot ? 50000 : 0;
      const usbOptionPrice = formData.usbOption ? 20000 : 0;

      const totalAmount = basePrice + makeupShootPrice + paebaekShootPrice + receptionShootPrice + usbOptionPrice;

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          author: contractorName,
          password: autoPassword,
          totalAmount, // 상품 정가 + 추가 옵션
          lemeGraphyDiscount: lemeGraphyDiscount, // 르메그라피 제휴 할인
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
        throw new Error(data.error || t.validationSubmitFailed);
      }

      clearDraftFromStorage();
      setCreatedReservationId(data.id);
      setShowDepositModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalSections = 6; // 확인 페이지 포함 (야외스냅/프리웨딩은 마이페이지에서 별도 신청)
  const canProceed = (section: number) => {
    if (section === 1) {
      // 섹션 1: 개인정보 활용 동의만 체크
      return formData.privacyAgreed;
    }
    if (section === 2) {
      // 섹션 2: 해당 섹션에 표시되는 필수 항목만 체크 (해외거주 시 전화번호 선택)
      const hasNames = formData.brideName && formData.groomName;
      const hasPhones = formData.overseasResident || (formData.bridePhone && formData.groomPhone);
      const hasContractor = formData.isBrideContractor || formData.isGroomContractor;
      const hasReceiptPhone = formData.overseasResident || formData.receiptPhone;
      const hasDepositName = formData.depositName;
      const hasProductEmail = formData.productEmail;
      const hasFoundPath = formData.foundPath;
      const hasTermsAgreed = formData.termsAgreed;
      const hasFaqRead = formData.faqRead;
      return hasNames && hasPhones && hasContractor && hasReceiptPhone && hasDepositName && hasProductEmail && hasFoundPath && hasTermsAgreed && hasFaqRead;
    }
    if (section === 3) {
      // 섹션 3: 상품 종류 필수 체크 + 본식 영상 예약 필수 항목 체크
      const hasProductType = formData.productType;
      if (!hasProductType) {
        return false;
      }
      // 본식 영상 예약 필수 항목만 체크 (해당 상품 타입인 경우에만)
      if (formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") {
        const hasWeddingDate = formData.weddingDate;
        const hasWeddingTime = formData.weddingTime;
        const hasVenueName = formData.venueName;
        const hasDeliveryAddress = !formData.usbOption || formData.deliveryAddress;
        return hasWeddingDate && hasWeddingTime && hasVenueName && hasDeliveryAddress;
      }
      // 본식 영상 예약이 아니면 상품 종류만 확인하면 통과
      return true;
    }
    if (section === 4) {
      // 섹션 4: 짝궁할인 체크 시 짝궁코드만 체크
      if (formData.discountCouple) {
        return !!formData.partnerCode;
      }
      // 짝궁할인을 체크하지 않으면 통과
      return true;
    }
    if (section === 5) {
      // 섹션 5: 특이사항 (선택사항이므로 항상 통과)
      return true;
    }
    return true;
  };

  return (
    <div className="min-h-screen py-20 px-4">

      {/* 예약금 입금 안내 모달 */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background border border-border p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-1">{t.depositModalTitle}</h3>
              <p className="text-sm text-muted-foreground">{t.depositModalDesc}</p>
            </div>

            <div className="rounded-lg bg-muted p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.bank}</span>
                <span className="font-medium">{t.bankName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.accountNumber}</span>
                <span className="font-medium font-mono">037437-04-012104</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.accountHolder}</span>
                <span className="font-medium">{t.accountHolderName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t.depositAmount}</span>
                <span className="font-bold text-accent">{t.depositPrice}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText("03743704012104");
                  setDepositCopied(true);
                  setTimeout(() => setDepositCopied(false), 2000);
                } catch { /* fallback */ }
              }}
              className="w-full py-3 px-4 rounded-lg border border-border bg-muted text-sm font-medium hover:bg-muted/80 transition-colors mb-3"
            >
              {depositCopied ? t.copied : t.copyAccount}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDepositModal(false);
                router.push(`/${locale}/reservation/complete${createdReservationId ? `?id=${createdReservationId}` : ""}`);
              }}
              className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              {t.confirm}
            </button>
          </div>
        </div>
      )}

      {/* 초안 이어서 작성 모달 */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background border border-border p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">{t.draftModalTitle}</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t.draftModalDesc}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDraftRestore}
                className="flex-1 rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
              >
                {t.continueDraft}
              </button>
              <button
                type="button"
                onClick={handleDraftDiscard}
                className="flex-1 rounded-lg border border-border py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                {t.newDraft}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 짝궁코드 검색 모달 */}
      {showPartnerCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background border border-border shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-lg font-semibold">{t.partnerCodeSearchTitle}</h3>
              <button
                type="button"
                onClick={() => {
                  setShowPartnerCodeModal(false);
                  setPartnerCodeSearch("");
                  setPartnerCodeResults([]);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <div className="relative mb-4 flex gap-2">
                <input
                  type="text"
                  value={partnerCodeSearch}
                  onChange={(e) => {
                    setPartnerCodeSearch(e.target.value);
                    setHasSearchedPartnerCode(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      if (partnerCodeSearch.trim().length >= 2) {
                        searchPartnerCode(partnerCodeSearch.trim());
                      }
                    }
                  }}
                  className="flex-1 pl-4 pr-4 py-3 rounded-lg border border-border bg-background text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder={t.partnerCodeInput}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => {
                    if (partnerCodeSearch.trim().length >= 2) {
                      searchPartnerCode(partnerCodeSearch.trim());
                    }
                  }}
                  disabled={partnerCodeSearch.trim().length < 2 || isSearchingPartnerCode}
                  className="px-4 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {isSearchingPartnerCode ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    t.search
                  )}
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto rounded-lg border border-border">
                {partnerCodeResults.length > 0 ? (
                  partnerCodeResults.map((result) => (
                    <button
                      key={result.code}
                      type="button"
                      onClick={() => {
                        selectPartnerCode(result.code);
                        setShowPartnerCodeModal(false);
                        setPartnerCodeSearch("");
                        setPartnerCodeResults([]);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm border-b border-border last:border-b-0 hover:bg-muted transition-colors ${
                        selectedPartnerCode === result.code ? "bg-muted" : ""
                      }`}
                    >
                      <span className="font-medium">{result.code}</span>
                    </button>
                  ))
                ) : hasSearchedPartnerCode && !isSearchingPartnerCode && partnerCodeResults.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm font-medium text-accent mb-2">{t.noSearchResults}</p>
                    <p className="text-xs text-muted-foreground">{t.expiredCodeNote}</p>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    {t.searchPrompt}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <LocaleLink
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
            {t.backToList}
          </LocaleLink>
          <h1 className="text-3xl font-bold">{t.newTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.newSubtitle}
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
          <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-2">{error}</p>
                {missingFields.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground/90">
                    {missingFields.map((field, index) => (
                      <li key={index}>{field}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
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
                <h2 className="text-xl font-semibold">{t.privacyTitle}</h2>
              </div>

              <div className="rounded-lg border border-border bg-muted p-6 space-y-4">
                <p className="text-sm leading-relaxed">
                  {t.privacyText}
                </p>

                <div className="space-y-2">
                  <h3 className="font-semibold">{t.privacyCollectionTitle}</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>{t.privacyItem1}</li>
                    <li>{t.privacyItem2}</li>
                    <li>{t.privacyItem3}</li>
                  </ul>
                </div>

                <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                  <p className="text-sm text-accent font-medium">
                    {t.privacyWarning}
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
                    {t.privacyAgreeLabel} <span className="text-accent">*</span>
                  </label>
                </div>
              </div>

            </div>
          )}

          {/* Section 2: 필수 작성항목(공통) */}
          {currentSection === 2 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">{t.requiredFieldsTitle}</h2>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
          <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="brideName" className="block text-sm font-medium">
                      {t.brideName} <span className="text-accent">*</span>
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
                        {t.contractor}
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
                    {t.bridePhone} {!formData.overseasResident && <span className="text-accent">*</span>}
              </label>
                  <input
                    type="tel"
                    id="bridePhone"
                    name="bridePhone"
                    required={!formData.overseasResident}
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
                      {t.groomName} <span className="text-accent">*</span>
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
                        {t.contractor}
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
                    {t.groomPhone} {!formData.overseasResident && <span className="text-accent">*</span>}
              </label>
              <input
                    type="tel"
                    id="groomPhone"
                    name="groomPhone"
                required={!formData.overseasResident}
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
                  {t.receiptPhone} {!formData.overseasResident && <span className="text-accent">*</span>}
              </label>
              <input
                type="tel"
                  id="receiptPhone"
                  name="receiptPhone"
                  required={!formData.overseasResident}
                  value={formData.receiptPhone}
                onChange={handleChange}
                  maxLength={13}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="010-1234-5678"
              />
            </div>

            <div>
                <label htmlFor="depositName" className="mb-2 block text-sm font-medium">
                  {t.depositName} <span className="text-accent">*</span>
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
                  {t.productEmailFull} <span className="text-accent">*</span>
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

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="overseasResident"
                    name="overseasResident"
                    checked={formData.overseasResident}
                    onChange={handleChange}
                    className="h-5 w-5 mt-0.5 rounded border-border bg-background text-accent focus:ring-accent"
                  />
                  <div>
                    <label htmlFor="overseasResident" className="text-sm font-medium cursor-pointer">
                      {t.overseasResident}
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t.overseasResidentDesc}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="foundPath" className="mb-2 block text-sm font-medium">
                  {t.foundPath} <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  id="foundPath"
                  name="foundPath"
                  required
                  value={formData.foundPath}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder={t.foundPathPlaceholder}
                />
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
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
                    {t.termsAgreeLabel} <span className="text-accent">*</span>
                  </label>
                  <LocaleLink
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    {t.viewTerms}
                  </LocaleLink>
                </div>
                <div className="flex flex-wrap items-center gap-2">
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
                    {t.faqReadLabel} <span className="text-accent">*</span>
                  </label>
                  <LocaleLink
                    href="/faq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    {t.viewFaq}
                  </LocaleLink>
                </div>
              </div>
            </div>
          )}

          {/* Section 3: 본식 영상 예약 고객님 필수 추가 작성 항목 */}
          {currentSection === 3 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">{t.weddingInfoTitle}</h2>
              </div>

              <div>
                <label htmlFor="productType" className="mb-2 block text-sm font-medium">
                  {t.productType} <span className="text-accent">*</span>
                </label>
                <select
                  id="productType"
                  name="productType"
                  required
                  value={formData.productType}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                >
                  <option value="">{t.selectProduct}</option>
                  <option value="가성비형">{t.budget}</option>
                  <option value="기본형">{t.standard}</option>
                  <option value="시네마틱형">{t.cinematic}</option>
                </select>
              </div>

              {(formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") && (
                <>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="weddingDate" className="mb-2 block text-sm font-medium">
                        {t.weddingDate} <span className="text-accent">*</span>
              </label>
              <DateInput
                id="weddingDate"
                name="weddingDate"
                required
                value={formData.weddingDate}
                onChange={handleChange}
                className="rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-foreground cursor-pointer"
              />
            </div>
            <div>
                      <label htmlFor="weddingTime" className="mb-2 block text-sm font-medium">
                        {t.weddingTime} <span className="text-accent">*</span>
                      </label>
                      <TimeInput
                        id="weddingTime"
                        name="weddingTime"
                        required
                        value={formData.weddingTime}
                        onChange={handleChange}
                        className="rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent text-foreground cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="venueName" className="mb-2 block text-sm font-medium">
                        {t.venueName} <span className="text-accent">*</span>
                      </label>
                      <input
                        type="text"
                        id="venueName"
                        name="venueName"
                        required
                        value={formData.venueName}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                        placeholder={t.venuePlaceholder}
                      />
                    </div>
                    <div>
                      <label htmlFor="venueFloor" className="mb-2 block text-sm font-medium">
                        {t.venueFloor}
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
                      {t.guestCount}
                    </label>
                    <input
                      type="number"
                      id="guestCount"
                      name="guestCount"
                      value={formData.guestCount}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder={t.guestCountPlaceholder}
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
                        {t.makeupShoot}
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
                        {t.paebaekShoot}
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
                        {t.receptionShoot}
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
                      <label htmlFor="usbOption" className="text-sm font-medium">
                        {t.usbOption}
                      </label>
                    </div>
                    {formData.usbOption && (
                      <div className="ml-8">
                        <label htmlFor="deliveryAddress" className="mb-2 block text-sm font-medium">
                          {t.usbAddressFull} <span className="text-accent">*</span>
                        </label>
                        <textarea
                          id="deliveryAddress"
                          name="deliveryAddress"
                          required={formData.usbOption}
                          rows={3}
                          value={formData.deliveryAddress}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent resize-none"
                          placeholder={t.usbAddressFullPlaceholder}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="mainSnapCompany" className="mb-2 block text-sm font-medium">
                      {t.mainSnapCompany}
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
                        {t.makeupShop}
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
                        {t.dressShop}
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
                    <label className="mb-2 block text-sm font-medium">
                      {t.playbackDevice}
                    </label>
                    <div className="space-y-3">
                      {[
                        { value: "핸드폰", label: t.devicePhone },
                        { value: "LED TV", label: "LED TV" },
                        { value: "OLED TV", label: "OLED TV" },
                        { value: "빔프로젝터", label: t.deviceProjector },
                      ].map((device) => (
                        <div key={device.value} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id={`playbackDevice-${device.value}`}
                            checked={formData.playbackDevice.includes(device.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData((prev) => ({
                                  ...prev,
                                  playbackDevice: [...prev.playbackDevice, device.value],
                                }));
                              } else {
                                setFormData((prev) => ({
                                  ...prev,
                                  playbackDevice: prev.playbackDevice.filter((d) => d !== device.value),
                                }));
                              }
                            }}
                            className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                          />
                          <label htmlFor={`playbackDevice-${device.value}`} className="text-sm cursor-pointer">
                            {device.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Section 4: 할인사항 */}
          {currentSection === 4 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">{t.discountTitle}</h2>
              </div>

              <div className="rounded-lg border border-border bg-muted p-4">
                <h3 className="mb-3 text-sm font-medium">{t.discountEvent}</h3>
                <div className="space-y-3">
          <div className="flex items-center gap-3">
            {(() => {
              const isLemeGraphyDiscount = (formData.mainSnapCompany || "").toLowerCase().includes("르메그라피") || (formData.mainSnapCompany || "").toLowerCase().includes("leme");
              const lemeProduct = formData.productType === "기본형" || formData.productType === "시네마틱형";
              const noNewYear = isBudgetProduct(formData.productType) || (isLemeGraphyDiscount && lemeProduct);
              return (
                <>
                  <input
                    type="checkbox"
                    id="discountNewYear"
                    name="discountNewYear"
                    checked={formData.discountNewYear}
                    onChange={handleChange}
                    disabled={noNewYear}
                    className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="discountNewYear" className={`text-sm ${noNewYear ? "text-muted-foreground" : ""}`}>
                    {t.discountNewYear}
                    {isBudgetProduct(formData.productType) && <span className="ml-2 text-xs">{t.budgetNoDiscount}</span>}
                    {isLemeGraphyDiscount && lemeProduct && (
                      <span className="ml-2 text-xs">{t.lemeGraphyNoDiscount}</span>
                    )}
                  </label>
                  <div className="relative inline-block ml-1">
                    <button
                      type="button"
                      onClick={() => setShowNewYearTooltip(!showNewYearTooltip)}
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30 transition-colors text-[10px] font-bold leading-none"
                    >
                      ?
                    </button>
                    {showNewYearTooltip && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowNewYearTooltip(false)} />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 p-3 rounded-lg bg-[#1a1a1a] border border-border shadow-xl text-xs text-white/80 leading-relaxed">
                          {t.lemeGraphyTooltip}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-[#1a1a1a]" />
                        </div>
                      </>
                    )}
                  </div>
                </>
              );
            })()}
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
                      {t.discountReviewPost}
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
                      {t.discountCouple}
                    </label>
                  </div>
                  {formData.discountCouple && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium">
                        {t.partnerCode} <span className="text-accent">*</span>
                      </label>
                      <p className="mb-2 text-xs text-muted-foreground">
                        {"⚠ " + t.partnerCodeWarning}
                      </p>
                      <button
                        type="button"
                        id="partnerCode"
                        onClick={() => setShowPartnerCodeModal(true)}
                        className="w-full rounded-lg border border-border bg-background px-4 py-3 text-left text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      >
                        {formData.partnerCode ? (
                          <span className="font-medium">{formData.partnerCode}</span>
                        ) : (
                          <span className="text-muted-foreground">{t.partnerCodeSearchSelect}</span>
                        )}
                      </button>
                      {!formData.partnerCode && (
                        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">{"⚠ " + t.partnerCodeRequired}</p>
                      )}
                    </div>
                  )}

                  {/* 짝궁코드 닉네임 (필수) */}
                  <div className="mt-4 p-4 rounded-lg border border-accent/30 bg-accent/5">
                    <label htmlFor="referralNickname" className="mb-2 block text-sm font-medium">
                      {t.referralNickname} <span className="text-red-500">*</span>
                    </label>
                    <p className="mb-2 text-xs text-muted-foreground">
                      {t.referralNicknameDesc}
                    </p>
                    <input
                      type="text"
                      id="referralNickname"
                      name="referralNickname"
                      value={formData.referralNickname}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                      placeholder={t.referralNicknamePlaceholder}
                      maxLength={10}
                      minLength={2}
                      required
                    />
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
                      {isBudgetProduct(formData.productType)
                        ? t.discountReviewBlogBudget
                        : t.discountReviewBlogStandard}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: 특이사항 (야외스냅/프리웨딩은 마이페이지에서 별도 신청) */}
          {currentSection === 5 && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">{t.section5Title}</h2>
              </div>

              {(formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") && (
                <div className="space-y-3">
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
                      {t.seonwonpan}
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="specialNotes" className="mb-2 block text-sm font-medium">
                  {t.specialNotes}
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
                  placeholder={t.specialNotesPlaceholder}
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
                    {"🎬 " + t.customShootingRequestFull}
                  </label>
                </div>

                {formData.customShootingRequest && (
                  <div className="space-y-6 mt-4 pt-4 border-t border-border">
                    {/* 안내 문구 */}
                    <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {"✅ " + t.customGuide1}
                        <br />
                        {"✅ " + t.customGuide2}
                        <br />
                        {"🚨 " + t.customGuide3}
                      </p>
                    </div>

                    {/* 촬영 방법 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        {"📹 " + t.shootingMethod}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="shootingMethod-gimbal"
                            name="gimbalShoot"
                            checked={formData.gimbalShoot === true}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                gimbalShoot: true,
                              }));
                            }}
                            className="h-4 w-4 border-border bg-background text-accent focus:ring-accent"
                          />
                          <label htmlFor="shootingMethod-gimbal" className="text-sm cursor-pointer">
                            {t.gimbal}
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id="shootingMethod-monopod"
                            name="gimbalShoot"
                            checked={formData.gimbalShoot === false}
                            onChange={() => {
                              setFormData((prev) => ({
                                ...prev,
                                gimbalShoot: false,
                              }));
                            }}
                            className="h-4 w-4 border-border bg-background text-accent focus:ring-accent"
                          />
                          <label htmlFor="shootingMethod-monopod" className="text-sm cursor-pointer">
                            {t.monopod}
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* 영상 스타일 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        {"🎬 " + t.videoStyle} <span className="text-accent">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "시네마틱", label: t.cinematicStyle },
                          { value: "다큐멘터리", label: t.documentaryStyle },
                        ].map((style) => (
                          <div key={style.value} className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`customStyle-${style.value}`}
                              name="customStyle"
                              value={style.value}
                              checked={formData.customStyle.includes(style.value)}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customStyle: [style.value],
                                }));
                              }}
                              className="h-4 w-4 border-border bg-background text-accent focus:ring-accent"
                            />
                            <label htmlFor={`customStyle-${style.value}`} className="text-sm cursor-pointer">
                              {style.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 편집 스타일 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        {"✂️ " + t.editStyleLabel} <span className="text-accent">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "빠른 컷 편집", label: t.fastCut },
                          { value: "부드러운 전환", label: t.smoothTransition },
                          { value: "영화 같은 편집", label: t.movieLikeEdit },
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
                        {"🎵 " + t.musicGenre} <span className="text-accent">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "클래식", label: t.classic },
                          { value: "팝", label: t.pop },
                          { value: "발라드", label: t.ballad },
                          { value: "재즈", label: t.jazz },
                          { value: "인디", label: t.indie },
                          { value: "K-pop", label: t.kpop },
                          { value: "영화 OST", label: t.movieOst },
                          { value: "직접 선곡", label: t.ownChoice },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`customMusic-${option.value}`}
                              name="customMusic"
                              value={option.value}
                              checked={formData.customMusic.includes(option.value)}
                              onChange={(e) => {
                                setFormData((prev) => ({
                                  ...prev,
                                  customMusic: [option.value],
                                }));
                              }}
                              className="h-4 w-4 border-border bg-background text-accent focus:ring-accent"
                            />
                            <label htmlFor={`customMusic-${option.value}`} className="text-sm cursor-pointer">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 영상 진행형식 */}
                    <div>
                      <label className="mb-3 block text-sm font-medium">
                        {"⏱️ " + t.videoFormat} <span className="text-accent">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "하이라이트 (3-5분)", label: t.musicVideoFormat },
                          { value: "예능형 (10-15분)", label: t.varietyFormat },
                          { value: "다큐멘터리(20-30분)", label: t.documentaryFormat },
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
                      <label className="mb-3 block text-sm font-medium">{"✨ " + t.additionalEffects}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "타임랩스", label: t.slowMotion },
                          { value: "자막/나레이션", label: t.subtitleNarration },
                          { value: "인터뷰 삽입", label: t.interviewInsert },
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
                      <label className="mb-3 block text-sm font-medium">{"📱 " + t.additionalOptions}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { value: "드론 촬영", label: t.droneShoot },
                          { value: "수석 촬영자 추가", label: t.additionalDirector },
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

                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 6: 확인 페이지 */}
          {currentSection === 6 && showConfirmPage && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">{t.confirmTitle}</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t.confirmDesc}
                </p>
              </div>

              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="rounded-lg border border-border bg-muted p-6">
                  <h3 className="mb-4 font-semibold">{t.basicInfo}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.contractorLabel}</span>
                      <span className="font-medium">{formData.isBrideContractor ? formData.brideName : formData.groomName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.brideNameLabel}</span>
                      <span>{formData.brideName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.bridePhoneLabel}</span>
                      <span>{formData.bridePhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.groomNameLabel}</span>
                      <span>{formData.groomName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.groomPhoneLabel}</span>
                      <span>{formData.groomPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{t.productEmailLabel}</span>
                      <span>{formData.productEmail}</span>
                    </div>
                  </div>
                </div>

                {/* 상품 정보 */}
                {(formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") && (
                  <div className="rounded-lg border border-border bg-muted p-6">
                    <h3 className="mb-4 font-semibold">{t.productInfo}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.productTypeLabel}</span>
                        <span className="font-medium">{productTypeLabels[formData.productType] || formData.productType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.weddingDateConfirmLabel}</span>
                        <span>{formData.weddingDate ? (() => { const [y,m,d] = formData.weddingDate.split("-"); return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`; })() : ""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.weddingTimeConfirmLabel}</span>
                        <span>{formData.weddingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.venueNameLabel}</span>
                        <span>{formData.venueName}</span>
                      </div>
                      {formData.mainSnapCompany && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.mainSnapLabel}</span>
                          <span>{formData.mainSnapCompany}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 할인 정보 */}
                <div className="rounded-lg border border-border bg-muted p-6">
                  <h3 className="mb-4 font-semibold">{t.discountInfo}</h3>
                  <div className="space-y-2 text-sm">
                    {formData.discountNewYear && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.newYearDiscountLabel}</span>
                        <span className="text-green-600">-50,000원</span>
                      </div>
                    )}
                    {lemeGraphyDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.lemeGraphyDiscountLabel}</span>
                        <span className="text-green-600">-{lemeGraphyDiscount.toLocaleString()}원</span>
                      </div>
                    )}
                    {formData.discountCouple && formData.partnerCode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.coupleDiscountLabel}</span>
                        <span className="text-green-600">-10,000원</span>
                      </div>
                    )}
                    {formData.discountReview && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.reviewDiscountLabel}</span>
                        <span className="text-blue-500">{t.participating}</span>
                      </div>
                    )}
                    {formData.discountReviewBlog && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.reviewBlogDiscountLabel}</span>
                        <span className="text-blue-500">{t.participating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 특이사항 */}
                {formData.specialNotes && (
                  <div className="rounded-lg border border-border bg-muted p-6">
                    <h3 className="mb-4 font-semibold">{t.specialNotesSection}</h3>
                    <p className="text-sm whitespace-pre-wrap">{formData.specialNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6 border-t border-border">
            {currentSection > 1 && !showConfirmPage && (
              <button
                type="button"
                onClick={() => {
                  setCurrentSection(currentSection - 1);
                  setShowConfirmPage(false);
                }}
              className="flex-1 rounded-lg border border-border py-3 text-center font-medium transition-colors hover:bg-muted"
            >
                {t.prev}
              </button>
            )}
            {showConfirmPage && (
              <button
                type="button"
                onClick={() => {
                  setShowConfirmPage(false);
                  setCurrentSection(5);
                }}
                className="flex-1 rounded-lg border border-border py-3 text-center font-medium transition-colors hover:bg-muted"
              >
                {t.editInConfirm}
              </button>
            )}
            {currentSection < 5 ? (
            <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover"
              >
                {t.next}
              </button>
            ) : currentSection === 5 ? (
              <button
                type="button"
                onClick={() => {
                  setShowConfirmPage(true);
                  setCurrentSection(6);
                }}
                className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover"
              >
                {t.confirmButton}
              </button>
            ) : (
              <button
                type="button"
              disabled={isSubmitting}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // 확인 페이지에서만 제출 허용
                  if (currentSection === totalSections && showConfirmPage) {
                    handleSubmit(e as any);
                  }
                }}
              className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t.registerSubmitting : t.registerSubmit}
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
