import PageHeader from "@/app/components/PageHeader";

export default function OurPeopleWeddingPartyPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader title="Wedding Party" subtitle="Meet the people who will stand with us on our day." />
      <section className="mt-12 rounded-lg border border-[#E6D8C6] bg-[#EFE7D8] p-8">
        <p className="max-w-2xl text-base leading-8 text-[#2D2923]/85">
          The wedding party page will introduce the friends and family closest to the celebration.
        </p>
      </section>
    </main>
  );
}
