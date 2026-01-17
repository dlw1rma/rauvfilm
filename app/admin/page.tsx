"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  reservations: { total: number; pending: number };
  contacts: { total: number; unread: number };
  portfolios: number;
  reviews: number;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats>({
    reservations: { total: 0, pending: 0 },
    contacts: { total: 0, unread: 0 },
    portfolios: 0,
    reviews: 0,
  });

  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(console.error);
    }
  }, [isLoggedIn]);

  const menuItems = [
    {
      name: "예약 관리",
      href: "/admin/reservations",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
      count: stats.reservations.pending,
      description: "예약 문의 확인 및 답변",
    },
    {
      name: "문의 관리",
      href: "/admin/contacts",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
      ),
      count: stats.contacts.unread,
      description: "문의 내역 확인",
    },
    {
      name: "포트폴리오 관리",
      href: "/admin/portfolio",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0118 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 016 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5" />
        </svg>
      ),
      count: 0,
      description: "영상 추가/수정/삭제",
    },
    {
      name: "후기 관리",
      href: "/admin/reviews",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
      count: 0,
      description: "고객 후기 관리",
    },
  ];

  // 임시 로그인 (실제로는 Auth.js 사용)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 임시 비밀번호 체크 (실제로는 서버에서 검증)
    if (password === "admin1234") {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("비밀번호가 올바르지 않습니다.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">관리자 로그인</h1>
            <p className="text-sm text-muted-foreground">
              관리자 권한이 필요합니다.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                비밀번호
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                placeholder="관리자 비밀번호"
              />
            </div>
            {error && (
              <p className="text-sm text-accent">{error}</p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover"
            >
              로그인
            </button>
          </form>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            * 임시 비밀번호: admin1234 (개발용)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">관리자 대시보드</h1>
            <p className="mt-1 text-muted-foreground">
              라우브필름 콘텐츠를 관리합니다.
            </p>
          </div>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            로그아웃
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-xl border border-border bg-muted p-6">
            <p className="text-sm text-muted-foreground">총 예약 문의</p>
            <p className="text-3xl font-bold mt-1">{stats.reservations.total}</p>
            <p className="text-xs text-accent mt-2">
              {stats.reservations.pending}건 대기중
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted p-6">
            <p className="text-sm text-muted-foreground">총 문의</p>
            <p className="text-3xl font-bold mt-1">{stats.contacts.total}</p>
            <p className="text-xs text-accent mt-2">
              {stats.contacts.unread}건 미확인
            </p>
          </div>
          <div className="rounded-xl border border-border bg-muted p-6">
            <p className="text-sm text-muted-foreground">포트폴리오</p>
            <p className="text-3xl font-bold mt-1">{stats.portfolios}</p>
            <p className="text-xs text-muted-foreground mt-2">등록된 영상</p>
          </div>
          <div className="rounded-xl border border-border bg-muted p-6">
            <p className="text-sm text-muted-foreground">고객 후기</p>
            <p className="text-3xl font-bold mt-1">{stats.reviews}</p>
            <p className="text-xs text-muted-foreground mt-2">등록된 후기</p>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-start gap-4 rounded-xl border border-border bg-muted p-6 transition-all hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{item.name}</h2>
                  {item.count > 0 && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                      {item.count}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
              <svg
                className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 rounded-xl border border-border bg-muted p-6">
          <h2 className="font-semibold mb-4">빠른 작업</h2>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/portfolio/new"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-all hover:bg-accent-hover"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              포트폴리오 추가
            </Link>
            <Link
              href="/admin/reviews/new"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-all hover:bg-background"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              후기 추가
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
