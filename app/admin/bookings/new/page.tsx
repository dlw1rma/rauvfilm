'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  priceFormatted: string;
}

interface DiscountEvent {
  id: number;
  name: string;
  amount: number;
  amountFormatted: string;
  isOngoing: boolean;
}

type ProductType = '가성비형' | '기본형' | '시네마틱형' | '';

export default function NewBookingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<DiscountEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // 고객 정보
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    brideName: '',
    bridePhone: '',
    groomName: '',
    groomPhone: '',

    // 예식 정보
    weddingDate: '',
    weddingTime: '',
    weddingVenue: '',
    venueFloor: '',
    guestCount: '',

    // 상품 선택
    productType: '' as ProductType,
    productId: '',

    // 추가 촬영 옵션
    makeupShoot: false, // 메이크업샵 촬영 (20만원)
    paebaekShoot: false, // 폐백 촬영 (5만원)
    receptionShoot: false, // 피로연(2부) 촬영 (5만원)
    usbOption: false, // USB 추가 (2만원)
    seonwonpan: false, // 선원판

    // 할인사항
    discountNewYear: true, // 신년할인
    discountCouple: false, // 짝궁할인
    discountReview: false, // 촬영후기 할인
    discountReviewBlog: false, // 예약후기

    // 금액
    discountEventId: '',
    specialDiscount: '',
    specialDiscountReason: '',
    travelFee: '',

    // 기타
    referredBy: '',
    partnerCode: '',
    mainSnapCompany: '',
    adminNote: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, eventsRes] = await Promise.all([
          fetch('/api/admin/products'),
          fetch('/api/admin/events'),
        ]);
        const productsData = await productsRes.json();
        const eventsData = await eventsRes.json();
        setProducts(productsData.products || []);
        setEvents((eventsData.events || []).filter((e: DiscountEvent) => e.isOngoing));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (name === 'customerPhone' || name === 'bridePhone' || name === 'groomPhone') {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'productType') {
      // 상품 종류가 변경되면 해당 상품 ID도 찾아서 설정
      const matchedProduct = products.find((p) => p.name === value);
      // 가성비형 또는 1인1캠은 신년할인 적용 불가
      const isExcluded = value === '가성비형'
        || (matchedProduct?.name && (matchedProduct.name.includes('가성비') || matchedProduct.name.includes('1인1캠')));
      setFormData((prev) => ({
        ...prev,
        productType: value as ProductType,
        productId: matchedProduct ? matchedProduct.id.toString() : '',
        discountNewYear: isExcluded ? false : prev.discountNewYear,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 가격 계산
  const calculatePrices = () => {
    const selectedProduct = products.find((p) => p.id === parseInt(formData.productId));
    const selectedEvent = events.find((e) => e.id === parseInt(formData.discountEventId));

    // 상품 기본가 (선택된 상품 가격 사용, 직접 입력 제거)
    const productBasePrice = selectedProduct?.price || 0;
    const basePrice = productBasePrice;

    // 추가 옵션 개별 금액
    const makeupShootPrice = formData.makeupShoot ? 200000 : 0;
    const paebaekShootPrice = formData.paebaekShoot ? 50000 : 0;
    const receptionShootPrice = formData.receptionShoot ? 50000 : 0;
    const usbOptionPrice = formData.usbOption ? 20000 : 0;
    const optionsTotal = makeupShootPrice + paebaekShootPrice + receptionShootPrice + usbOptionPrice;

    // 출장비
    const travelFeeAmount = parseInt(formData.travelFee) || 0;

    // 할인
    const specialDiscountAmount = parseInt(formData.specialDiscount) || 0;
    const eventDiscountAmount = selectedEvent?.amount || 0;
    const eventDiscountName = selectedEvent?.name || '';

    // 26년 신년할인 (5만원) - 가성비형/1인1캠 제외
    const isExcludedFromNewYearDiscount = formData.productType === '가성비형'
      || (selectedProduct?.name && (selectedProduct.name.includes('가성비') || selectedProduct.name.includes('1인1캠')));
    const newYearDiscountAmount = (formData.discountNewYear && !isExcludedFromNewYearDiscount) ? 50000 : 0;

    // 짝궁할인 (체크되어 있으면 1만원)
    const coupleDiscountAmount = formData.discountCouple ? 10000 : 0;

    const totalBeforeDiscount = basePrice + optionsTotal + travelFeeAmount;
    const totalDiscount = eventDiscountAmount + specialDiscountAmount + coupleDiscountAmount + newYearDiscountAmount;
    const deposit = 100000;
    const finalBalance = Math.max(0, totalBeforeDiscount - deposit - totalDiscount);

    return {
      productBasePrice,
      basePrice,
      makeupShootPrice,
      paebaekShootPrice,
      receptionShootPrice,
      usbOptionPrice,
      optionsTotal,
      travelFeeAmount,
      totalBeforeDiscount,
      eventDiscountAmount,
      eventDiscountName,
      specialDiscountAmount,
      newYearDiscountAmount,
      coupleDiscountAmount,
      totalDiscount,
      deposit,
      finalBalance,
    };
  };

  const prices = calculatePrices();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // 필수 필드 검증
    if (!formData.customerName && !formData.brideName && !formData.groomName) {
      setError('계약자 성함 또는 신부/신랑 이름을 입력해주세요.');
      setSaving(false);
      return;
    }

    if (!formData.customerPhone && !formData.bridePhone && !formData.groomPhone) {
      setError('전화번호를 입력해주세요.');
      setSaving(false);
      return;
    }

    if (!formData.weddingDate) {
      setError('예식 날짜를 선택해주세요.');
      setSaving(false);
      return;
    }

    if (!formData.weddingVenue) {
      setError('예식장을 입력해주세요.');
      setSaving(false);
      return;
    }

    if (!formData.productId) {
      setError('상품을 선택해주세요.');
      setSaving(false);
      return;
    }

    try {
      // 추가 옵션 금액 계산
      let optionsTotal = 0;
      if (formData.makeupShoot) optionsTotal += 200000;
      if (formData.paebaekShoot) optionsTotal += 50000;
      if (formData.receptionShoot) optionsTotal += 50000;
      if (formData.usbOption) optionsTotal += 20000;

      // 할인 금액 계산
      const coupleDiscount = formData.discountCouple ? 10000 : 0;
      const newYearDiscount = (formData.discountNewYear && formData.productType !== '가성비형') ? 50000 : 0;

      // 상품 기본가 + 추가옵션 = listPrice로 전송
      const selectedProduct = products.find((p) => p.id === parseInt(formData.productId));
      const basePrice = selectedProduct?.price || 0;
      const totalListPrice = basePrice + optionsTotal;

      // 할인 사유 문자열 생성
      const discountReasons: string[] = [];
      if (formData.specialDiscountReason) discountReasons.push(formData.specialDiscountReason);
      if (newYearDiscount > 0) discountReasons.push('26년 신년할인 5만원');
      if (coupleDiscount > 0) discountReasons.push('짝궁할인 1만원');

      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName || formData.brideName || formData.groomName,
          customerPhone: (formData.customerPhone || formData.bridePhone || formData.groomPhone).replace(/-/g, ''),
          customerEmail: formData.customerEmail,
          weddingDate: formData.weddingDate,
          weddingVenue: formData.weddingVenue + (formData.venueFloor ? ` ${formData.venueFloor}` : ''),
          weddingTime: formData.weddingTime,
          productId: parseInt(formData.productId),
          customListPrice: totalListPrice, // 상품가 + 추가옵션
          discountEventId: formData.discountEventId ? parseInt(formData.discountEventId) : null,
          specialDiscount: (formData.specialDiscount ? parseInt(formData.specialDiscount) : 0) + coupleDiscount + newYearDiscount,
          specialDiscountReason: discountReasons.length > 0 ? discountReasons.join(', ') : '',
          travelFee: formData.travelFee ? parseInt(formData.travelFee) : 0,
          referredBy: formData.referredBy,
          adminNote: formData.adminNote,
          // 추가 정보
          brideName: formData.brideName,
          bridePhone: formData.bridePhone?.replace(/-/g, ''),
          groomName: formData.groomName,
          groomPhone: formData.groomPhone?.replace(/-/g, ''),
          makeupShoot: formData.makeupShoot,
          paebaekShoot: formData.paebaekShoot,
          receptionShoot: formData.receptionShoot,
          usbOption: formData.usbOption,
          seonwonpan: formData.seonwonpan,
          discountNewYear: formData.discountNewYear,
          discountCouple: formData.discountCouple,
          discountReview: formData.discountReview,
          discountReviewBlog: formData.discountReviewBlog,
          mainSnapCompany: formData.mainSnapCompany,
          partnerCode: formData.partnerCode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '예약 생성에 실패했습니다.');
        return;
      }

      router.push(`/admin/bookings/${data.booking.id}`);
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings" className="text-muted-foreground hover:text-foreground">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">새 예약</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 고객 정보 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">고객 정보</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  신부 이름 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  name="brideName"
                  value={formData.brideName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="신부 이름"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  신부 전화번호 <span className="text-accent">*</span>
                </label>
                <input
                  type="tel"
                  name="bridePhone"
                  value={formData.bridePhone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">신랑 이름</label>
                <input
                  type="text"
                  name="groomName"
                  value={formData.groomName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="신랑 이름"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">신랑 전화번호</label>
                <input
                  type="tel"
                  name="groomPhone"
                  value={formData.groomPhone}
                  onChange={handleChange}
                  placeholder="010-1234-5678"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">이메일</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="example@email.com"
              />
            </div>
          </div>
        </div>

        {/* 예식 정보 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">예식 정보</h2>
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  예식 날짜 <span className="text-accent">*</span>
                </label>
                <input
                  type="date"
                  name="weddingDate"
                  value={formData.weddingDate}
                  onChange={handleChange}
                  required
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    if ((e.currentTarget as HTMLInputElement).showPicker) {
                      (e.currentTarget as HTMLInputElement).showPicker();
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  예식 시간 <span className="text-accent">*</span>
                </label>
                <input
                  type="time"
                  name="weddingTime"
                  value={formData.weddingTime}
                  onChange={handleChange}
                  required
                  onKeyDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    if ((e.currentTarget as HTMLInputElement).showPicker) {
                      (e.currentTarget as HTMLInputElement).showPicker();
                    }
                  }}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  style={{ colorScheme: 'light' }}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  예식장 <span className="text-accent">*</span>
                </label>
                <input
                  type="text"
                  name="weddingVenue"
                  value={formData.weddingVenue}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예식장명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">층/홀이름</label>
                <input
                  type="text"
                  name="venueFloor"
                  value={formData.venueFloor}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예: 2층 그랜드홀"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">초대인원</label>
                <input
                  type="number"
                  name="guestCount"
                  value={formData.guestCount}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예: 150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">메인스냅 업체</label>
                <input
                  type="text"
                  name="mainSnapCompany"
                  value={formData.mainSnapCompany}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="예: 르메그라피"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 상품 선택 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">상품 선택</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                상품 종류 <span className="text-accent">*</span>
              </label>
              <select
                name="productType"
                value={formData.productType}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">상품을 선택해주세요</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name} - {p.priceFormatted}
                  </option>
                ))}
              </select>
              {formData.productType && (
                <div className="mt-3 p-3 bg-accent/5 rounded-lg border border-accent/20">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{formData.productType}</span>
                    <span className="text-lg font-bold text-accent">
                      {products.find((p) => p.name === formData.productType)?.priceFormatted || '-'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 추가 촬영 옵션 */}
            {formData.productType && (
              <div className="space-y-3 pt-4 border-t border-border">
                <p className="text-sm font-medium">추가 촬영 옵션</p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="makeupShoot"
                      checked={formData.makeupShoot}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <span className="text-sm">메이크업샵 촬영 (20만원)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="paebaekShoot"
                      checked={formData.paebaekShoot}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <span className="text-sm">폐백 촬영 (5만원)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="receptionShoot"
                      checked={formData.receptionShoot}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <span className="text-sm">피로연(2부 예식) 촬영 (5만원)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="usbOption"
                      checked={formData.usbOption}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <span className="text-sm">USB 추가 (2만원)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="seonwonpan"
                      checked={formData.seonwonpan}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
                    />
                    <span className="text-sm">선원판</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 할인사항 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">할인사항</h2>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="discountNewYear"
                checked={formData.discountNewYear}
                onChange={handleChange}
                disabled={formData.productType === '가성비형'}
                className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent disabled:opacity-50"
              />
              <span className={`text-sm ${formData.productType === '가성비형' ? 'text-muted-foreground' : ''}`}>
                2026년 신년할인 (5만원)
                {formData.productType === '가성비형' && <span className="ml-2 text-xs">(가성비형은 적용 불가)</span>}
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="discountCouple"
                checked={formData.discountCouple}
                onChange={handleChange}
                className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
              />
              <span className="text-sm">짝궁할인 (1만원)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="discountReview"
                checked={formData.discountReview}
                onChange={handleChange}
                className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
              />
              <span className="text-sm">촬영후기 할인 (2만원 페이백)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="discountReviewBlog"
                checked={formData.discountReviewBlog}
                onChange={handleChange}
                className="h-5 w-5 rounded border-border bg-background text-accent focus:ring-accent"
              />
              <span className="text-sm">예약후기 (2만원 + SNS영상 + 원본영상)</span>
            </label>

            <div className="pt-4 border-t border-border space-y-4">
              {/* 진행중인 할인 이벤트 목록 */}
              {events.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">할인 이벤트 선택</label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-accent/50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="discountEventId"
                        value=""
                        checked={!formData.discountEventId}
                        onChange={handleChange}
                        className="h-4 w-4 text-accent focus:ring-accent"
                      />
                      <span className="text-sm">선택 안함</span>
                    </label>
                    {events.map((e) => (
                      <label
                        key={e.id}
                        className={`flex items-center justify-between gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.discountEventId === e.id.toString()
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-accent/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="discountEventId"
                            value={e.id}
                            checked={formData.discountEventId === e.id.toString()}
                            onChange={handleChange}
                            className="h-4 w-4 text-accent focus:ring-accent"
                          />
                          <span className="text-sm font-medium">{e.name}</span>
                        </div>
                        <span className="text-sm font-bold text-green-600">-{e.amountFormatted}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">특별 할인 금액</label>
                  <input
                    type="number"
                    name="specialDiscount"
                    value={formData.specialDiscount}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">체험단, 협찬 등 특별 할인</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">특별 할인 사유</label>
                  <input
                    type="text"
                    name="specialDiscountReason"
                    value={formData.specialDiscountReason}
                    onChange={handleChange}
                    placeholder="협찬, 재촬영 할인 등"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">추천인 짝꿍 코드</label>
                <input
                  type="text"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleChange}
                  placeholder="예: 260126 홍길동"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 금액 설정 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">금액 설정</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">출장비</label>
              <input
                type="number"
                name="travelFee"
                value={formData.travelFee}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>
        </div>

        {/* 가격 계산 미리보기 */}
        {formData.productType && (
          <div className="bg-muted/50 rounded-xl p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
              </svg>
              금액 계산
            </h3>
            <div className="space-y-2 text-sm">
              {/* 상품가 */}
              <div className="flex justify-between font-medium">
                <span>상품가 ({formData.productType})</span>
                <span>{prices.productBasePrice.toLocaleString()}원</span>
              </div>

              {/* 추가 옵션 개별 표시 */}
              {prices.makeupShootPrice > 0 && (
                <div className="flex justify-between ml-4">
                  <span className="text-muted-foreground">+ 메이크업샵 촬영</span>
                  <span>+{prices.makeupShootPrice.toLocaleString()}원</span>
                </div>
              )}
              {prices.paebaekShootPrice > 0 && (
                <div className="flex justify-between ml-4">
                  <span className="text-muted-foreground">+ 폐백 촬영</span>
                  <span>+{prices.paebaekShootPrice.toLocaleString()}원</span>
                </div>
              )}
              {prices.receptionShootPrice > 0 && (
                <div className="flex justify-between ml-4">
                  <span className="text-muted-foreground">+ 피로연(2부) 촬영</span>
                  <span>+{prices.receptionShootPrice.toLocaleString()}원</span>
                </div>
              )}
              {prices.usbOptionPrice > 0 && (
                <div className="flex justify-between ml-4">
                  <span className="text-muted-foreground">+ USB 추가</span>
                  <span>+{prices.usbOptionPrice.toLocaleString()}원</span>
                </div>
              )}

              {/* 출장비 */}
              {prices.travelFeeAmount > 0 && (
                <div className="flex justify-between ml-4">
                  <span className="text-muted-foreground">+ 출장비</span>
                  <span>+{prices.travelFeeAmount.toLocaleString()}원</span>
                </div>
              )}

              {/* 소계 */}
              <div className="flex justify-between border-t border-border pt-3 font-medium">
                <span>소계</span>
                <span>{prices.totalBeforeDiscount.toLocaleString()}원</span>
              </div>

              {/* 할인 항목들 */}
              {prices.newYearDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600 ml-4">
                  <span>- 2026년 신년할인</span>
                  <span>-{prices.newYearDiscountAmount.toLocaleString()}원</span>
                </div>
              )}
              {prices.eventDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600 ml-4">
                  <span>- {prices.eventDiscountName}</span>
                  <span>-{prices.eventDiscountAmount.toLocaleString()}원</span>
                </div>
              )}
              {prices.coupleDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600 ml-4">
                  <span>- 짝궁할인</span>
                  <span>-{prices.coupleDiscountAmount.toLocaleString()}원</span>
                </div>
              )}
              {prices.specialDiscountAmount > 0 && (
                <div className="flex justify-between text-green-600 ml-4">
                  <span>- 특별 할인</span>
                  <span>-{prices.specialDiscountAmount.toLocaleString()}원</span>
                </div>
              )}

              {/* 예약금 */}
              <div className="flex justify-between ml-4">
                <span className="text-muted-foreground">- 예약금</span>
                <span>-{prices.deposit.toLocaleString()}원</span>
              </div>

              {/* 최종 잔금 */}
              <div className="flex justify-between border-t border-border pt-3 font-bold text-lg">
                <span>최종 잔금</span>
                <span className="text-accent">{prices.finalBalance.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        )}

        {/* 관리자 메모 */}
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">관리자 메모</h2>
          <textarea
            name="adminNote"
            value={formData.adminNote}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            placeholder="메모를 입력하세요..."
          />
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 text-red-500 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 rounded-lg bg-accent text-white font-medium text-lg hover:bg-accent/90 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '예약 생성'}
        </button>
      </form>
    </div>
  );
}
