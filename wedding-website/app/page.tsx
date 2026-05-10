import PageHeader from "@/app/components/PageHeader";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8">
      <div className="rounded-[2.5rem] border border-[#E6D8C6] bg-[#EFE7D8] p-10 sm:p-14">
        <PageHeader title="Julia & Zach" subtitle="A warm welcome to our wedding website." />
        <div className="mt-12 max-w-3xl text-base leading-8 text-[#2D2923]/85">
          <p>
            This site is the beginning of our wedding story. Use the navigation above to explore the celebration details.
          </p>
        </div>
      </div>
    </main>
  );
}
