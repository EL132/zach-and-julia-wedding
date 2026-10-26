import type { Metadata } from "next";
import WeddingPartyCarousel from "./WeddingPartyReveal";

export const metadata: Metadata = {
  title: "Wedding Party | Julia & Zach",
  description: "Browse the people standing with Julia and Zach in an interactive photo carousel.",
};

export default function WeddingPartyPage() {
  return <WeddingPartyCarousel />;
}
