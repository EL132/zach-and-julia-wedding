import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/rsvp", label: "RSVP" },
  { href: "/events", label: "Events" },
  { href: "/travel", label: "Travel" },
  { href: "/registry", label: "Gift Registry" },
  { href: "/things-to-do", label: "Things To Do" },
  { href: "/gallery", label: "Gallery" },
  { href: "/wedding-party", label: "Wedding Party" },
  { href: "/faqs", label: "FAQs" },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#D8C8B0]/40 bg-[#F8F4EA]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <Link href="/" className="text-lg font-semibold uppercase tracking-[0.32em] text-[#35452C]">
          Julia & Zach
        </Link>

        <nav className="flex max-w-full flex-wrap items-center gap-3 text-sm uppercase tracking-[0.22em] text-[#35452C]/75">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-[#EFE7D8] hover:text-[#35452C]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
