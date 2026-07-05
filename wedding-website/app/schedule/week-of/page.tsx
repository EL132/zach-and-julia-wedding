import PageHeader from "@/app/components/PageHeader";

export default function WeekOfPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader
        title="Week of"
        subtitle="Early notes for guests spending extra time in Sweden before the wedding weekend."
      />
      <section className="mt-12 rounded-lg border border-[#E6D8C6] bg-[#EFE7D8] p-8">
        <p className="max-w-2xl text-base leading-8 text-[#2D2923]/85">
          Week-of plans, optional gatherings, and local recommendations will be added here as details are finalized.
        </p>
      </section>
    </main>
  );
}
