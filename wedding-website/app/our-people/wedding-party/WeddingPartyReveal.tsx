import Image from "next/image";
import styles from "./wedding-party.module.css";

type PartyPerson = {
  id: string;
  name: string;
  image: string;
  alt: string;
  role?: string;
  objectPosition?: string;
};

const juliaSide: PartyPerson[] = [
  { id: "brynn", name: "Brynn", image: "/wedding-party/brynn.jpg", alt: "Brynn on a wooded road", role: "Maid of Honor" },
  { id: "mara", name: "Mara", image: "/wedding-party/mara.jpg", alt: "Mara at a flower-filled garden reception", role: "Maid of Honor" },
  { id: "sabrina", name: "Sabrina", image: "/wedding-party/sabrina.jpg", alt: "Sabrina on a cobblestone street" },
  { id: "meghan", name: "Meghan", image: "/wedding-party/meghan.jpg", alt: "Meghan at a coastal overlook" },
  { id: "sidney", name: "Sidney", image: "/wedding-party/sidney.jpg", alt: "Sidney by the water" },
  { id: "ella", name: "Ella", image: "/wedding-party/ella.jpg", alt: "Ella by the water in a blue patterned top" },
  { id: "ana", name: "Ana", image: "/wedding-party/ana.jpg", alt: "Ana in a light floral dress at an overlook" },
  { id: "olivia", name: "Olivia", image: "/wedding-party/olivia.jpg", alt: "Olivia by the coast at sunset" },
];

const zachSide: PartyPerson[] = [
  { id: "elias", name: "Elias", image: "/wedding-party/elias-lind-current.png", alt: "Elias outdoors in a green turtleneck", role: "Best Man", objectPosition: "center 10%" },
  { id: "lucas", name: "Lucas", image: "/wedding-party/groomsman-img-8344.jpeg", alt: "Lucas in a blue striped shirt against a green background", role: "Best Man" },
  { id: "ben", name: "Ben", image: "/wedding-party/ben.jpg", alt: "Ben smiling in a suit", role: "Best Man" },
  { id: "drew", name: "Drew", image: "/wedding-party/drew.jpg", alt: "Drew taking a mirror selfie while holding his baby", role: "Toastmaster", objectPosition: "center 32%" },
  { id: "linus", name: "Linus", image: "/wedding-party/groomsman-linus.jpeg", alt: "Linus with his baby on the beach" },
  { id: "alex", name: "Alex", image: "/wedding-party/groomsman-left-portrait.jpeg", alt: "Alex in a light suit by the water" },
  { id: "chris", name: "Chris", image: "/wedding-party/groomsman-dscf1613.jpeg", alt: "Chris in a dark jacket" },
  { id: "fred", name: "Fred", image: "/wedding-party/fred.jpg", alt: "Fred taking a selfie in a convertible" },
  { id: "skylar", name: "Skylar", image: "/wedding-party/groomsman-image.jpg", alt: "Skylar holding a cocktail at a party" },
  { id: "grant", name: "Grant", image: "/wedding-party/grant.jpg", alt: "Grant in a black tuxedo and bow tie" },
];

function PersonRow({ person }: { person: PartyPerson }) {
  return (
    <li className={styles.personRow}>
      <span className={styles.portrait}>
        <Image
          src={person.image}
          alt={person.alt}
          fill
          sizes="64px"
          className={styles.portraitImage}
          style={{ objectPosition: person.objectPosition ?? "center" }}
        />
      </span>
      <span className={styles.personName}>{person.name}</span>
      {person.role ? <span className={styles.personRole}>{person.role}</span> : null}
    </li>
  );
}

export default function WeddingPartyReveal() {
  const maidsOfHonor = juliaSide.slice(0, 2);
  const bridesmaids = juliaSide.slice(2);

  return (
    <main className={styles.page}>
      <figure className={styles.groupPhoto}>
        <Image
          src="/wedding-party/group-photo.jpg"
          alt="Julia and Zach with family and friends"
          width={5546}
          height={3697}
          priority
          sizes="100vw"
          className={styles.groupPhotoImage}
        />
      </figure>

      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <p>Julia &amp; Zach · Our people</p>
          <h1>The wedding party</h1>
        </header>

        <div className={styles.sides}>
          <section className={styles.side} aria-labelledby="julias-side-title">
            <div className={styles.sideHeading}>
              <h2 id="julias-side-title">Julia’s side</h2>
            </div>

            <div className={styles.honorGroup}>
              <p className={styles.honorLabel}>Maids of Honor</p>
              <ul className={styles.roster}>
                {maidsOfHonor.map((person) => <PersonRow key={person.id} person={person} />)}
              </ul>
            </div>

            <ul className={styles.roster}>
              {bridesmaids.map((person) => <PersonRow key={person.id} person={person} />)}
            </ul>
          </section>

          <section className={styles.side} aria-labelledby="zachs-side-title">
            <div className={styles.sideHeading}>
              <h2 id="zachs-side-title">Zach’s side</h2>
            </div>
            <ul className={styles.roster}>
              {zachSide.map((person) => <PersonRow key={person.id} person={person} />)}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
