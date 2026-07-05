import PageHeader from "@/app/components/PageHeader";

export default function OurStoryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader title="Our Story" subtitle="A little more about the road to August 2027." />
      <section className="mt-12 rounded-lg border border-[#E6D8C6] bg-[#EFE7D8] p-8">
        <p className="max-w-2xl text-base leading-8 text-[#2D2923]/85">
          Julia & Zach will share more of their story here soon.
        </p>
      </section>
    </main>
  );
}
