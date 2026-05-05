/**
 * Care plan line items (POC). Originate from assigned protocol builder content.
 * Status values: unscheduled | overdue | scheduled | completed — all unscheduled until wired.
 */
export const CARE_PLAN_ITEM_STATUSES = ["unscheduled", "overdue", "scheduled", "completed"];

/** @type {{ id: string, dueDate: string, dueAt: string, itemName: string, type: string, protocol: string, pillar: string, provider: string, status: string }[]} */
export const MOCK_MANAGE_CARE_PLAN_ROWS = [
  {
    id: "cp-1",
    dueDate: "1/18/26 - 11:30 AM",
    dueAt: "2026-01-18T11:30:00",
    itemName: "Blood Test",
    type: "Session",
    protocol: "Weight Loss",
    pillar: "Diagnostics",
    provider: "Stephen Smith",
    status: "unscheduled",
    sessionSubtype: "Blood Work Panel",
    providersDetail: "Stephen Smith, Daniel J Aranda",
    contextWhat:
      "This session covers your ordered blood work panel. Arrive fasted if your requisition requires it, and bring photo ID and your lab form.",
    contextExpectations: "Results typically post within 5–7 business days; you will be notified in the app when they are ready for review.",
    contextWhy: "Baseline and follow-up labs help your care team tune supplements, nutrition, and training blocks to your biology.",
  },
  { id: "cp-2", dueDate: "1/17/26 - 9:00 AM", dueAt: "2026-01-17T09:00:00", itemName: "Red Light", type: "Session", protocol: "Weight Loss", pillar: "Regeneration", provider: "John Doe", status: "unscheduled" },
  { id: "cp-3", dueDate: "1/16/26 - 2:15 PM", dueAt: "2026-01-16T14:15:00", itemName: "Therapy", type: "Session", protocol: "Mental Health", pillar: "Recovery", provider: "Dr. Monroe", status: "unscheduled" },
  { id: "cp-4", dueDate: "1/15/26 - 10:00 AM", dueAt: "2026-01-15T10:00:00", itemName: "DEXA Scan", type: "Session", protocol: "Weight Loss", pillar: "Diagnostics", provider: "Stephen Smith", status: "unscheduled" },
  { id: "cp-5", dueDate: "1/14/26 - 8:30 AM", dueAt: "2026-01-14T08:30:00", itemName: "Cryotherapy", type: "Session", protocol: "Weight Loss", pillar: "Recovery", provider: "John Doe", status: "unscheduled" },
  { id: "cp-6", dueDate: "1/13/26 - 4:00 PM", dueAt: "2026-01-13T16:00:00", itemName: "Sauna Session", type: "Session", protocol: "Mental Health", pillar: "Regeneration", provider: "Dr. Monroe", status: "unscheduled" },
  { id: "cp-7", dueDate: "1/12/26 - 11:00 AM", dueAt: "2026-01-12T11:00:00", itemName: "Nutrition consult", type: "Session", protocol: "Weight Loss", pillar: "Nutrition", provider: "Stephen Smith", status: "unscheduled" },
  { id: "cp-8", dueDate: "1/11/26 - 1:45 PM", dueAt: "2026-01-11T13:45:00", itemName: "Massage", type: "Session", protocol: "Mental Health", pillar: "Recovery", provider: "John Doe", status: "unscheduled" },
  { id: "cp-9", dueDate: "1/10/26 - 9:30 AM", dueAt: "2026-01-10T09:30:00", itemName: "GI-MAP prep", type: "Session", protocol: "Weight Loss", pillar: "Diagnostics", provider: "Dr. Monroe", status: "unscheduled" },
  { id: "cp-10", dueDate: "1/9/26 - 3:00 PM", dueAt: "2026-01-09T15:00:00", itemName: "Acupuncture", type: "Session", protocol: "Mental Health", pillar: "Recovery", provider: "Stephen Smith", status: "unscheduled" },
  { id: "cp-11", dueDate: "1/8/26 - 10:15 AM", dueAt: "2026-01-08T10:15:00", itemName: "Follow-up labs", type: "Session", protocol: "Weight Loss", pillar: "Diagnostics", provider: "John Doe", status: "unscheduled" },
  { id: "cp-12", dueDate: "1/7/26 - 12:00 PM", dueAt: "2026-01-07T12:00:00", itemName: "Hyperbaric", type: "Session", protocol: "Weight Loss", pillar: "Regeneration", provider: "Dr. Monroe", status: "unscheduled" },
  { id: "cp-13", dueDate: "1/6/26 - 8:00 AM", dueAt: "2026-01-06T08:00:00", itemName: "Stretch session", type: "Session", protocol: "Mental Health", pillar: "Recovery", provider: "Stephen Smith", status: "unscheduled" },
  { id: "cp-14", dueDate: "1/5/26 - 2:30 PM", dueAt: "2026-01-05T14:30:00", itemName: "Coach check-in", type: "Session", protocol: "Weight Loss", pillar: "Training", provider: "John Doe", status: "unscheduled" },
  { id: "cp-15", dueDate: "1/4/26 - 11:30 AM", dueAt: "2026-01-04T11:30:00", itemName: "Supplement review", type: "Session", protocol: "Mental Health", pillar: "Supplements", provider: "Dr. Monroe", status: "unscheduled" },
  { id: "cp-16", dueDate: "1/3/26 - 9:45 AM", dueAt: "2026-01-03T09:45:00", itemName: "MRI prep", type: "Session", protocol: "Weight Loss", pillar: "Diagnostics", provider: "Stephen Smith", status: "unscheduled" },
  { id: "cp-17", dueDate: "1/2/26 - 4:15 PM", dueAt: "2026-01-02T16:15:00", itemName: "Cold plunge", type: "Session", protocol: "Mental Health", pillar: "Regeneration", provider: "John Doe", status: "unscheduled" },
  { id: "cp-18", dueDate: "1/1/26 - 12:00 AM", dueAt: "2026-01-01T00:00:00", itemName: "Wellness intake", type: "Session", protocol: "Weight Loss", pillar: "Recovery", provider: "Dr. Monroe", status: "unscheduled" },
  { id: "cp-19", dueDate: "12/30/25 - 10:00 AM", dueAt: "2025-12-30T10:00:00", itemName: "Sleep coaching", type: "Session", protocol: "Mental Health", pillar: "Recovery", provider: "Stephen Smith", status: "unscheduled" },
  { id: "cp-20", dueDate: "12/28/25 - 1:00 PM", dueAt: "2025-12-28T13:00:00", itemName: "Body composition", type: "Session", protocol: "Weight Loss", pillar: "Diagnostics", provider: "John Doe", status: "unscheduled" },
  { id: "cp-21", dueDate: "12/26/25 - 3:30 PM", dueAt: "2025-12-26T15:30:00", itemName: "IV hydration", type: "Session", protocol: "Mental Health", pillar: "Regeneration", provider: "Dr. Monroe", status: "unscheduled" },
  { id: "cp-22", dueDate: "12/24/25 - 9:00 AM", dueAt: "2025-12-24T09:00:00", itemName: "Mindfulness session", type: "Session", protocol: "Mental Health", pillar: "Recovery", provider: "Stephen Smith", status: "unscheduled" },
  { id: "cp-23", dueDate: "12/22/25 - 11:15 AM", dueAt: "2025-12-22T11:15:00", itemName: "Stool collection", type: "Session", protocol: "Weight Loss", pillar: "Diagnostics", provider: "John Doe", status: "unscheduled" },
  { id: "cp-24", dueDate: "12/20/25 - 2:00 PM", dueAt: "2025-12-20T14:00:00", itemName: "Lymphatic drainage", type: "Session", protocol: "Weight Loss", pillar: "Recovery", provider: "Dr. Monroe", status: "unscheduled" },
];

export function getCarePlanRowsForMember(_memberId) {
  return MOCK_MANAGE_CARE_PLAN_ROWS;
}

export function getCarePlanItemById(itemId) {
  return MOCK_MANAGE_CARE_PLAN_ROWS.find((r) => r.id === String(itemId));
}
