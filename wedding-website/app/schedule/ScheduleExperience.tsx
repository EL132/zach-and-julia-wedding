import styles from "./schedule.module.css";

type TimelineRow = {
  weekday: string;
  date: string;
  label?: string;
  description?: string;
  events?: string[];
  note?: string;
  weddingWeekend?: boolean;
  weekendStart?: boolean;
  weddingDay?: boolean;
  weekendEnd?: boolean;
};

const timeline: TimelineRow[] = [
  {
    weekday: "Sunday–Wednesday",
    date: "August 8–11",
    label: "Optional Stockholm plans",
    description:
      "Julia & Zach will be in Stockholm. Guests are welcome to join them, but there’s no need to arrive early for these plans.",
  },
  {
    weekday: "Thursday",
    date: "August 12",
    label: "Julia & Zach arrive at Maryhill",
    note: "Guests do not need to arrive this day.",
  },
  {
    weekday: "Friday",
    date: "August 13",
    label: "Guest travel & arrival",
    description: "A day to travel to Maryhill and get settled before Saturday’s wedding weekend plans. No group events are listed.",
  },
  {
    weekday: "Saturday",
    date: "August 14",
    weddingWeekend: true,
    weekendStart: true,
    label: "Wedding weekend begins",
    events: ["Tennis tournament", "Sauna & cold plunge", "Welcome dinner"],
    note: "Dinner location and event times to follow.",
  },
  {
    weekday: "Sunday",
    date: "August 15",
    weddingWeekend: true,
    weddingDay: true,
    label: "Wedding day",
    events: ["Julia & Zach get married"],
    note: "Location and time to follow.",
  },
  {
    weekday: "Monday",
    date: "August 16",
    weddingWeekend: true,
    weekendEnd: true,
    events: ["Brunch"],
    note: "Location and time to follow.",
  },
];

export default function ScheduleExperience() {
  return (
    <main className={styles.page}>
      <section className={styles.scheduleSection} aria-labelledby="schedule-title">
        <h1 id="schedule-title">August 2027</h1>

        <table className={styles.itinerary}>
          <caption className={styles.visuallyHidden}>Julia and Zach’s wedding timeline for August 2027</caption>
          <thead>
            <tr>
              <th scope="col">Date &amp; day</th>
              <th scope="col">Plans</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((row) => (
              <tr
                key={row.date}
                className={[
                  row.weddingWeekend ? styles.weddingRow : "",
                  row.weekendStart ? styles.weekendStartRow : "",
                  row.weddingDay ? styles.weddingDayRow : "",
                  row.weekendEnd ? styles.weekendEndRow : "",
                ].filter(Boolean).join(" ") || undefined}
              >
                <th scope="row" className={styles.dateCell}>
                  <span>{row.weekday}</span>
                  <span>{row.date}</span>
                  {row.label ? <span className={styles.mobileLabel}>{row.label}</span> : null}
                </th>
                <td className={styles.planCell}>
                  <div className={styles.planCopy}>
                    {row.label ? <p className={styles.planLabel}>{row.label}</p> : null}
                    {row.description ? <p className={styles.description}>{row.description}</p> : null}
                    {row.events ? (
                      <ul className={styles.eventList}>
                        {row.events.map((event) => <li key={event}>{event}</li>)}
                      </ul>
                    ) : null}
                    {row.note ? <p className={styles.note}>{row.note}</p> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

      </section>
    </main>
  );
}
