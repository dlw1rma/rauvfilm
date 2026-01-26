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
  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  
  // 로그인 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 회원가입 상태
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [secretKey, setSecretKey] = useState("");
  
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<Stats>({
    reservations: { total: 0, pending: 0 },
    contacts: { total: 0, unread: 0 },
    portfolios: 0,
    reviews: 0,
  });

  // 페이지 로드 시 세션 확인
  useEffect(() => {
    checkSession();
  }, []);

  // 로그인 후 통계 불러오기
  useEffect(() => {
    if (isLoggedIn) {
      fetch("/api/admin/stats")
        .then((res) => res.json())
        .then((data) => setStats(data))
        .catch(console.error);
    }
  }, [isLoggedIn]);

  const checkSession = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();
      setIsLoggedIn(data.authenticated === true);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

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
    {
      name: "이벤트 스냅",
      href: "/admin/event-snap",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      count: 0,
      description: "촬영 장소별 이미지 관리",
    },
    {
      name: "사이트 이미지",
      href: "/admin/site-images",
      icon: (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      count: 0,
      description: "로고, 배경 이미지 관리",
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsLoggedIn(true);
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || "로그인에 실패했습니다.");
      }
    } catch {
      setError("로그인 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/admin/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName,
          secretKey,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsLoggedIn(true);
        setRegisterEmail("");
        setRegisterPassword("");
        setRegisterName("");
        setSecretKey("");
        setMode("login");
      } else {
        setError(data.error || "회원가입에 실패했습니다.");
      }
    } catch {
      setError("회원가입 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      setIsLoggedIn(false);
      setStats({
        reservations: { total: 0, pending: 0 },
        contacts: { total: 0, unread: 0 },
        portfolios: 0,
        reviews: 0,
      });
    } catch {
      console.error("Logout failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-accent" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">
              {mode === "login" ? "관리자 로그인" : "관리자 회원가입"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === "login"
                ? "이메일과 비밀번호로 로그인하세요."
                : "시크릿키를 입력하여 관리자 계정을 생성하세요."}
            </p>
          </div>

          {/* 탭 전환 */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              로그인
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                mode === "register"
                  ? "bg-accent text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              회원가입
            </button>
          </div>

          {/* 로그인 폼 */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="admin@example.com"
                  disabled={submitting}
                  required
                />
              </div>
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
                  placeholder="비밀번호"
                  disabled={submitting}
                  required
                />
              </div>
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50"
              >
                {submitting ? "로그인 중..." : "로그인"}
              </button>
            </form>
          )}

          {/* 회원가입 폼 */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="secretKey" className="block text-sm font-medium mb-2">
                  시크릿키 <span className="text-accent">*</span>
                </label>
                <input
                  type="password"
                  id="secretKey"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="시크릿키를 입력하세요"
                  disabled={submitting}
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  관리자에게 발급받은 시크릿키를 입력하세요.
                </p>
              </div>
              <div>
                <label htmlFor="registerEmail" className="block text-sm font-medium mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  id="registerEmail"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="admin@example.com"
                  disabled={submitting}
                  required
                />
              </div>
              <div>
                <label htmlFor="registerName" className="block text-sm font-medium mb-2">
                  이름 (선택)
                </label>
                <input
                  type="text"
                  id="registerName"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="이름"
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="registerPassword" className="block text-sm font-medium mb-2">
                  비밀번호
                </label>
                <input
                  type="password"
                  id="registerPassword"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  placeholder="최소 8자 이상"
                  disabled={submitting}
                  required
                  minLength={8}
                />
              </div>
              {error && <p className="text-sm text-accent">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-accent py-3 font-medium text-white transition-all hover:bg-accent-hover disabled:opacity-50"
              >
                {submitting ? "회원가입 중..." : "회원가입"}
              </button>
            </form>
          )}
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
            onClick={handleLogout}
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
