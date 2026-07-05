import type { ReactNode } from "react";

type InteriorPageShellProps = {
  children: ReactNode;
  className?: string;
};

type InteriorIntroProps = {
  eyebrow: string;
  title: string;
  children: ReactNode;
};

export function InteriorPageShell({ children, className = "" }: InteriorPageShellProps) {
  return (
    <main className={`mx-auto w-full max-w-6xl px-6 py-14 sm:px-8 sm:py-[4.5rem] ${className}`}>
      <div className="border-t border-[#A8B58A]/45 pt-10 sm:pt-14">
        {children}
      </div>
    </main>
  );
}

export function InteriorIntro({ eyebrow, title, children }: InteriorIntroProps) {
  return (
    <section className="max-w-3xl">
      <p className="text-xs uppercase tracking-[0.28em] text-[#6F7A4B]">{eyebrow}</p>
      <h1 className="mt-5 font-serif text-5xl leading-[0.95] text-[#35452C] sm:text-6xl">
        {title}
      </h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-[#2D2923]/82 sm:text-lg">
        {children}
      </p>
    </section>
  );
}
