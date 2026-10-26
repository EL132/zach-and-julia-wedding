"use client";

import { useState } from "react";
import styles from "./schedule.module.css";

type Day = "14" | "15" | "16";

type Event = {
  name: string;
};

type Act = {
  day: Day;
  label: string;
  title: string;
  events: Event[];
  note: string;
};

const acts: Act[] = [
  {
    day: "14",
    label: "The welcome",
    title: "Come together",
    events: [
      { name: "Tennis tournament" },
      { name: "Sauna & cold plunge" },
      { name: "Welcome dinner" },
    ],
    note: "Dinner location and event times to follow.",
  },
  {
    day: "15",
    label: "The moment",
    title: "Wedding Day",
    events: [{ name: "Julia & Zach get married" }],
    note: "Location and time to follow.",
  },
  {
    day: "16",
    label: "The morning after",
    title: "Stay a little",
    events: [{ name: "Breakfast & brunch" }],
    note: "Location and time to follow.",
  },
];

// The tennis courts and sauna are the only confirmed spots in the 1800 × 1400 estate rendering.
const confirmedSpots = [
  { name: "tennis", x: 1020, y: 575 },
  { name: "sauna", x: 420, y: 662 },
];

function EstateMap({ day }: { day: Day }) {
  return (
    <span className={styles.actMap} aria-hidden="true">
      <svg viewBox="0 0 1800 1400" preserveAspectRatio="xMidYMid meet">
        <image href="/rendering/maryhill-estate-poster.webp" x="0" y="0" width="1800" height="1400" />
        {day === "14" && confirmedSpots.map((spot) => (
          <g key={spot.name} className={styles.mapPin} transform={`translate(${spot.x} ${spot.y})`}>
            <circle className={styles.pinHalo} cy="-62" r="55" />
            <path className={styles.pinBody} d="M0 0 C-18-25 -38-41 -38-62 C-38-83 -21-100 0-100 C21-100 38-83 38-62 C38-41 18-25 0 0 Z" />
            <circle className={styles.pinCenter} cy="-62" r="13" />
          </g>
        ))}
      </svg>
    </span>
  );
}

export default function ScheduleExperience() {
  const [activeDay, setActiveDay] = useState<Day>("14");

  return (
    <main className={styles.page}>
      <div className={styles.masthead}>
        <span>Julia & Zach</span>
        <span>Maryhill Estate · August 2027</span>
      </div>

      <section className={styles.intro} aria-labelledby="schedule-title">
        <p className={styles.eyebrow}>August 14–16, 2027</p>
        <h1 id="schedule-title">Wedding<br /><em>weekend</em></h1>
      </section>

      <div className={styles.prologue}>
        <span className={styles.eyebrow}>The prologue</span>
        <p><strong>Aug 8–12</strong> · Julia & Zach in Stockholm <span aria-hidden="true">/</span> <strong>Aug 12</strong> · Travel to Maryhill</p>
      </div>

      <section className={`${styles.acts} ${styles[`active${activeDay}`]}`} aria-label="The three days of the wedding weekend">
        {acts.map((act) => (
          <button
            key={act.day}
            type="button"
            className={`${styles.act} ${styles[`act${act.day}`]} ${activeDay === act.day ? styles.actActive : ""}`}
            onMouseEnter={() => setActiveDay(act.day)}
            onFocus={() => setActiveDay(act.day)}
            onClick={() => setActiveDay(act.day)}
            aria-pressed={activeDay === act.day}
          >
            <EstateMap day={act.day} />
            <span className={styles.actShade} aria-hidden="true" />
            <span className={styles.actTop}>
              <span className={styles.eyebrow}>{act.label}</span>
              <span className={styles.actDate}>August {act.day}, 2027</span>
            </span>
            <span className={styles.mapHint} aria-hidden="true">
              {act.day === "14" ? "Focus areas · Tennis courts & sauna" : "Maryhill Estate · exact spot to follow"}
            </span>
            <span className={styles.actCopy}>
              <span className={styles.actNumber} aria-hidden="true">{act.day}</span>
              <span className={styles.actTitle}>{act.title}</span>
              <span className={styles.actEvents}>
                {act.events.map((event) => (
                  <span key={event.name} className={styles.eventLine}>
                    <span className={styles.eventMarker} aria-hidden="true">•</span>
                    <span>{event.name}</span>
                  </span>
                ))}
              </span>
              <span className={styles.actNote}>{act.note}</span>
            </span>
          </button>
        ))}
      </section>

      <p className={styles.scheduleNote}>Map pins show the confirmed focus areas. We’ll add the remaining gathering locations and times as plans are finalized.</p>
    </main>
  );
}
