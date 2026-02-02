"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

interface HeaderClientProps {
  eventSnapLocations: { name: string; slug: string }[];
}

export default function HeaderClient({ eventSnapLocations }: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoMobileUrl, setLogoMobileUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch("/api/site-images")
      .then((res) => res.json())
      .then((data: Record<string, { secureUrl?: string }>) => {
        if (data.logo?.secureUrl) setLogoUrl(data.logo.secureUrl);
        if (data["logo-mobile"]?.secureUrl) setLogoMobileUrl(data["logo-mobile"].secureUrl);
      })
      .catch(() => {});
  }, []);

  const navigation: NavItem[] = [
    { name: "ABOUT", href: "/about" },
    { name: "PRODUCT", href: "/pricing" },
    { name: "PORTFOLIO", href: "/portfolio" },
    {
      name: "EVENT SNAP",
      href: "/event-snap",
      children: eventSnapLocations.map((location) => ({
        name: location.name,
        href: `/event-snap/${location.slug}`,
      })),
    },
    {
      name: "RESERVATION",
      href: "/reservation",
      children: [
        { name: "예약하기", href: "/reservation" },
        { name: "FAQ", href: "/faq" },
        { name: "제휴", href: "/coalition" },
      ],
    },
  ];

  return (
    <>
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src={logoUrl || "/logo.png"}
              alt="라우브필름"
              width={120}
              height={32}
              className="hidden md:block"
              priority
              style={{ width: "120px", height: "32px", objectFit: "contain" }}
            />
            <Image
              src={logoMobileUrl || "/logo-mobile.png"}
              alt="라우브필름"
              width={100}
              height={30}
              className="md:hidden"
              priority
              style={{ width: "100px", height: "30px", objectFit: "contain" }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                <Link
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground tracking-wider"
                >
                  {item.name}
                </Link>

                {/* Dropdown Menu */}
                {item.children && openDropdown === item.name && (
                  <div className="absolute top-full left-0 pt-2 min-w-[160px]">
                    <div className="bg-background border border-border rounded-lg shadow-lg py-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Mypage Icon */}
            <Link
              href="/mypage"
              className="ml-2 p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="마이페이지"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile menu buttons */}
          <div className="md:hidden flex items-center gap-1">
            <Link
              href="/mypage"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="마이페이지"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded={isMobileMenuOpen}
            >
            <span className="sr-only">메뉴 열기</span>
            {isMobileMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
            </button>
          </div>
        </div>

      </nav>
    </header>

    {/* Mobile Menu - Portal to body for true viewport center */}
    {mounted && createPortal(
      <>
        {/* Dark Overlay */}
        <div
          className={cn(
            "md:hidden fixed inset-0 z-[9998] bg-black/70 transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Center Panel */}
        <div
          className={cn(
            "md:hidden fixed inset-0 z-[9999] flex items-center justify-center px-8 transition-opacity duration-300",
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-full max-w-sm p-6 space-y-1"
            onClick={(e) => e.stopPropagation()}
          >
            {navigation.map((item) => (
              <div key={item.name}>
                {item.children ? (
                  <>
                    <button
                      onClick={() =>
                        setMobileOpenDropdown(
                          mobileOpenDropdown === item.name ? null : item.name
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    >
                      <span>{item.name}</span>
                      <svg
                        className={cn(
                          "h-4 w-4 transition-transform",
                          mobileOpenDropdown === item.name && "rotate-180"
                        )}
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-200",
                        mobileOpenDropdown === item.name ? "max-h-48" : "max-h-0"
                      )}
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block pl-8 pr-4 py-2.5 text-base text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </>,
      document.body
    )}
    </>
  );
}
