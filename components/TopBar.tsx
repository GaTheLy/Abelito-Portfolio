"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/projects", label: "Projects" },
  { href: "/writing", label: "Writing" },
  { href: "/creator", label: "Creator" },
  { href: "/about", label: "About" },
] as const;

/** "Projects" stays lit for every case study, not just the index. */
function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function TopBar() {
  const pathname = usePathname();

  return (
    <header className="flex h-[57px] shrink-0 items-center justify-between gap-4 border-b border-divider bg-raised px-4 lg:gap-6 lg:px-5">
      <div className="flex flex-1 justify-start">
        <Link href="/" className="flex flex-none items-center gap-2.5">
          <Image
            src="/assets/abel-pixelated.png"
            alt="Abelito Visese"
            width={30}
            height={30}
            priority
            className="shrink-0 rounded-full bg-green-tint object-cover"
            style={{ objectPosition: "52% 4%" }}
          />
          <span className="text-[13.5px] font-semibold tracking-[-0.01em] text-ink max-sm:hidden">
            Abelito Faleyrio Visese
          </span>
        </Link>
      </div>

      {/* Six items don't fit a phone — let the nav scroll rather than wrap the
          bar to two rows or hide destinations behind a menu. */}
      <nav
        aria-label="Primary"
        className="flex min-w-0 flex-none items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {NAV.map(({ href, label }) => {
          const active = isActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`t-ui flex-none rounded-nav px-3 py-[7px] transition-colors hover:bg-well ${active ? "bg-well text-ink" : "text-ink-muted"
                }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-1 items-center justify-end gap-4">
        <span className="t-meta text-ink-faint max-xl:hidden">MALANG · GMT+7</span>
        <Link
          href="/connect"
          className="t-ui rounded-pill bg-green px-[15px] py-2 text-surface transition-colors hover:bg-green-dark"
        >
          Connect
        </Link>
      </div>
    </header>
  );
}
