/** Shared mock data for manage / detail feedback summary flows (POC). */

export const MOCK_FEEDBACK_SUMMARY = [
  {
    id: 3,
    detailDate: "July 23, 2025 - 11:32 am",
    feedback: "This month, we focused on building coping strategies and enhancing emotional regulation during high-stress periods.",
    status: "Sent",
  },
  {
    id: 2,
    detailDate: "July 22, 2025 - 9:00 am",
    feedback: "Muscle recovery is going smoothly!",
    status: "Sent",
  },
  {
    id: 1,
    detailDate: "July 15, 2025 - 2:00 pm",
    feedback: "Taking care of your mental health is essential for overall well-being and long-term resilience.",
    status: "Sent",
  },
];

export function getFeedbackSummaryById(feedbackId) {
  const id = Number(feedbackId);
  if (Number.isNaN(id)) return undefined;
  return MOCK_FEEDBACK_SUMMARY.find((r) => r.id === id);
}
