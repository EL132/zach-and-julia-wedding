import type { Metadata } from "next";
import ScheduleExperience from "./ScheduleExperience";

export const metadata: Metadata = {
  title: "Schedule | Julia & Zach",
  description: "The days leading to Julia and Zach's wedding and the celebration at Maryhill Estate, August 8–16, 2027.",
};

export default function SchedulePage() {
  return <ScheduleExperience />;
}
