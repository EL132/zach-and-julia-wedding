import type { Metadata } from "next";
import WeddingPartyGraph from "./WeddingPartyReveal";

export const metadata: Metadata = {
  title: "Wedding Party | Julia & Zach",
  description: "Explore the people standing with Julia and Zach in a drag-to-explore wedding party graph.",
};

export default function WeddingPartyPage() {
  return <WeddingPartyGraph />;
}
