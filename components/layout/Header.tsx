"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  children?: { name: string; href: string }[];
}

const navigation: NavItem[] = [
  { name: "ABOUT", href: "/about" },
  { name: "PRODUCT", href: "/pricing" },
  { name: "PORTFOLIO", href: "/portfolio" },
  {
    name: "EVENT SNAP",
    href: "/event-snap",
    children: [
      { name: "동작대교", href: "/event-snap/djbg" },
      { name: "창경궁", href: "/event-snap/chg" },
      { name: "노을공원", href: "/event-snap/nepark" },
      { name: "올림픽공원", href: "/event-snap/olpark" },
    ],
  },
  {
    name: "RESERVATION",
    href: "/reservation",
    children: [
      { name: "예약하기", href: "/reservation" },
      { name: "마이페이지", href: "/mypage" },
      { name: "FAQ", href: "/faq" },
      { name: "제휴", href: "/coalition" },
    ],
  },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="라우브필름"
              width={120}
              height={32}
              className="hidden md:block"
              priority
              style={{ width: "120px", height: "32px", objectFit: "contain" }}
            />
            <Image
              src="/logo-mobile.png"
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
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-muted-foreground hover:text-foreground"
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

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMobileMenuOpen ? "max-h-[500px] pb-4" : "max-h-0"
          )}
        >
          <div className="space-y-1 pt-2">
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
                      className="w-full flex items-center justify-between px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
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
                          className="block pl-6 pr-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
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
                    className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
