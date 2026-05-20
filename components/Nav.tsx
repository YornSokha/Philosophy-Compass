"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Constellation", mobileHidden: true },
  { href: "/discover", label: "Discover", mobileHidden: false },
  { href: "/problems", label: "Problems", mobileHidden: false },
  { href: "/philosophies", label: "Philosophies", mobileHidden: false },
];

export default function Nav() {
  const path = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 py-4 pointer-events-none">
      <Link
        href="/"
        className="pointer-events-auto font-serif text-base sm:text-lg tracking-wide text-[var(--text)] opacity-90 hover:opacity-100 transition-opacity"
      >
        ✦<span className="hidden sm:inline"> Philosophy</span> Compass
      </Link>

      <div className="pointer-events-auto flex items-center gap-0.5 sm:gap-1">
        {links.map(({ href, label, mobileHidden }) => {
          const active = path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm transition-all ${
                active
                  ? "bg-[var(--surface-2)] text-[var(--text)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              } ${mobileHidden ? "hidden sm:block" : ""}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
