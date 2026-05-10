"use client";

import { useState } from "react";
import Link from "next/link";

const desktopNav = [
  { href: "/", label: "Home" },
  {
    label: "Weekend",
    dropdown: [
      { href: "/events", label: "Events" },
      { href: "/wedding-party", label: "Wedding Party" },
    ],
  },
  {
    label: "Travel",
    dropdown: [
      { href: "/travel", label: "Travel Details" },
      { href: "/things-to-do", label: "Things To Do" },
    ],
  },
  { href: "/registry", label: "Registry" },
  { href: "/gallery", label: "Gallery" },
  { href: "/faqs", label: "FAQs" },
  { href: "/rsvp", label: "RSVP", emphasized: true },
];

const mobileNav = [
  { href: "/", label: "Home" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/events", label: "Events" },
  { href: "/travel", label: "Travel" },
  { href: "/things-to-do", label: "Things To Do" },
  { href: "/registry", label: "Registry" },
  { href: "/gallery", label: "Gallery" },
  { href: "/wedding-party", label: "Wedding Party" },
  { href: "/faqs", label: "FAQs" },
];

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-[#D8C8B0]/40 bg-[#F8F4EA]">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 sm:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="text-sm uppercase tracking-[0.55em] text-[#35452C]">
            JULIA & ZACH
          </Link>

          <button
            type="button"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="sm:hidden rounded-full border border-[#A8B58A] bg-[#EFE7D8] px-4 py-2 text-sm uppercase tracking-[0.24em] text-[#35452C]/90"
          >
            Menu
          </button>
        </div>

        <nav className="hidden items-center justify-center gap-1 text-sm uppercase tracking-[0.24em] text-[#35452C]/80 sm:flex">
          {desktopNav.map((item) => (
            <div key={item.label} className={item.dropdown ? "group relative" : "relative"}>
              {item.dropdown ? (
                <>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-full px-4 py-2 transition hover:bg-[#EFE7D8] hover:text-[#35452C]"
                  >
                    {item.label}
                  </button>
                  <div className="invisible absolute left-1/2 top-full z-10 -translate-x-1/2 min-w-[14rem] rounded-2xl border border-[#D8C8B0]/80 bg-[#EFE7D8] p-3 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="space-y-1">
                      {item.dropdown.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-xl px-4 py-3 text-left text-sm text-[#2D2923] transition hover:bg-[#F7F2E8]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`inline-flex rounded-full px-4 py-2 transition hover:bg-[#EFE7D8] hover:text-[#35452C] ${
                    item.emphasized ? "border border-[#6F7A4B] bg-[#F8F4EA] text-[#35452C] font-semibold" : ""
                  }`}
                >
                  {item.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {mobileOpen ? (
          <div className="flex flex-col gap-1 rounded-3xl border border-[#D8C8B0]/60 bg-[#EFE7D8] p-4 sm:hidden">
            {mobileNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm uppercase tracking-[0.24em] text-[#35452C] transition hover:bg-[#F7F2E8]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
