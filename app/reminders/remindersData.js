/** POC seed data — sent reminders list & detail views. */
export const REMINDERS_SENT = [
  {
    id: "55450",
    createdAt: "2026-02-02T14:01:00.000Z",
    displayDate: "2/2/26 - 9:01AM",
    to: "Casey Brown",
    title: "Check your tasks!",
    description: "Reminder to check in with your CSM about supplement timing and upcoming lab work.",
  },
  {
    id: "55451",
    createdAt: "2026-02-02T14:01:00.000Z",
    displayDate: "2/2/26 - 9:01AM",
    to: "John Doe",
    title: "Check your tasks!",
    description: "Reminder to check in with your CSM about your weekly goals and protocol adherence.",
  },
  {
    id: "55449",
    createdAt: "2026-02-01T16:30:00.000Z",
    displayDate: "2/1/26 - 11:30AM",
    to: "Chris Johnson",
    title: "Welcome to LifeMuse team!",
    description: "Concierge is ready for your request — reply here or book time on the member portal.",
  },
  {
    id: "55448",
    createdAt: "2026-01-30T10:00:00.000Z",
    displayDate: "1/30/26 - 5:00AM",
    to: "Maya K.",
    title: "Lab prep checklist",
    description: "Please fast 12 hours before your draw and bring your requisition form to the clinic.",
  },
  {
    id: "55447",
    createdAt: "2026-01-28T18:45:00.000Z",
    displayDate: "1/28/26 - 1:45PM",
    to: "Alex R.",
    title: "Consent signature needed",
    description: "Your training block consent is still outstanding — tap to review and sign electronically.",
  },
  {
    id: "55446",
    createdAt: "2026-01-25T09:15:00.000Z",
    displayDate: "1/25/26 - 4:15AM",
    to: "Casey Brown",
    title: "Weekly check-in",
    description: "How are energy levels and sleep this week? Log symptoms in the app by Friday.",
  },
  {
    id: "55445",
    createdAt: "2026-01-22T13:20:00.000Z",
    displayDate: "1/22/26 - 8:20AM",
    to: "Chris Johnson",
    title: "Appointment follow-up",
    description: "Notes from your last visit are ready. Review any supplement changes with your clinician.",
  },
  {
    id: "55444",
    createdAt: "2026-01-18T22:00:00.000Z",
    displayDate: "1/18/26 - 5:00PM",
    to: "John Doe",
    title: "Hydration reminder",
    description: "Target 90 oz water today — especially important ahead of your DEXA scan.",
  },
  {
    id: "55443",
    createdAt: "2026-01-15T11:05:00.000Z",
    displayDate: "1/15/26 - 6:05AM",
    to: "Maya K.",
    title: "Protocol updated",
    description: "Your clinician adjusted evening magnesium timing — see the supplements pillar for details.",
  },
  {
    id: "55442",
    createdAt: "2026-01-12T15:40:00.000Z",
    displayDate: "1/12/26 - 10:40AM",
    to: "Alex R.",
    title: "Diagnostics prep",
    description: "GI-MAP collection kit ships tomorrow — watch the instructional video in your resources.",
  },
  {
    id: "55441",
    createdAt: "2026-01-08T08:00:00.000Z",
    displayDate: "1/8/26 - 3:00AM",
    to: "Casey Brown",
    title: "Message from care team",
    description: "We left a note about your last lab — no action needed unless you have questions.",
  },
  {
    id: "55440",
    createdAt: "2026-01-05T19:30:00.000Z",
    displayDate: "1/5/26 - 2:30PM",
    to: "Chris Johnson",
    title: "Renew supplement autoship",
    description: "Your stack renews in 5 days — confirm shipping address in billing settings.",
  },
];

export const ASSIGN_TO_OPTIONS = ["Casey Brown", "Chris Johnson", "John Doe", "Maya K.", "Alex R."];

export function getReminderById(id) {
  return REMINDERS_SENT.find((r) => r.id === String(id));
}
