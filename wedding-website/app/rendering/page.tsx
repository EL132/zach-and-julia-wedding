import type { Metadata } from "next";
import RenderingEntrance from "./RenderingEntrance";

export const metadata: Metadata = {
  title: "Explore Maryhill | Julia & Zach",
  description: "Take a little look around Maryhill Estate. An interactive miniature of our wedding venue.",
};

export default function RenderingPage() {
  return <RenderingEntrance />;
}
