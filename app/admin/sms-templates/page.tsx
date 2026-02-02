'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface KakaoTemplate {
  templateId: string;
  name: string;
  content?: string;
  status?: string;
  channelId?: string;
  channelGroupId?: string;
}

interface TemplateConfig {
  contract?: { templateId: string; channelId: string };
  video?: { templateId: string; channelId: string };
  post_wedding?: { templateId: string; channelId: string };
}

export default function SmsTemplatesPage() {
  const [templates, setTemplates] = useState<KakaoTemplate[]>([]);
  const [config, setConfig] = useState<TemplateConfig>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [assigning, setAssigning] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [templatesRes, configRes] = await Promise.all([
        fetch('/api/admin/sms-templates'),
        fetch('/api/admin/sms-templates/config'),
      ]);

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates || []);
      } else {
        const data = await templatesRes.json();
        setMessage({ type: 'error', text: data.error || '템플릿 목록 조회 실패' });
      }

      if (configRes.ok) {
        const data = await configRes.json();
        setConfig(data.config || {});
      }
    } catch {
      setMessage({ type: 'error', text: '데이터를 불러오는데 실패했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (template: KakaoTemplate, type: 'contract' | 'video' | 'post_wedding') => {
    const key = `${template.templateId}-${type}`;
    setAssigning(key);
    setMessage(null);

    const channelId = template.channelId || template.channelGroupId || '';
    if (!channelId) {
      setMessage({ type: 'error', text: '이 템플릿에는 채널 ID 정보가 없습니다. 솔라피에서 확인해주세요.' });
      setAssigning(null);
      return;
    }

    try {
      const res = await fetch('/api/admin/sms-templates/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          templateId: template.templateId,
          channelId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: 'error', text: data.error });
        return;
      }

      setConfig(prev => ({
        ...prev,
        [type]: { templateId: template.templateId, channelId },
      }));
      const typeLabel = type === 'contract' ? '계약서용' : type === 'video' ? '영상용' : '예식후안내용';
      setMessage({ type: 'success', text: `${typeLabel} 템플릿이 지정되었습니다.` });
    } catch {
      setMessage({ type: 'error', text: '저장 중 오류가 발생했습니다.' });
    } finally {
      setAssigning(null);
    }
  };

  const isAssigned = (templateId: string, type: 'contract' | 'video' | 'post_wedding') => {
    return config[type]?.templateId === templateId;
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-600">승인</span>;
      case 'PENDING':
        return <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/10 text-yellow-600">검수중</span>;
      case 'REJECTED':
        return <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-500">거절</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs bg-gray-500/10 text-gray-500">{status || '알수없음'}</span>;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link href="/admin" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            관리자 대시보드
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">알림톡 템플릿 관리</h1>
        <p className="text-sm text-muted-foreground mb-6">
          솔라피에 등록된 카카오 알림톡 템플릿을 조회하고, 계약서/영상 발송용으로 지정합니다.
        </p>

        {/* 현재 설정 요약 */}
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-sm text-muted-foreground mb-1">계약서용 템플릿</p>
            {config.contract ? (
              <p className="font-medium text-sm">
                {templates.find(t => t.templateId === config.contract?.templateId)?.name || config.contract.templateId}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">미지정 (SMS로 발송)</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-sm text-muted-foreground mb-1">영상용 템플릿</p>
            {config.video ? (
              <p className="font-medium text-sm">
                {templates.find(t => t.templateId === config.video?.templateId)?.name || config.video.templateId}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">미지정 (SMS로 발송)</p>
            )}
          </div>
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-sm text-muted-foreground mb-1">예식 후 안내용 템플릿</p>
            {config.post_wedding ? (
              <p className="font-medium text-sm">
                {templates.find(t => t.templateId === config.post_wedding?.templateId)?.name || config.post_wedding.templateId}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">미지정 (발송 안됨)</p>
            )}
          </div>
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

        {/* 템플릿 목록 */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-muted border-t-accent rounded-full animate-spin" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>등록된 카카오 알림톡 템플릿이 없습니다.</p>
            <p className="text-sm mt-1">솔라피에서 템플릿을 먼저 등록해주세요.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((tpl) => {
              const isContract = isAssigned(tpl.templateId, 'contract');
              const isVideo = isAssigned(tpl.templateId, 'video');
              const isPostWedding = isAssigned(tpl.templateId, 'post_wedding');
              return (
                <div
                  key={tpl.templateId}
                  className={`rounded-xl border p-5 transition-colors ${
                    isContract || isVideo || isPostWedding
                      ? 'border-accent/50 bg-accent/5'
                      : 'border-border bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-sm">{tpl.name}</h3>
                        {getStatusBadge(tpl.status)}
                        {isContract && (
                          <span className="px-2 py-0.5 rounded text-xs bg-accent/20 text-accent font-medium">계약서용</span>
                        )}
                        {isVideo && (
                          <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-600 font-medium">영상용</span>
                        )}
                        {isPostWedding && (
                          <span className="px-2 py-0.5 rounded text-xs bg-pink-500/20 text-pink-500 font-medium">예식후안내</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">ID: {tpl.templateId}</p>
                      {tpl.content && (
                        <pre className="text-xs text-muted-foreground whitespace-pre-wrap bg-muted rounded-lg p-3 max-h-32 overflow-y-auto">
                          {tpl.content}
                        </pre>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => handleAssign(tpl, 'contract')}
                        disabled={assigning === `${tpl.templateId}-contract` || isContract}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                          isContract
                            ? 'bg-accent/20 text-accent cursor-default'
                            : 'bg-accent text-white hover:bg-accent/90 disabled:opacity-50'
                        }`}
                      >
                        {assigning === `${tpl.templateId}-contract` ? '저장중...' : isContract ? '계약서용 지정됨' : '계약서용 지정'}
                      </button>
                      <button
                        onClick={() => handleAssign(tpl, 'video')}
                        disabled={assigning === `${tpl.templateId}-video` || isVideo}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                          isVideo
                            ? 'bg-blue-500/20 text-blue-600 cursor-default'
                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                        }`}
                      >
                        {assigning === `${tpl.templateId}-video` ? '저장중...' : isVideo ? '영상용 지정됨' : '영상용 지정'}
                      </button>
                      <button
                        onClick={() => handleAssign(tpl, 'post_wedding')}
                        disabled={assigning === `${tpl.templateId}-post_wedding` || isPostWedding}
                        className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                          isPostWedding
                            ? 'bg-pink-500/20 text-pink-500 cursor-default'
                            : 'bg-pink-600 text-white hover:bg-pink-700 disabled:opacity-50'
                        }`}
                      >
                        {assigning === `${tpl.templateId}-post_wedding` ? '저장중...' : isPostWedding ? '예식후안내 지정됨' : '예식후안내 지정'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">알림톡 발송 안내</p>
          <ul className="space-y-1">
            <li>- 템플릿을 지정하면 계약서/영상 URL 등록 시 카카오 알림톡으로 발송됩니다.</li>
            <li>- 예식 후 안내용 템플릿은 예식 다음 날 오전 10시에 자동 발송됩니다.</li>
            <li>- 미지정 시 해당 유형의 알림은 발송되지 않습니다.</li>
            <li>- 솔라피에서 템플릿 승인(APPROVED) 상태여야 실제 발송이 가능합니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
