import PageHeader from "@/app/components/PageHeader";

const scheduleText =
  "We will be hosting events beginning early evening August 14 - early afternoon August 16. We will be in Stockholm the week before the wedding as well (likely beginning August 10th). We will be sharing more details on the weekend and week of events as we continue to plan.";

export default function SchedulePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader title="Schedule" />
      <section className="mt-12 rounded-lg border border-[#E6D8C6] bg-[#EFE7D8] p-8">
        <p className="max-w-2xl text-base leading-8 text-[#2D2923]/85">
          {scheduleText}
        </p>
      </section>
    </main>
  );
}
