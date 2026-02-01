"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      
      // 상품 종류가 가성비형으로 변경되면 신년할인 해제
      if (name === "productType" && value === "가성비형") {
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
          setError("짝궁코드가 존재하지 않습니다.");
          setMissingFields(["짝궁코드가 존재하지 않습니다."]);
          const element = document.getElementById("partnerCode");
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          return;
        }
        const data = await res.json();
        if (!data.valid) {
          setError("짝궁코드가 존재하지 않습니다.");
          setMissingFields(["짝궁코드가 존재하지 않습니다."]);
          const element = document.getElementById("partnerCode");
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          return;
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          setError("요청 시간이 초과되었습니다. 다시 시도해주세요.");
          setMissingFields(["요청 시간이 초과되었습니다."]);
        } else {
          console.error('짝궁코드 검증 오류:', error);
          setError("짝궁코드 검증 중 오류가 발생했습니다.");
          setMissingFields(["짝궁코드 검증 중 오류가 발생했습니다."]);
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
          missing.push("개인정보 활용 동의");
          if (!firstErrorId) firstErrorId = "privacyAgreed";
        }
      } else if (currentSection === 2) {
        if (!formData.brideName) {
          missing.push("신부님 성함");
          if (!firstErrorId) firstErrorId = "brideName";
        }
        if (!formData.overseasResident && !formData.bridePhone) {
          missing.push("신부님 전화번호");
          if (!firstErrorId) firstErrorId = "bridePhone";
        }
        if (!formData.groomName) {
          missing.push("신랑님 성함");
          if (!firstErrorId) firstErrorId = "groomName";
        }
        if (!formData.overseasResident && !formData.groomPhone) {
          missing.push("신랑님 전화번호");
          if (!firstErrorId) firstErrorId = "groomPhone";
        }
        if (!formData.isBrideContractor && !formData.isGroomContractor) {
          missing.push("계약자 선택 (신부님 또는 신랑님)");
          if (!firstErrorId) firstErrorId = "isBrideContractor";
        }
        if (!formData.overseasResident && !formData.receiptPhone) {
          missing.push("현금 영수증 받으실 전화번호");
          if (!firstErrorId) firstErrorId = "receiptPhone";
        }
        if (!formData.depositName) {
          missing.push("예약금 입금자명");
          if (!firstErrorId) firstErrorId = "depositName";
        }
        if (!formData.productEmail) {
          missing.push("상품 받으실 E-mail 주소");
          if (!firstErrorId) firstErrorId = "productEmail";
        }
        if (!formData.foundPath) {
          missing.push("라우브필름 알게된 경로");
          if (!firstErrorId) firstErrorId = "foundPath";
        }
        if (!formData.termsAgreed) {
          missing.push("홈페이지 규정 안내 및 약관동의서 읽음 및 동의");
          if (!firstErrorId) firstErrorId = "termsAgreed";
        }
        if (!formData.faqRead) {
          missing.push("홈페이지 FAQ 읽음 및 숙지 여부");
          if (!firstErrorId) firstErrorId = "faqRead";
        }
      } else if (currentSection === 3) {
        // 섹션 3: 상품 종류 필수 체크
        if (!formData.productType) {
          missing.push("상품 종류");
          if (!firstErrorId) firstErrorId = "productType";
        }
        // 본식 영상 예약 필수 항목 체크
        if (formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") {
          if (!formData.weddingDate) {
            missing.push("예식 날짜");
            if (!firstErrorId) firstErrorId = "weddingDate";
          }
          if (!formData.weddingTime) {
            missing.push("예식 시간");
            if (!firstErrorId) firstErrorId = "weddingTime";
          }
          if (!formData.venueName) {
            missing.push("장소명");
            if (!firstErrorId) firstErrorId = "venueName";
          }
          if (formData.usbOption && !formData.deliveryAddress) {
            missing.push("(USB)상품받으실 거주지 주소");
            if (!firstErrorId) firstErrorId = "deliveryAddress";
          }
        }
      } else if (currentSection === 4) {
        // 짝궁할인 체크 시 짝궁코드 필수 및 DB 검증
        if (formData.discountCouple) {
          if (!formData.partnerCode) {
            missing.push("짝궁코드");
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
          setError("짝궁할인을 선택하셨습니다. 다음 필수 항목을 입력해주세요:");
        } else {
          setError("다음 필수 항목을 입력해주세요:");
        }
        setTimeout(() => scrollToFirstError(firstErrorId), 100);
      } else {
        setError("필수 항목을 모두 입력해주세요.");
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

    if (!formData.overseasResident && !formData.bridePhone) {
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

    if (!formData.overseasResident && !formData.groomPhone) {
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

    if (!formData.overseasResident && !formData.receiptPhone) {
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

    // 짝궁할인 체크 시 짝궁코드 필수 검증
    if (formData.discountCouple && !formData.partnerCode) {
      setError("짝궁할인을 선택하셨습니다. 짝궁코드를 검색하여 선택해주세요.");
      setCurrentSection(4);
      setTimeout(() => scrollToFirstError("partnerCode"), 100);
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
          password: formData.overseasResident ? formData.productEmail : formData.password, // 해외거주 시 비밀번호=이메일
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
        throw new Error(data.error || "등록에 실패했습니다.");
      }

      clearDraftFromStorage();
      setCreatedReservationId(data.id);
      setShowDepositModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
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
              <h3 className="text-xl font-bold mb-1">예약 등록 완료</h3>
              <p className="text-sm text-muted-foreground">예약금 입금 후 예약이 확정됩니다.</p>
            </div>

            <div className="rounded-lg bg-muted p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">은행</span>
                <span className="font-medium">국민은행</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">계좌번호</span>
                <span className="font-medium font-mono">037437-04-012104</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">예금주</span>
                <span className="font-medium">손세한</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">예약금</span>
                <span className="font-bold text-accent">100,000원</span>
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
              {depositCopied ? "복사됨!" : "계좌번호 복사"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowDepositModal(false);
                router.push(`/reservation/complete${createdReservationId ? `?id=${createdReservationId}` : ""}`);
              }}
              className="w-full py-3 px-4 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* 초안 이어서 작성 모달 */}
      {showDraftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-background border border-border p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">작성 중이던 예약글이 있습니다</h3>
            <p className="text-sm text-muted-foreground mb-6">
              이어서 작성하시겠습니까?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleDraftRestore}
                className="flex-1 rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
              >
                이어서 작성
              </button>
              <button
                type="button"
                onClick={handleDraftDiscard}
                className="flex-1 rounded-lg border border-border py-3 text-sm font-medium hover:bg-muted transition-colors"
              >
                새로 작성
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
              <h3 className="text-lg font-semibold">짝궁코드 검색</h3>
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
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={partnerCodeSearch}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPartnerCodeSearch(value);
                    if (value.length >= 2) {
                      searchPartnerCode(value);
                    } else {
                      setPartnerCodeResults([]);
                    }
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="짝궁코드를 입력하세요"
                  autoFocus
                />
                {isSearchingPartnerCode && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-accent" />
                  </div>
                )}
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
                ) : partnerCodeSearch.length >= 2 && !isSearchingPartnerCode ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    검색 결과가 없습니다.
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    2글자 이상 입력하면 검색됩니다.
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
                    신부님 전화번호 {!formData.overseasResident && <span className="text-accent">*</span>}
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
                    신랑님 전화번호 {!formData.overseasResident && <span className="text-accent">*</span>}
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
                  현금 영수증 받으실 전화번호 {!formData.overseasResident && <span className="text-accent">*</span>}
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
                      해외 거주 (한국 번호 없음)
                    </label>
                    <p className="text-xs text-muted-foreground mt-1">
                      체크 시 예약글·마이페이지 비밀번호가 이메일 주소로 저장됩니다. 열람 시 위 이메일을 입력해주세요. 문자(SMS)는 발송되지 않습니다.
                    </p>
                  </div>
                </div>
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
                    홈페이지 규정 안내 및 약관동의서 읽음 및 동의 <span className="text-accent">*</span>
                  </label>
                  <Link
                    href="/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    약관 보기
                  </Link>
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
                    홈페이지 FAQ 읽음 및 숙지 여부 <span className="text-accent">*</span>
                  </label>
                  <Link
                    href="/faq"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center gap-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                  >
                    FAQ 보기
                  </Link>
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
                        placeholder="예식장명을 입력하세요"
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
                      <label htmlFor="usbOption" className="text-sm font-medium">
                        USB 추가 (개당 2만원)
                      </label>
                    </div>
                    {formData.usbOption && (
                      <div className="ml-8">
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
                    <label className="mb-2 block text-sm font-medium">
                      본식 영상 주 재생매체
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
            {(() => {
              const isLemeGraphyDiscount = (formData.mainSnapCompany || "").toLowerCase().includes("르메그라피") || (formData.mainSnapCompany || "").toLowerCase().includes("leme");
              const lemeProduct = formData.productType === "기본형" || formData.productType === "시네마틱형";
              const noNewYear = formData.productType === "가성비형" || (isLemeGraphyDiscount && lemeProduct);
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
                    2026년 신년할인 (5만원)
                    {formData.productType === "가성비형" && <span className="ml-2 text-xs">(가성비형은 신년할인 적용 불가)</span>}
                    {isLemeGraphyDiscount && lemeProduct && (
                      <span className="ml-2 text-xs">(르메그라피 제휴 할인 시 적용 불가)</span>
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
                          메인스냅이 르메그라피이고 기본형/시네마틱형이면 르메그라피 제휴 할인(15만원)이 적용되며, 이 경우 2026년 신년할인은 적용되지 않습니다.
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
                  {formData.discountCouple && (
                    <div className="mt-4">
                      <label className="mb-2 block text-sm font-medium">
                        짝궁 코드 <span className="text-accent">*</span>
                      </label>
                      <p className="mb-2 text-xs text-muted-foreground">
                        ⚠ 짝궁코드는 한번 기입 시 수정이 불가합니다. 신중하게 입력해주세요.
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
                          <span className="text-muted-foreground">짝궁 코드를 검색하여 선택해주세요</span>
                        )}
                      </button>
                      {!formData.partnerCode && (
                        <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">⚠ 짝궁코드를 검색하여 선택해주세요.</p>
                      )}
                    </div>
                  )}
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
                        ? "블로그와 카페 예약후기 (1건 작성 시 원본 전달)"
                        : "블로그와 카페 예약후기 (총 2만원 +SNS영상 + 원본영상)"}
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
                <h2 className="text-xl font-semibold">5. 특이사항</h2>
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
              )}

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

              {/* 짝궁코드 닉네임 */}
              <div>
                <label htmlFor="referralNickname" className="mb-2 block text-sm font-medium">
                  짝궁코드 닉네임 (선택)
                </label>
                <p className="mb-2 text-xs text-muted-foreground">
                  예약 확정 시 생성되는 짝궁코드에 계약자 이름 대신 사용할 닉네임을 입력하세요. 비워두면 계약자 이름으로 생성됩니다.
                </p>
                <input
                  type="text"
                  id="referralNickname"
                  name="referralNickname"
                  value={formData.referralNickname}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예: 라우브신부"
                  maxLength={20}
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
                    🎬 커스텀 촬영 요청 (대표 또는 수석실장 촬영만 해당)
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

          {/* Section 6: 확인 페이지 */}
          {currentSection === 6 && showConfirmPage && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h2 className="text-xl font-semibold">6. 작성 내용 확인</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  아래 내용을 정확히 확인하신 후 등록해주세요.
                </p>
              </div>

              <div className="space-y-6">
                {/* 기본 정보 */}
                <div className="rounded-lg border border-border bg-muted p-6">
                  <h3 className="mb-4 font-semibold">기본 정보</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">계약자:</span>
                      <span className="font-medium">{formData.isBrideContractor ? formData.brideName : formData.groomName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">신부님 성함:</span>
                      <span>{formData.brideName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">신부님 전화번호:</span>
                      <span>{formData.bridePhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">신랑님 성함:</span>
                      <span>{formData.groomName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">신랑님 전화번호:</span>
                      <span>{formData.groomPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">상품 받으실 E-mail:</span>
                      <span>{formData.productEmail}</span>
                    </div>
                  </div>
                </div>

                {/* 상품 정보 */}
                {(formData.productType === "가성비형" || formData.productType === "기본형" || formData.productType === "시네마틱형") && (
                  <div className="rounded-lg border border-border bg-muted p-6">
                    <h3 className="mb-4 font-semibold">상품 정보</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">상품 종류:</span>
                        <span className="font-medium">{formData.productType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">예식 날짜:</span>
                        <span>{formData.weddingDate ? (() => { const [y,m,d] = formData.weddingDate.split("-"); return `${y}년 ${parseInt(m)}월 ${parseInt(d)}일`; })() : ""}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">예식 시간:</span>
                        <span>{formData.weddingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">장소명:</span>
                        <span>{formData.venueName}</span>
                      </div>
                      {formData.mainSnapCompany && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">메인스냅 업체:</span>
                          <span>{formData.mainSnapCompany}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 할인 정보 */}
                <div className="rounded-lg border border-border bg-muted p-6">
                  <h3 className="mb-4 font-semibold">할인 정보</h3>
                  <div className="space-y-2 text-sm">
                    {formData.discountNewYear && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">2026년 신년할인:</span>
                        <span className="text-green-600">-50,000원</span>
                      </div>
                    )}
                    {lemeGraphyDiscount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">르메그라피 제휴 할인:</span>
                        <span className="text-green-600">-{lemeGraphyDiscount.toLocaleString()}원</span>
                      </div>
                    )}
                    {formData.discountCouple && formData.partnerCode && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">짝궁할인:</span>
                        <span className="text-green-600">-10,000원</span>
                      </div>
                    )}
                    {formData.discountReview && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">블로그와 카페 촬영후기:</span>
                        <span className="text-blue-500">참여</span>
                      </div>
                    )}
                    {formData.discountReviewBlog && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">블로그와 카페 예약후기:</span>
                        <span className="text-blue-500">참여</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 특이사항 */}
                {formData.specialNotes && (
                  <div className="rounded-lg border border-border bg-muted p-6">
                    <h3 className="mb-4 font-semibold">특이사항</h3>
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
                이전
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
                수정하기
              </button>
            )}
            {currentSection < 5 ? (
            <button
                type="button"
                onClick={handleNext}
                className="flex-1 rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover"
              >
                다음
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
                확인하기
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
              {isSubmitting ? "등록 중..." : "등록하기"}
            </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
