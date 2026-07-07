import type { Metadata } from "next";
import { InteriorIntro, InteriorPageShell } from "@/app/components/InteriorPage";

export const metadata: Metadata = {
  title: "Registry | Julia & Zach",
  description: "Registry information for Julia & Zach's wedding.",
};

export default function RegistryPage() {
  return (
    <InteriorPageShell>
      <InteriorIntro eyebrow="JULIA & ZACH · REGISTRY" title="Registry">
        We are so grateful to all guests for the investment required to attend an international wedding. Please note that your presence is a priceless gift to us. In the event that you would like to provide a gift, we will be setting up registries in the near term.
      </InteriorIntro>
    </InteriorPageShell>
  );
}
