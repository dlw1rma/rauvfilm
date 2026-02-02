"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/admin/auth");
      const data = await res.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
      } else {
        // 인증 안됨 - 관리자 로그인 페이지로 리디렉션
        router.push("/admin");
      }
    } catch {
      router.push("/admin");
    } finally {
      setIsLoading(false);
    }
  };

  return { isAuthenticated, isLoading };
}
