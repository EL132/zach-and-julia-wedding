import type { Metadata } from "next";
import { InteriorIntro, InteriorPageShell } from "@/app/components/InteriorPage";

export const metadata: Metadata = {
  title: "Schedule | Julia & Zach",
  description: "Schedule information for Julia & Zach's wedding.",
};

const scheduleText =
  "We will be hosting events beginning early evening August 14 - early afternoon August 16. We will be in Stockholm the week before the wedding as well (likely beginning August 10th). We will be sharing more details on the weekend and week of events as we continue to plan.";

export default function SchedulePage() {
  return (
    <InteriorPageShell>
      <InteriorIntro eyebrow="JULIA & ZACH · SCHEDULE" title="Schedule">
        {scheduleText}
      </InteriorIntro>
    </InteriorPageShell>
  );
}
