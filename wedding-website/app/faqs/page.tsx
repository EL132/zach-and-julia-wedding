import FAQChat from "@/app/components/FAQChat";
import { InteriorIntro, InteriorPageShell } from "@/app/components/InteriorPage";
import { chatContent } from "@/app/content/site";

export default function FAQsPage() {
  return (
    <InteriorPageShell>
      <InteriorIntro eyebrow={chatContent.pageEyebrow} title={chatContent.pageTitle}>
        {chatContent.pageIntro}
      </InteriorIntro>

      <section className="mt-14">
        <FAQChat />
      </section>
    </InteriorPageShell>
  );
}
