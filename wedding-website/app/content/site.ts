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

export const rsvpContent = {
  eyebrow: "JULIA & ZACH · MARYHILL ESTATE",
  title: "Kindly Reply",
  intro:
    "We would be honored to celebrate with you. Please let us know your plans for the weekend.",
  card: {
    label: "RSVP",
    venue: "Maryhill Estate",
    location: "Helsingborg, Sweden",
    date: "August 2027",
    responseLabel: "Kindly respond by",
    responseDate: "Date coming soon",
    note: "Your response helps us prepare the weekend with care.",
  },
  success: {
    title: "Thank you — your RSVP has been received.",
    body: "We are so grateful to celebrate with you.",
  },
};

export const ourStoryContent = {
  eyebrow: "JULIA & ZACH · OUR STORY",
  title: "Our Story",
  introLine: "Six years, five cities, one wedding weekend in Sweden.",
  prologue: {
    label: "THE BEGINNING",
    paragraphs: [
      "Almost six years to the day after we started dating, we’ll be getting married at Maryhill Estate.",
      "We met on Tinder — still unclear why they haven’t sponsored us — and somehow, after one first date, both left convinced something real had happened.",
      "That was the beginning of our forever: laughing together across Atlanta, Philly, Manhattan, Stockholm, and Boston. We love you and can’t wait to celebrate with you all.",
    ],
  },
  debrief: {
    title: "First Date Debrief",
    intro: "Two versions. Same conclusion.",
    cards: [
      {
        label: "EXHIBIT I",
        title: "Julia’s Debrief",
        body:
          "After Zach dropped me off at my college apartment — shoutout 3934 — I blasted Miley Cyrus, ran into Liv’s room, and declared that I had met the love of my life.",
        note: "Liv promptly told me to go to bed.",
      },
      {
        label: "EXHIBIT II",
        title: "Zach’s Debrief",
        body:
          "On the drive back to Malvern, Zach called his cousin Ainsley and declared he had found ‘a genuine connection.’",
        note: "They had been watching a lot of Love Island that summer.",
      },
    ],
  },
  routeLine: "ATLANTA → PHILLY → MANHATTAN → STOCKHOLM → BOSTON → MARYHILL",
  timelineTitle: "Six Years to Maryhill",
  timeline: [
    {
      year: "2021",
      title: "Junior Year Formal",
      text: "An early chapter, before forever had a name.",
    },
    {
      year: "2022",
      title: "Senior Year Formal",
      text: "An early chapter, already full of certainty.",
    },
    {
      year: "2023",
      title: "Maine",
      text: "The kind of trip that becomes part of the story without trying.",
    },
    {
      year: "2024",
      title: "Sweden & Norway",
      text:
        "A summer that made Scandinavia feel less like a destination and more like part of us.",
    },
    {
      year: "2025",
      title: "Engagement",
      text: "The question that turned the next chapter into a plan.",
    },
    {
      year: "2026",
      title: "Finding Maryhill",
      text:
        "Back in Sweden, this time looking for the place where we’d bring everyone together.",
    },
    {
      year: "2027",
      title: "Maryhill Estate",
      text: "The weekend we get to celebrate it all with you.",
    },
  ],
  closing: {
    title:
      "And that was the beginning of our forever — laughing together across Atlanta, Philly, Manhattan, Stockholm, and Boston.",
    body: "We love you and can’t wait to celebrate with you.",
    links: [
      { href: "/gallery", label: "View the Gallery →" },
      { href: "/rsvp", label: "RSVP →" },
    ],
  },
};

export const travelContent = {
  eyebrow: "JULIA & ZACH · MARYHILL ESTATE",
  title: "Travel",
  intro:
    "The easiest route to the wedding weekend is through Copenhagen Airport, unless you are spending the week beforehand in Stockholm.",
  startHere: {
    title: "Start Here",
    heading: "For most guests, Copenhagen Airport is the easiest arrival point.",
    body:
      "If you are traveling directly to the wedding weekend, plan to fly into Copenhagen Airport. If you are joining us in Stockholm earlier in the week, Stockholm may make more sense for your arrival — but for the wedding itself, Copenhagen is the simpler route.",
  },
  routeCards: [
    {
      title: "For the wedding weekend",
      heading: "Fly into Copenhagen Airport",
      label: "Recommended",
      body: "Best for guests coming directly to the celebration.",
      routeHint: "CPH → Helsingborg → Maryhill",
    },
    {
      title: "If you are spending the week in Stockholm",
      heading: "Arrive through Stockholm",
      body:
        "Best for guests joining earlier plans before traveling south for the wedding weekend.",
      routeHint: "Stockholm → Helsingborg → Maryhill",
    },
  ],
  timeline: [
    {
      label: "Copenhagen Airport",
      description:
        "The recommended arrival airport and the easiest gateway for most guests.",
    },
    {
      label: "Helsingborg",
      description:
        "Cross the Øresund Bridge into Skåne, then continue north toward the coast.",
    },
    {
      label: "Maryhill Estate",
      description:
        "The celebration will take place in Glumslöv, a small village by the sea.",
    },
  ],
  detailSections: [
    {
      title: "From Copenhagen Airport",
      body:
        "Despite being in Sweden, the easiest and most well-connected gateway to the venue is Copenhagen Airport. It is the largest hub in Scandinavia and sits about 50 km from Glumslöv via the Øresund Bridge.",
      notes: [
        "Taxi or rideshare directly from Copenhagen Airport to Glumslöv takes about 45–55 minutes and is the simplest door-to-door option.",
        "Rental cars are available at the arrivals terminal and offer the most flexibility for exploring Skåne during the weekend.",
        "Train plus taxi is a comfortable option: take the Øresund train toward Sweden, connect through Malmö or Landskrona, then take a short taxi to the venue.",
        "FlixBus to Lund plus a taxi is another possible route, though it takes longer.",
      ],
    },
    {
      title: "From Stockholm",
      body:
        "Stockholm Arlanda is Sweden's largest international airport, but it is about 600 km from Glumslöv. This route mainly makes sense if you are spending the week leading up to the wedding in Stockholm before traveling south.",
      notes: [
        "Plan on roughly 5.5–6 hours by train from Stockholm toward southern Sweden.",
        "If you are traveling directly to the wedding weekend, Copenhagen will usually be simpler.",
      ],
    },
    {
      title: "From Helsingborg",
      body:
        "Maryhill Estate is in Glumslöv, near the Helsingborg and Landskrona area. Local taxi or rideshare details will be shared closer to the weekend.",
      notes: ["Details coming soon."],
    },
    {
      title: "Getting around locally",
      body:
        "Taxi, rideshare, train, bus, and rental car options are all available depending on your arrival time, luggage, and how much flexibility you want.",
      notes: [
        "Apps such as Bolt, Uber, Lyft, and Cabonline may be useful in the Copenhagen, Malmö, and Skåne areas.",
        "If driving, Sweden drives on the right side of the road, speed limits are posted in km/h, and headlights should be on at all times.",
        "Most gas stations accept credit cards, though AMEX may not always be accepted.",
      ],
    },
    {
      title: "Where to stay",
      body:
        "Glumslöv is a small village, so we recommend staying at the venue. We will pre-book all the rooms needed for the two nights of August 14 and 15 and will communicate booking instructions as it gets closer; there is no need to book your room at this time. Please don’t book directly through Maryhill, as we have negotiated discounted rates for our guests. However, if you would like to stay at Maryhill beyond the nights of August 14 and August 15, please coordinate directly with the hotel for those additional nights.",
      notes: ["Do not book rooms directly through Maryhill for August 14 and 15."],
    },
    {
      title: "Local notes",
      body:
        "A few practical details for planning your time in Sweden.",
      notes: [
        "August in Skåne is usually 20–25°C / 68–77°F with long, light-filled evenings. Pack a light layer for cooler nights.",
        "Sweden uses the Swedish Krona, but credit and debit cards are widely accepted. You do not need to bring cash.",
        "English is spoken very widely throughout Sweden, especially in Skåne.",
        "Sweden uses Type F plugs and 230V/50Hz current. US travelers should bring a plug adapter.",
        "Most major US carriers offer international plans that include Sweden. Check with your provider before traveling.",
        "Travelers should make sure passports are current. ETIAS travel authorization is expected for many European destinations, including Sweden, beginning in 2027.",
      ],
    },
  ],
  cta: {
    title: "Still deciding how to get there?",
    body:
      "The Guest Concierge can help with travel questions, timing, and route details.",
    label: "Ask the Guest Concierge →",
    href: "/faqs",
  },
  fieldResearch: {
    mainLine:
      "Zach has been dispatched to finalize the logistics. Early reports suggest sparks are flying.",
    caption: "Field research, apparently.",
    image: {
      src: "/chat-photos/working-on-it.JPG",
      alt: "Zach working in a workshop with sparks flying",
    },
  },
};

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
