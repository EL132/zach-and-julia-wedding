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
  title: "Ask the wedding weekend assistant",
  intro:
    "Need a hand with travel notes, RSVP details, registry timing, or the flow of the weekend? Ask here and we’ll keep it short, warm, and useful.",
  emptyEyebrow: "Hej from the guest desk",
  emptyTitle: "Ask about arrivals, outfits, RSVPs, or where Swedish coffee fits into the plan.",
  emptyBody:
    "Julia & Zach are still filling in a few details, so some answers may arrive fashionably closer to August 2027.",
  suggestedLabel: "A few good questions",
  suggestedQuestions: [
    "When should I plan to arrive in Helsingborg?",
    "What will the weekend schedule include?",
    "Where will travel details be posted?",
    "How do I RSVP?",
  ],
  placeholder: "Ask about the wedding weekend...",
  loadingMessage: "Checking the guest notes...",
  fallbackResponse:
    "I checked with Zlatan, the meatballs, and the frozen harbor breeze, but they’re all being mysterious. Check back soon or ask Julia & Zach directly.",
  errorResponse:
    "The guest assistant lost its place for a moment. Please try again, or ask Julia & Zach directly.",
};
