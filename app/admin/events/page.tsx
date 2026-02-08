'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/formatDate';
import DateInput from '@/components/ui/DateInput';

interface DiscountEvent {
  id: number;
  name: string;
  amount: number;
  amountFormatted: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isOngoing: boolean;
  isUpcoming: boolean;
  isExpired: boolean;
  bookingCount: number;
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<DiscountEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    startDate: '',
    endDate: '',
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events?includeInactive=true');
      const data = await res.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setFormData({ name: '', amount: '', startDate: '', endDate: '' });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingId ? `/api/admin/events/${editingId}` : '/api/admin/events';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        resetForm();
        fetchEvents();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: DiscountEvent) => {
    setFormData({
      name: event.name,
      amount: event.amount.toString(),
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate.split('T')[0],
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('이벤트를 삭제하시겠습니까?')) return;
    try {
      await fetch(`/api/admin/events/${id}`, { method: 'DELETE' });
      fetchEvents();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">할인 이벤트 관리</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg bg-accent text-white font-medium hover:bg-accent/90"
        >
          새 이벤트
        </button>
      </div>

      {/* 이벤트 폼 */}
      {showForm && (
        <div className="bg-background rounded-xl border border-border p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? '이벤트 수정' : '새 이벤트'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">이벤트명</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="2025 신년 할인"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">할인 금액 (원)</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="50000"
                  required
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">시작일</label>
                <DateInput
                  name="startDate"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                  className="px-4 py-2 rounded-lg border border-border bg-background cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">종료일</label>
                <DateInput
                  name="endDate"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                  className="px-4 py-2 rounded-lg border border-border bg-background cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 disabled:opacity-50"
              >
                {saving ? '저장 중...' : editingId ? '수정' : '생성'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-lg bg-muted"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 이벤트 목록 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          이벤트가 없습니다.
        </div>
      ) : (
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-background rounded-xl border p-6 ${
                event.isOngoing ? 'border-accent' : 'border-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{event.name}</h3>
                    {event.isOngoing && (
                      <span className="px-2 py-0.5 rounded text-xs bg-accent/10 text-accent">진행중</span>
                    )}
                    {event.isUpcoming && (
                      <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-blue-600">예정</span>
                    )}
                    {event.isExpired && (
                      <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">종료</span>
                    )}
                    {!event.isActive && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-500">비활성</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-accent mb-2">-{event.amountFormatted}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.startDate)} ~ {formatDate(event.endDate)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    적용 예약: {event.bookingCount}건
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleToggleActive(event.id, event.isActive)}
                    className="px-3 py-1.5 rounded-lg bg-muted text-sm hover:bg-muted/80"
                  >
                    {event.isActive ? '비활성화' : '활성화'}
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="px-3 py-1.5 rounded-lg border border-red-500 text-red-500 text-sm hover:bg-red-500/10"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
