import PageHeader from "@/app/components/PageHeader";
import FAQChat from "@/app/components/FAQChat";

export default function FAQsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader title="FAQs" subtitle="Answers to the most common questions for our guests." />
      <section className="mt-12">
        <FAQChat />
      </section>
    </main>
  );
}
