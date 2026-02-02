'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface TravelFeeRule {
  id: number;
  branch: string;
  region: string;
  district: string | null;
  fee: number;
  isActive: boolean;
}

const BRANCHES = ['서울점', '청주점'] as const;

export default function TravelFeesPage() {
  const [rules, setRules] = useState<TravelFeeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState<string>('서울점');
  const [showForm, setShowForm] = useState(false);
  const [editingRule, setEditingRule] = useState<TravelFeeRule | null>(null);
  const [formData, setFormData] = useState({ region: '', district: '', fee: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRules = async () => {
    try {
      const res = await fetch(`/api/admin/travel-fees?branch=${encodeURIComponent(activeBranch)}`);
      if (res.ok) {
        const data = await res.json();
        setRules(data.rules || []);
      }
    } catch {
      setMessage({ type: 'error', text: '데이터를 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRules();
  }, [activeBranch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      if (editingRule) {
        const res = await fetch('/api/admin/travel-fees', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingRule.id,
            fee: parseInt(formData.fee, 10),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: 'error', text: data.error });
          return;
        }
        setMessage({ type: 'success', text: '수정되었습니다.' });
      } else {
        const res = await fetch('/api/admin/travel-fees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branch: activeBranch,
            region: formData.region.trim(),
            district: formData.district.trim() || null,
            fee: parseInt(formData.fee, 10),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setMessage({ type: 'error', text: data.error });
          return;
        }
        setMessage({ type: 'success', text: '등록되었습니다.' });
      }

      setFormData({ region: '', district: '', fee: '' });
      setShowForm(false);
      setEditingRule(null);
      fetchRules();
    } catch {
      setMessage({ type: 'error', text: '처리 중 오류가 발생했습니다.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/travel-fees?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessage({ type: 'success', text: '삭제되었습니다.' });
        fetchRules();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error });
      }
    } catch {
      setMessage({ type: 'error', text: '삭제 중 오류가 발생했습니다.' });
    }
  };

  const handleEdit = (rule: TravelFeeRule) => {
    setEditingRule(rule);
    setFormData({ region: rule.region, district: rule.district || '', fee: String(rule.fee) });
    setShowForm(true);
  };

  const formatKRW = (amount: number) => amount.toLocaleString('ko-KR') + '원';

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            관리자 대시보드
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">출장비 관리</h1>
          <button
            onClick={() => {
              setEditingRule(null);
              setFormData({ region: '', district: '', fee: '' });
              setShowForm(!showForm);
            }}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            {showForm ? '취소' : '+ 추가'}
          </button>
        </div>

        {/* 지점 탭 */}
        <div className="flex border-b border-border mb-6">
          {BRANCHES.map((branch) => (
            <button
              key={branch}
              onClick={() => { setActiveBranch(branch); setMessage(null); }}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                activeBranch === branch
                  ? 'border-b-2 border-accent text-accent'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {branch}
            </button>
          ))}
        </div>

        {/* 메시지 */}
        {message && (
          <div className={`p-4 rounded-lg text-sm mb-4 ${
            message.type === 'success'
              ? 'bg-green-500/10 text-green-600 border border-green-500/20'
              : 'bg-red-500/10 text-red-500 border border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}

        {/* 등록/수정 폼 */}
        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-background p-6 mb-6 space-y-4">
            <h3 className="font-semibold">{editingRule ? '출장비 기준 수정' : '출장비 기준 추가'}</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-sm font-medium mb-1">시/도 <span className="text-accent">*</span></label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  placeholder="예: 서울특별시"
                  disabled={!!editingRule}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">구/군 (선택)</label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
                  placeholder="예: 강남구 (비우면 시/도 전체)"
                  disabled={!!editingRule}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">출장비 (원) <span className="text-accent">*</span></label>
                <input
                  type="number"
                  value={formData.fee}
                  onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                  placeholder="예: 50000"
                  required
                  min={0}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {submitting ? '처리 중...' : editingRule ? '수정' : '등록'}
            </button>
          </form>
        )}

        {/* 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-muted border-t-accent rounded-full animate-spin" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>등록된 출장비 기준이 없습니다.</p>
            <p className="text-sm mt-1">위의 &quot;+ 추가&quot; 버튼으로 기준을 등록하세요.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted">
                  <th className="text-left px-4 py-3 font-medium">시/도</th>
                  <th className="text-left px-4 py-3 font-medium">구/군</th>
                  <th className="text-right px-4 py-3 font-medium">출장비</th>
                  <th className="text-center px-4 py-3 font-medium">상태</th>
                  <th className="text-center px-4 py-3 font-medium">관리</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-t border-border hover:bg-muted/50">
                    <td className="px-4 py-3">{rule.region}</td>
                    <td className="px-4 py-3">{rule.district || '(전체)'}</td>
                    <td className="px-4 py-3 text-right font-medium">{formatKRW(rule.fee)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs ${rule.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                        {rule.isActive ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="px-2 py-1 text-xs rounded bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="px-2 py-1 text-xs rounded bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">출장비 적용 기준</p>
          <ul className="space-y-1">
            <li>- 예약 시 예식장 주소의 시/도, 구/군으로 자동 매칭합니다.</li>
            <li>- 구/군 단위 기준이 우선 적용되며, 없으면 시/도 단위로 적용됩니다.</li>
            <li>- 미등록 지역은 출장비 0원으로 처리됩니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
