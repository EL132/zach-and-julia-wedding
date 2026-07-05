import { InteriorIntro, InteriorPageShell } from "@/app/components/InteriorPage";
import RSVPForm from "@/app/components/RSVPForm";
import { rsvpContent } from "@/app/content/site";

export default function RSVPPage() {
  return (
    <InteriorPageShell>
      <InteriorIntro eyebrow={rsvpContent.eyebrow} title={rsvpContent.title}>
        {rsvpContent.intro}
      </InteriorIntro>

      <section className="mt-14 overflow-hidden rounded-md border border-[#A8B58A]/45 bg-[#EFE7D8]">
        <div className="grid lg:grid-cols-[0.75fr_1.25fr]">
          <aside className="border-b border-[#A8B58A]/40 p-8 sm:p-10 lg:border-b-0 lg:border-r">
            <p className="text-xs uppercase tracking-[0.3em] text-[#6F7A4B]">
              {rsvpContent.card.label}
            </p>
            <h2 className="mt-6 font-serif text-4xl leading-tight text-[#35452C]">
              {rsvpContent.card.venue}
            </h2>
            <p className="mt-3 text-base leading-7 text-[#2D2923]/78">
              {rsvpContent.card.location}
            </p>
            <p className="mt-1 text-base leading-7 text-[#2D2923]/78">
              {rsvpContent.card.date}
            </p>

            <div className="mt-10 border-t border-[#A8B58A]/45 pt-7">
              <p className="text-xs uppercase tracking-[0.24em] text-[#6F7A4B]">
                {rsvpContent.card.responseLabel}
              </p>
              <p className="mt-3 font-serif text-3xl leading-tight text-[#35452C]">
                {rsvpContent.card.responseDate}
              </p>
            </div>

            <p className="mt-10 max-w-sm text-sm leading-7 text-[#2D2923]/72">
              {rsvpContent.card.note}
            </p>
          </aside>

          <div className="p-8 sm:p-10">
            <RSVPForm />
          </div>
        </div>
      </section>
    </InteriorPageShell>
  );
}
