import PageHeader from "@/app/components/PageHeader";

export default function ThingsToDoPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader title="Things To Do" subtitle="Local recommendations for friends and family." />
      <section className="mt-12 rounded-[2rem] border border-[#E6D8C6] bg-[#EFE7D8] p-8">
        <p className="max-w-2xl text-base leading-8 text-[#2D2923]/85">
          This section will highlight nearby activities, dining, and quiet moments to enjoy around the wedding weekend.
        </p>
      </section>
    </main>
  );
}
