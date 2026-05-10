import PageHeader from "@/app/components/PageHeader";

export default function GalleryPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16 sm:px-8">
      <PageHeader title="Gallery" subtitle="A gentle preview of the wedding mood and memories." />
      <section className="mt-12 rounded-[2rem] border border-[#E6D8C6] bg-[#EFE7D8] p-8">
        <p className="max-w-2xl text-base leading-8 text-[#2D2923]/85">
          Gallery content will be added as the celebration approaches, with elegant imagery and thoughtful details.
        </p>
      </section>
    </main>
  );
}
