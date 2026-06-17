/** Shared mock data for manage / detail progress note flows (POC). */

const SAMPLE_NOTE = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;

export const MOCK_PROGRESS_NOTES = [
  {
    id: 432,
    date: "January 3, 2026",
    detailDate: "July 23, 2025 - 11:32 am",
    practitioner: "John Doe",
    itemRelated: "Workout Session",
    protocolRelated: "Weight lose",
    status: "published",
    note: SAMPLE_NOTE,
  },
  {
    id: 431,
    date: "January 2, 2026",
    detailDate: "January 2, 2026 - 10:15 am",
    practitioner: "Matthew Lewis",
    itemRelated: "Blood Test",
    protocolRelated: "—",
    status: "published",
    note: "Panel reviewed; follow-up scheduled for lipid markers.",
  },
  {
    id: 430,
    date: "December 28, 2025",
    detailDate: "December 28, 2025 - 4:00 pm",
    practitioner: "Nicholas Jin",
    itemRelated: "Workout Session",
    protocolRelated: "Weight lose",
    status: "draft",
    note: "Draft: session notes pending practitioner review.",
  },
  {
    id: 429,
    date: "December 20, 2025",
    detailDate: "December 20, 2025 - 9:30 am",
    practitioner: "John Doe",
    itemRelated: "Consultation",
    protocolRelated: "—",
    status: "published",
    note: "Discussed adherence barriers and adjusted weekly targets.",
  },
  {
    id: 428,
    date: "December 12, 2025",
    detailDate: "December 12, 2025 - 2:45 pm",
    practitioner: "Matthew Lewis",
    itemRelated: "Blood Test",
    protocolRelated: "Metabolic panel",
    status: "published",
    note: "Results within expected range; continue current protocol.",
  },
  {
    id: 427,
    date: "December 5, 2025",
    detailDate: "December 5, 2025 - 11:00 am",
    practitioner: "Nicholas Jin",
    itemRelated: "Workout Session",
    protocolRelated: "—",
    status: "published",
    note: "Progress on compound lifts noted; minor form cues documented.",
  },
  {
    id: 426,
    date: "November 28, 2025",
    detailDate: "November 28, 2025 - 3:20 pm",
    practitioner: "John Doe",
    itemRelated: "Workout Session",
    protocolRelated: "Weight lose",
    status: "draft",
    note: "Draft intake from wearable sync — finalize next visit.",
  },
  {
    id: 425,
    date: "November 15, 2025",
    detailDate: "November 15, 2025 - 8:00 am",
    practitioner: "Matthew Lewis",
    itemRelated: "Consultation",
    protocolRelated: "—",
    status: "published",
    note: "Quarterly review completed; goals updated in care plan.",
  },
];

export function getProgressNoteById(noteId) {
  const id = Number(noteId);
  if (Number.isNaN(id)) return undefined;
  return MOCK_PROGRESS_NOTES.find((n) => n.id === id);
}
