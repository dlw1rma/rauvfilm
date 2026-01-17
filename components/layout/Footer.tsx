import Link from "next/link";

const footerNavigation = {
  main: [
    { name: "포트폴리오", href: "/portfolio" },
    { name: "가격 안내", href: "/pricing" },
    { name: "예약", href: "/reservation" },
    { name: "고객 후기", href: "/reviews" },
    { name: "문의하기", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Logo */}
          <Link href="/" className="mb-6">
            <span className="text-xl font-bold text-foreground">
              RAUV<span className="text-accent">FILM</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="mb-8">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {footerNavigation.main.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact Info */}
          <div className="mb-8 text-center text-sm text-muted-foreground">
            <p className="mb-1">대표: 손세한</p>
            <p className="mb-1">이메일: contact@rauvfilm.co.kr</p>
          </div>

          {/* Copyright */}
          <div className="border-t border-border pt-8 w-full">
            <p className="text-center text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} 라우브필름. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
