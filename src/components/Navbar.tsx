"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{ borderBottom: "1px solid var(--border)", background: "var(--bg)" }}
      className="sticky top-0 z-50 px-6 py-4"
    >
      <div
        className="max-w-7xl mx-auto flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight"
            style={{ color: "var(--text)", letterSpacing: "-0.02em" }}
          >
            KO<span style={{ color: "var(--accent)" }}>LL</span>AB
          </Link>
          <span
            className="hidden sm:inline text-xs font-medium px-3 py-1 rounded-full"
            style={{
              background: "rgba(122,182,72,0.1)",
              color: "var(--accent)",
              border: "1px solid rgba(122,182,72,0.2)",
            }}
          >
            Miễn phí mãi mãi · Không trung gian
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link
            href="/browse"
            className="text-sm font-medium transition-colors"
            style={{
              color: pathname === "/browse" ? "var(--text)" : "var(--text-muted)",
            }}
          >
            Khám Phá
          </Link>
          <Link
            href="/join"
            className="text-sm font-semibold px-5 py-2 rounded-full transition-colors"
            style={{
              background: "var(--accent)",
              color: "#fff",
            }}
          >
            Tham Gia
          </Link>
        </div>
      </div>
    </nav>
  );
}
