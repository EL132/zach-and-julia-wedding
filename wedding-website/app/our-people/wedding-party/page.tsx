import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Wedding Party | Julia & Zach",
  description: "Browse the people standing with Julia and Zach in an interactive photo carousel.",
};

export default function WeddingPartyPage() {
  redirect("/");
}
