/** Shared mock data for manage / detail rudiment flows (POC). */

export const MOCK_MANAGE_RUDIMENTS = [
  {
    id: 21890,
    status: "published",
    date: "2/2/2026",
    takenBy: "Stephen",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    detailDate: "July 23, 2025 - 11:32 am",
    note: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`,
  },
  {
    id: 21889,
    status: "draft",
    date: "1/15/2026",
    takenBy: "Stephen",
    description:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    detailDate: "January 15, 2026 - 9:00 am",
    note: `Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.

Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  },
];

export function getRudimentById(rudimentId) {
  const id = Number(rudimentId);
  if (Number.isNaN(id)) return undefined;
  return MOCK_MANAGE_RUDIMENTS.find((r) => r.id === id);
}
