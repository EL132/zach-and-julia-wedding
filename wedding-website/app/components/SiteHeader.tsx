"use client";

import { useEffect, useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { couple, navigationItems, type NavItem } from "@/app/content/site";
import { FishMark } from "@/app/components/FishMark";

const menuEase = [0.22, 1, 0.36, 1] as const;

function isHrefActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isNavItemActive(item: NavItem, pathname: string) {
  if (item.href && isHrefActive(item.href, pathname)) return true;
  if (item.children?.some((child) => isHrefActive(child.href, pathname))) return true;
  return item.activeHrefs?.some((href) => isHrefActive(href, pathname)) ?? false;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const menuId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const isHome = pathname === "/";
  const isGallery = pathname === "/gallery";
  const useLightButton = isHome || menuOpen;

  useEffect(() => {
    if (!menuOpen || typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    setOpenGroups((current) => {
      let next = current;
      for (const item of navigationItems) {
        if (!item.children || !isNavItemActive(item, pathname) || current[item.label]) continue;
        next = { ...next, [item.label]: true };
      }
      return next;
    });
  }, [menuOpen, pathname]);

  const closeMenu = () => setMenuOpen(false);

  if (isGallery) return null;

  const buttonTone = useLightButton
    ? "border-[#F5F2EB]/30 text-[#F5F2EB] hover:border-[#F5F2EB]/60 hover:bg-[#F5F2EB]/10 focus-visible:ring-[#F5F2EB]/50"
    : "border-[#2D2923]/25 text-[#1A1712] hover:border-[#2D2923]/50 hover:bg-[#2D2923]/5 focus-visible:ring-[#2D2923]/30";

  return (
    <>
      <header className="fixed left-4 top-4 z-[120] bg-transparent sm:left-6 sm:top-6">
        <div>
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-controls={menuId}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className={`group relative flex h-12 w-12 items-center justify-center rounded-full border bg-transparent transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${buttonTone}`}
          >
            <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
            <span aria-hidden="true" className="relative h-4 w-7">
              <span
                className={`absolute left-0 top-0 h-px w-7 origin-center bg-current transition-transform duration-300 ease-out ${
                  menuOpen ? "translate-y-2 rotate-45" : "group-hover:translate-x-0.5"
                }`}
              />
              <span
                className={`absolute left-1 top-1/2 h-px w-5 -translate-y-1/2 bg-current transition-all duration-300 ease-out ${
                  menuOpen ? "scale-x-0 opacity-0" : "opacity-80 group-hover:left-0 group-hover:w-7"
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-7 origin-center bg-current transition-transform duration-300 ease-out ${
                  menuOpen ? "-translate-y-2 -rotate-45" : "group-hover:-translate-x-0.5"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="site-menu"
            className="fixed inset-0 z-[110] overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: menuEase }}
            onClick={() => setMenuOpen(false)}
          >
            <div className="absolute inset-0 bg-black/60" aria-hidden="true" />
            <motion.aside
              id={menuId}
              aria-label="Site navigation"
              className="relative z-10 flex h-full w-full max-w-[30rem] flex-col overflow-y-auto border-r border-[#F5F2EB]/10 bg-[#0b0b09] px-8 pb-8 pt-24 text-[#F5F2EB] sm:px-10 sm:pt-28"
              initial={shouldReduceMotion ? false : { x: "-100%", opacity: 0.92 }}
              animate={{ x: 0, opacity: 1 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { x: "-100%", opacity: 0.92 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.46, ease: menuEase }}
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-xs uppercase tracking-[0.55em] text-[#F5F2EB]/60">Navigation</p>

              <FishMark className="mt-4 h-8 w-8 opacity-75" />

              <nav className="mt-6 space-y-[clamp(0.65rem,1.8vh,1.25rem)]" aria-label="Primary navigation">
                {navigationItems.map((item, index) => {
                  const itemIsActive = isNavItemActive(item, pathname);
                  const groupOpen = openGroups[item.label] ?? itemIsActive;
                  const groupId = `${menuId}-${item.label.toLowerCase().replace(/\s+/g, "-")}`;
                  const mainItemTone = itemIsActive
                    ? "text-[#F5F2EB] underline decoration-[#D8B8A6]/50 decoration-1 underline-offset-[0.18em]"
                    : item.emphasized
                      ? "text-[#F5F2EB] hover:text-[#F5F2EB]"
                      : "text-[#E7E3D8]/90 hover:text-[#F5F2EB]";
                  const parentItemTone = itemIsActive
                    ? "!text-[#F5F2EB] underline decoration-[#D8B8A6]/50 decoration-1 underline-offset-[0.18em]"
                    : "!text-[#E7E3D8] hover:!text-[#F5F2EB]";

                  return (
                    <motion.div
                      key={item.href ?? item.label}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.34,
                        delay: shouldReduceMotion ? 0 : 0.08 + index * 0.045,
                        ease: menuEase,
                      }}
                    >
                      {item.children?.length ? (
                        <div>
                          <button
                            type="button"
                            aria-expanded={groupOpen}
                            aria-controls={groupId}
                            onClick={() =>
                              setOpenGroups((current) => ({
                                ...current,
                                [item.label]: !groupOpen,
                              }))
                            }
                            className={`flex w-full items-center justify-between gap-4 text-left font-serif text-[clamp(2rem,5.1vh,3.35rem)] leading-[0.94] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EB]/50 ${parentItemTone}`}
                          >
                            <span>{item.label}</span>
                            <span className="text-2xl leading-none !text-[#E7E3D8]" aria-hidden="true">
                              {groupOpen ? "-" : "+"}
                            </span>
                          </button>

                          <AnimatePresence initial={false}>
                            {groupOpen ? (
                              <motion.div
                                id={groupId}
                                className="mt-4 space-y-3 border-l border-[#D8B8A6]/30 pl-5"
                                initial={shouldReduceMotion ? false : { height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                                transition={{ duration: shouldReduceMotion ? 0 : 0.24, ease: menuEase }}
                              >
                                {item.children.map((child) => {
                                  const childIsActive = isHrefActive(child.href, pathname);

                                  return (
                                    <Link
                                      key={child.href}
                                      href={child.href}
                                      onClick={closeMenu}
                                      className={`block font-serif text-[clamp(1.25rem,2.6vh,1.75rem)] leading-tight transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EB]/50 ${
                                        childIsActive
                                          ? "text-[#F5F2EB] underline decoration-[#D8B8A6]/50 decoration-1 underline-offset-[0.2em]"
                                          : "text-[#E7E3D8]/70 hover:text-[#F5F2EB]"
                                      }`}
                                    >
                                      {child.label}
                                    </Link>
                                  );
                                })}
                              </motion.div>
                            ) : null}
                          </AnimatePresence>
                        </div>
                      ) : (
                        <Link
                          href={item.href ?? "/"}
                          onClick={closeMenu}
                          className={`block font-serif text-[clamp(2rem,5.1vh,3.35rem)] leading-[0.94] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F2EB]/50 ${mainItemTone}`}
                        >
                          {item.label}
                        </Link>
                      )}
                    </motion.div>
                  );
                })}
              </nav>

              <div className="mt-auto pt-8 text-xs uppercase tracking-[0.35em] text-[#F5F2EB]/50">
                {couple.displayName}
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
