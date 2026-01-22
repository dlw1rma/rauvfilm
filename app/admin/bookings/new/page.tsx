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

export default function NewBookingPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [events, setEvents] = useState<DiscountEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    weddingDate: '',
    weddingVenue: '',
    weddingTime: '',
    productId: '',
    discountEventId: '',
    referredBy: '',
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
    const { name, value } = e.target;
    if (name === 'customerPhone') {
      setFormData((prev) => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          productId: parseInt(formData.productId),
          discountEventId: formData.discountEventId ? parseInt(formData.discountEventId) : null,
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/bookings" className="text-muted-foreground hover:text-foreground">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">새 예약</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-background rounded-xl border border-border p-6 space-y-6">
        {/* 고객 정보 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">고객 정보</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">계약자 성함 *</label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">전화번호 *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleChange}
                placeholder="010-1234-5678"
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">이메일</label>
              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
          </div>
        </div>

        {/* 예식 정보 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">예식 정보</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">예식일 *</label>
              <input
                type="date"
                name="weddingDate"
                value={formData.weddingDate}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">예식 시간</label>
              <input
                type="text"
                name="weddingTime"
                value={formData.weddingTime}
                onChange={handleChange}
                placeholder="오후 2시"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">예식장 *</label>
              <input
                type="text"
                name="weddingVenue"
                value={formData.weddingVenue}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
          </div>
        </div>

        {/* 상품 및 할인 */}
        <div>
          <h2 className="text-lg font-semibold mb-4">상품 및 할인</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">상품 *</label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">상품 선택</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.priceFormatted})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">할인 이벤트</label>
              <select
                name="discountEventId"
                value={formData.discountEventId}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              >
                <option value="">선택 안함</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} (-{e.amountFormatted})
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">추천인 짝꿍 코드</label>
              <input
                type="text"
                name="referredBy"
                value={formData.referredBy}
                onChange={handleChange}
                placeholder="250122홍길동"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background"
              />
            </div>
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium mb-2">관리자 메모</label>
          <textarea
            name="adminNote"
            value={formData.adminNote}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background resize-none"
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
          className="w-full py-3 rounded-lg bg-accent text-white font-medium hover:bg-accent/90 disabled:opacity-50"
        >
          {saving ? '저장 중...' : '예약 생성'}
        </button>
      </form>
    </div>
  );
}
