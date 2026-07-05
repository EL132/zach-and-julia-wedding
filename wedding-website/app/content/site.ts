export const couple = {
  displayName: "Julia & Zach",
  possessiveName: "Julia & Zach's",
};

export const homePageContent = {
  hero: {
    eyebrow: "A weekend in Helsingborg",
    title: couple.displayName,
    subtitle: "August 2027 · Helsingborg, Sweden",
    supportingCopy:
      "We can’t wait to celebrate with you. Explore the weekend details, travel notes, photos, and RSVP when you’re ready.",
  },
  story: {
    eyebrow: "The story begins",
    title: "Quiet moments, stone terraces, and a soft hush before the celebration.",
    body:
      "Our weekend is gathered around the people we love most, with room for slow mornings, candlelit dinners, and the joy of being together.",
  },
  galleryNote: {
    eyebrow: "A refined story",
    body:
      "Each photograph is a chapter in a quiet day: the light between leaves, the stillness of stone, the cadence of footsteps toward the house.",
  },
  cta: {
    eyebrow: "The weekend awaits",
    title: "Join us in Helsingborg",
  },
};

export type NavChild = {
  href: string;
  label: string;
};

export type NavItem = {
  href?: string;
  label: string;
  emphasized?: boolean;
  children?: NavChild[];
  activeHrefs?: string[];
};

export const navigationItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/registry", label: "Registry" },
  {
    label: "Schedule",
    activeHrefs: ["/schedule", "/events"],
    children: [
      { href: "/schedule/week-of", label: "Week of" },
      { href: "/schedule/weekend", label: "Weekend" },
    ],
  },
  { href: "/travel", label: "Travel" },
  {
    label: "Our People",
    activeHrefs: ["/our-people", "/wedding-party"],
    children: [
      { href: "/our-people/our-story", label: "Our Story" },
      { href: "/our-people/wedding-party", label: "Wedding Party" },
    ],
  },
  { href: "/rsvp", label: "RSVP", emphasized: true },
  { href: "/faqs", label: "FAQs" },
];

export const chatContent = {
  pageEyebrow: "JULIA & ZACH · MARYHILL ESTATE",
  pageTitle: "Guest Questions",
  pageIntro:
    "Everything you may need to know before the weekend. Ask below, or browse a few common questions.",
  title: "Guest Concierge",
  intro:
    "Ask about travel, the weekend schedule, RSVP details, attire, or local recommendations.",
  commonQuestionsTitle: "Common Questions",
  commonQuestionsIntro: "A few starting points for the details guests ask about most.",
  emptyEyebrow: "Guest desk",
  emptyTitle: "Send a note and the concierge will look through the estate notes.",
  emptyBody:
    "Some details are still being refined, but this is the right place to ask.",
  suggestedLabel: "Common questions",
  suggestedQuestions: [
    "When should we plan to arrive?",
    "Where should we stay?",
    "How do we RSVP?",
    "What should we wear?",
    "What should we do nearby?",
  ],
  placeholder: "Ask about the wedding weekend...",
  loadingMessage: "Currently phoning Julia & Zach for the answers",
  fallbackResponse:
    "I checked the estate notes, then sent Zach to investigate. He returned without an answer, but with a truly excellent piece of wood. Julia & Zach may need to weigh in on this one.",
  fallbackImage: {
    src: "/chat-photos/wood.jpg",
    alt: "Zach holding a piece of wood",
  },
  errorResponse:
    "The guest assistant lost its place for a moment. Please try again, or ask Julia & Zach directly.",
};
