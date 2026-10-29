import { createHash } from "node:crypto";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WeddingPartyCarousel from "./WeddingPartyReveal";

const accessCookie = "wedding-party-access";
const accessToken = createHash("sha256").update("03/29/2004").digest("hex");

async function unlockWeddingParty(formData: FormData) {
  "use server";

  const answer = String(formData.get("answer") ?? "").trim();
  if (answer !== "03/29/2004") {
    redirect("/our-people/wedding-party?incorrect=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(accessCookie, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/our-people/wedding-party",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/our-people/wedding-party");
}

export const metadata: Metadata = {
  title: "Wedding Party | Julia & Zach",
  description: "Browse the people standing with Julia and Zach in an interactive photo carousel.",
};

export default async function WeddingPartyPage({
  searchParams,
}: {
  searchParams: Promise<{ incorrect?: string }>;
}) {
  const cookieStore = await cookies();
  if (cookieStore.get(accessCookie)?.value === accessToken) {
    return <WeddingPartyCarousel />;
  }

  const { incorrect } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F1F2E9] px-6 py-16 text-[#35452C]">
      <section className="w-full max-w-md rounded-3xl border border-[#9BA58A]/40 bg-[#F9F7EF] p-8 shadow-[0_24px_65px_rgba(39,53,34,0.12)] sm:p-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[#7A8467]">Julia &amp; Zach · Our people</p>
        <h1 className="mt-5 font-serif text-4xl">A quick question</h1>
        <p className="mt-3 leading-7 text-[#5E6652]">Answer the question to view the wedding party.</p>

        <form action={unlockWeddingParty} className="mt-8">
          <label htmlFor="answer" className="block text-sm font-medium">When is Elias’ birthday?</label>
          <p id="answer-format" className="mt-1 text-sm text-[#7A8467]">Enter your answer as MM/DD/YYYY.</p>
          <input
            id="answer"
            name="answer"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            aria-describedby={incorrect ? "answer-format answer-error" : "answer-format"}
            aria-invalid={incorrect ? true : undefined}
            placeholder="MM/DD/YYYY"
            required
            className="mt-3 w-full rounded-xl border border-[#AAB39A] bg-white px-4 py-3 text-[#2D3428] outline-none transition focus:border-[#62714F] focus:ring-2 focus:ring-[#62714F]/20"
          />
          {incorrect ? <p id="answer-error" role="alert" className="mt-2 text-sm text-[#9A3F36]">That answer isn’t correct. Please try again.</p> : null}
          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-[#35452C] px-5 py-3 text-sm uppercase tracking-[0.16em] text-[#F5F2EB] transition hover:bg-[#465B39] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#35452C] focus-visible:ring-offset-2"
          >
            View the wedding party
          </button>
        </form>
      </section>
    </main>
  );
}
