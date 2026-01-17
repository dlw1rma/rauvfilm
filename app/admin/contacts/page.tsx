"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Contact {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  weddingDate: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedContact = contacts.find((c) => c.id === selectedId);

  const handleMarkAsRead = async (id: number) => {
    try {
      await fetch(`/api/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: true }),
      });
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isRead: true } : c))
      );
    } catch (error) {
      console.error("Mark as read error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setContacts((prev) => prev.filter((c) => c.id !== id));
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            대시보드로 돌아가기
          </Link>
          <h1 className="text-3xl font-bold">문의 관리</h1>
          <p className="mt-1 text-muted-foreground">
            고객 문의 내역을 확인합니다.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* List */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border flex items-center justify-between">
              <h2 className="font-medium">문의 목록</h2>
              <span className="text-sm text-muted-foreground">
                {contacts.filter((c) => !c.isRead).length}건 미확인
              </span>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  등록된 문의가 없습니다.
                </div>
              ) : (
                contacts.map((contact) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      setSelectedId(contact.id);
                      if (!contact.isRead) handleMarkAsRead(contact.id);
                    }}
                    className={`w-full text-left px-4 py-4 transition-colors hover:bg-muted/50 ${
                      selectedId === contact.id ? "bg-accent/10" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {!contact.isRead && (
                        <span className="h-2 w-2 rounded-full bg-accent" />
                      )}
                      <span className="font-medium text-sm">{contact.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {contact.phone}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {contact.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(contact.createdAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="bg-muted px-4 py-3 border-b border-border">
              <h2 className="font-medium">상세 정보</h2>
            </div>
            {selectedContact ? (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-muted-foreground">이름</p>
                    <p className="font-medium">{selectedContact.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">연락처</p>
                    <p className="font-medium">{selectedContact.phone}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">이메일</p>
                    <p className="font-medium">{selectedContact.email || "-"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">예식일</p>
                    <p className="font-medium">
                      {selectedContact.weddingDate?.split("T")[0] || "-"}
                    </p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-muted-foreground text-sm mb-2">문의 내용</p>
                  <div className="rounded-lg bg-background p-4 text-sm whitespace-pre-wrap">
                    {selectedContact.message}
                  </div>
                </div>

                <div className="flex gap-3">
                  <a
                    href={`tel:${selectedContact.phone}`}
                    className="flex-1 rounded-lg bg-accent py-2 text-center text-sm font-medium text-white transition-all hover:bg-accent-hover"
                  >
                    전화하기
                  </a>
                  <button
                    onClick={() => handleDelete(selectedContact.id)}
                    className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                목록에서 문의를 선택하세요.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
