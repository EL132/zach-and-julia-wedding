import PageHeader from "@/app/components/PageHeader";

export default function EventsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader title="Events" subtitle="A relaxed overview of the wedding weekend schedule." />
      <section className="mt-12 rounded-[2rem] border border-[#E6D8C6] bg-[#EFE7D8] p-8">
        <p className="max-w-2xl text-base leading-8 text-[#2D2923]/85">
          This page will outline the wedding celebrations, welcome gathering, ceremony, reception, and optional events.
        </p>
      </section>
    </main>
  );
}
