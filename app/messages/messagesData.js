/** POC seed data — messages inbox, per-thread history, and compose targets. */

export const INBOX_THREADS = [
  {
    threadId: "john-doe",
    memberName: "John Doe",
    lastAtISO: "2026-03-03T15:15:00.000Z",
    displayDate: "3/3/26 - 10:15AM",
    lastFrom: "John Doe",
    preview: "Hey, can you help me with a workout plan that fits my schedule?",
    unread: true,
  },
  {
    threadId: "stephen-m",
    memberName: "Stephen M.",
    lastAtISO: "2026-03-02T18:30:00.000Z",
    displayDate: "3/2/26 - 1:30PM",
    lastFrom: "Stephen M.",
    preview: "Thanks for the supplement notes — quick question on timing with meals.",
    unread: true,
  },
  {
    threadId: "maya-k",
    memberName: "Maya K.",
    lastAtISO: "2026-03-01T09:00:00.000Z",
    displayDate: "3/1/26 - 4:00AM",
    lastFrom: "You",
    preview: "Sounds good — I’ll send the lab requisition link shortly.",
    unread: false,
  },
  {
    threadId: "alex-r",
    memberName: "Alex R.",
    lastAtISO: "2026-02-28T14:20:00.000Z",
    displayDate: "2/28/26 - 9:20AM",
    lastFrom: "Alex R.",
    preview: "What are the main goals I should focus on for my fitness journey?",
    unread: false,
  },
  {
    threadId: "casey-brown",
    memberName: "Casey Brown",
    lastAtISO: "2026-02-27T11:45:00.000Z",
    displayDate: "2/27/26 - 6:45AM",
    lastFrom: "Casey Brown",
    preview: "Can we reschedule the check-in to Thursday afternoon?",
    unread: false,
  },
  {
    threadId: "chris-johnson",
    memberName: "Chris Johnson",
    lastAtISO: "2026-02-26T16:00:00.000Z",
    displayDate: "2/26/26 - 11:00AM",
    lastFrom: "You",
    preview: "Welcome aboard — here is the link to your onboarding checklist.",
    unread: false,
  },
  {
    threadId: "jordan-lee",
    memberName: "Jordan Lee",
    lastAtISO: "2026-02-25T20:10:00.000Z",
    displayDate: "2/25/26 - 3:10PM",
    lastFrom: "Jordan Lee",
    preview: "Sleep protocol is helping — should I keep the same magnesium dose?",
    unread: false,
  },
  {
    threadId: "sam-patel",
    memberName: "Sam Patel",
    lastAtISO: "2026-02-24T08:30:00.000Z",
    displayDate: "2/24/26 - 3:30AM",
    lastFrom: "Sam Patel",
    preview: "Uploaded the food log — let me know if anything stands out.",
    unread: false,
  },
  {
    threadId: "taylor-morgan",
    memberName: "Taylor Morgan",
    lastAtISO: "2026-02-23T13:00:00.000Z",
    displayDate: "2/23/26 - 8:00AM",
    lastFrom: "You",
    preview: "Great progress on hydration — next week we’ll layer in electrolytes.",
    unread: false,
  },
  {
    threadId: "riley-nguyen",
    memberName: "Riley Nguyen",
    lastAtISO: "2026-02-22T19:45:00.000Z",
    displayDate: "2/22/26 - 2:45PM",
    lastFrom: "Riley Nguyen",
    preview: "Minor headache after the new stack — should I pause anything?",
    unread: false,
  },
  {
    threadId: "quinn-walsh",
    memberName: "Quinn Walsh",
    lastAtISO: "2026-02-21T10:15:00.000Z",
    displayDate: "2/21/26 - 5:15AM",
    lastFrom: "Quinn Walsh",
    preview: "Traveling next week — any tips for sticking to the plan on the road?",
    unread: false,
  },
  {
    threadId: "jamie-ortiz",
    memberName: "Jamie Ortiz",
    lastAtISO: "2026-02-20T22:00:00.000Z",
    displayDate: "2/20/26 - 5:00PM",
    lastFrom: "You",
    preview: "Lab results look solid — I’ll outline the small tweaks in your plan.",
    unread: false,
  },
  {
    threadId: "drew-kim",
    memberName: "Drew Kim",
    lastAtISO: "2026-02-19T14:30:00.000Z",
    displayDate: "2/19/26 - 9:30AM",
    lastFrom: "Drew Kim",
    preview: "Strength numbers are up — curious if we should add a deload week.",
    unread: false,
  },
  {
    threadId: "blake-avery",
    memberName: "Blake Avery",
    lastAtISO: "2026-02-18T09:20:00.000Z",
    displayDate: "2/18/26 - 4:20AM",
    lastFrom: "Blake Avery",
    preview: "Morning routine is locked in. Thanks for the accountability nudges.",
    unread: false,
  },
  {
    threadId: "morgan-chen",
    memberName: "Morgan Chen",
    lastAtISO: "2026-02-17T17:00:00.000Z",
    displayDate: "2/17/26 - 12:00PM",
    lastFrom: "You",
    preview: "Protocol PDF is attached — skim the training block on page 3.",
    unread: false,
  },
  {
    threadId: "reese-hall",
    memberName: "Reese Hall",
    lastAtISO: "2026-02-16T12:40:00.000Z",
    displayDate: "2/16/26 - 7:40AM",
    lastFrom: "Reese Hall",
    preview: "GI symptoms improved after the probiotic swap. Anything else to watch?",
    unread: false,
  },
  {
    threadId: "skyler-brooks",
    memberName: "Skyler Brooks",
    lastAtISO: "2026-02-15T21:10:00.000Z",
    displayDate: "2/15/26 - 4:10PM",
    lastFrom: "Skyler Brooks",
    preview: "Could you confirm the fasting window before the metabolic panel?",
    unread: false,
  },
  {
    threadId: "cameron-fox",
    memberName: "Cameron Fox",
    lastAtISO: "2026-02-14T08:55:00.000Z",
    displayDate: "2/14/26 - 3:55AM",
    lastFrom: "You",
    preview: "Happy to walk through the recovery metrics on our next call.",
    unread: false,
  },
  {
    threadId: "parker-reed",
    memberName: "Parker Reed",
    lastAtISO: "2026-02-13T15:25:00.000Z",
    displayDate: "2/13/26 - 10:25AM",
    lastFrom: "Parker Reed",
    preview: "Mindfulness block is easier than I expected — should I extend it?",
    unread: false,
  },
  {
    threadId: "avery-james",
    memberName: "Avery James",
    lastAtISO: "2026-02-12T11:05:00.000Z",
    displayDate: "2/12/26 - 6:05AM",
    lastFrom: "Avery James",
    preview: "Work stress spiked — any quick breathwork drills you recommend?",
    unread: false,
  },
  {
    threadId: "rowan-ellis",
    memberName: "Rowan Ellis",
    lastAtISO: "2026-02-11T18:50:00.000Z",
    displayDate: "2/11/26 - 1:50PM",
    lastFrom: "You",
    preview: "Yes — keep the mobility circuit twice weekly through month end.",
    unread: false,
  },
  {
    threadId: "sage-morales",
    memberName: "Sage Morales",
    lastAtISO: "2026-02-10T07:15:00.000Z",
    displayDate: "2/10/26 - 2:15AM",
    lastFrom: "Sage Morales",
    preview: "Allergies acting up — is there a swap for the evening herbal blend?",
    unread: false,
  },
];

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.";

/** Full thread lines for detail view (member-facing + coach replies). */
export const THREAD_MESSAGES_BY_ID = {
  "john-doe": [
    { id: "jd-1", displayDate: "3/3/26 - 10:15AM", from: "John Doe", body: LOREM },
    { id: "jd-2", displayDate: "3/3/26 - 10:22AM", from: "You", body: "Thanks for the detail — I’ll review and send an updated plan by end of day." },
    { id: "jd-3", displayDate: "3/3/26 - 10:40AM", from: "John Doe", body: "What are the main goals I should focus on for my fitness journey?" },
    { id: "jd-4", displayDate: "3/3/26 - 11:05AM", from: "You", body: "Short term: consistent training frequency and sleep. Medium term: progressive overload on two compound lifts you enjoy." },
    { id: "jd-5", displayDate: "3/3/26 - 11:30AM", from: "John Doe", body: LOREM },
    { id: "jd-6", displayDate: "3/3/26 - 12:00PM", from: "You", body: "Noted on the schedule constraints — we’ll bias shorter sessions Tue/Thu." },
    { id: "jd-7", displayDate: "3/3/26 - 12:45PM", from: "John Doe", body: "Perfect. I’ll try the template you sent and report back Friday." },
    { id: "jd-8", displayDate: "3/3/26 - 1:10PM", from: "You", body: "Sounds good. Ping me if anything feels off during the first week." },
  ],
  "stephen-m": [
    { id: "sm-1", displayDate: "3/2/26 - 1:30PM", from: "Stephen M.", body: "Thanks for the supplement notes — quick question on timing with meals." },
    { id: "sm-2", displayDate: "3/2/26 - 2:00PM", from: "You", body: "Take the morning stack within 30 minutes of breakfast; evening magnesium 60–90 minutes before bed." },
  ],
  "maya-k": [
    { id: "mk-1", displayDate: "3/1/26 - 4:00AM", from: "Maya K.", body: "Can you confirm the GI-MAP window before I book?" },
    { id: "mk-2", displayDate: "3/1/26 - 4:15AM", from: "You", body: "Sounds good — I’ll send the lab requisition link shortly." },
  ],
  "alex-r": [
    { id: "ar-1", displayDate: "2/28/26 - 9:20AM", from: "Alex R.", body: "What are the main goals I should focus on for my fitness journey?" },
    { id: "ar-2", displayDate: "2/28/26 - 9:45AM", from: "You", body: "We’ll anchor on strength 3x/week, daily steps, and one recovery modality you’ll actually use." },
  ],
};

export function getInboxThreadById(threadId) {
  return INBOX_THREADS.find((t) => t.threadId === threadId) ?? null;
}

export function getThreadMessages(threadId) {
  const lines = THREAD_MESSAGES_BY_ID[threadId];
  if (lines?.length) return lines;
  const meta = getInboxThreadById(threadId);
  if (!meta) return [];
  return [
    {
      id: `${threadId}-only`,
      displayDate: meta.displayDate,
      from: meta.lastFrom,
      body: meta.preview,
    },
  ];
}

export const NEW_MESSAGE_MEMBER_OPTIONS = INBOX_THREADS.map((t) => ({
  value: t.threadId,
  label: t.memberName,
}));
