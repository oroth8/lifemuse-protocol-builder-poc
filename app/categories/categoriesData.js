/** @typedef {"supplements" | "nutrition" | "training" | "recovery" | "diagnostics" | "regeneration"} PillarKey */

/**
 * Category pillar pills — exact brand hex for label; background is 20% of that same color;
 * border-radius 6px (no border).
 */
const CHIP =
  "inline-flex items-center border-0 px-3 py-1 text-xs font-semibold tracking-normal antialiased rounded-[6px]";

export const PILLAR_META = {
  supplements: {
    label: "Supplements",
    className: `${CHIP} text-[#1D9E75] bg-[#1D9E75]/20`,
  },
  nutrition: {
    label: "Nutrition",
    className: `${CHIP} text-[#1D9E75] bg-[#1D9E75]/20`,
  },
  training: {
    label: "Training",
    className: `${CHIP} text-[#D85A30] bg-[#D85A30]/20`,
  },
  recovery: {
    label: "Recovery",
    className: `${CHIP} text-[#D4537E] bg-[#D4537E]/20`,
  },
  diagnostics: {
    label: "Diagnostics",
    className: `${CHIP} text-[#D40511] bg-[#D40511]/20`,
  },
  regeneration: {
    label: "Regeneration",
    className: `${CHIP} text-[#378ADD] bg-[#378ADD]/20`,
  },
};

/** UI / form order for pillar selects */
export const PILLAR_TAG_ORDER = /** @type {const} */ ([
  "supplements",
  "nutrition",
  "training",
  "recovery",
  "diagnostics",
  "regeneration",
]);

/** @type {{ id: string, pillarKey: PillarKey, category: string, itemsInside: number }[]} */
export const CATEGORIES_MOCK = [
  { category: "Systemic Formulas", itemsInside: 49 },
  { category: "All", itemsInside: 10 },
  { category: "Compounds", itemsInside: 24 },
  { category: "Peptides", itemsInside: 12 },
  { category: "Meat", itemsInside: 8 },
  { category: "Drinks", itemsInside: 15 },
  { category: "Vegetables", itemsInside: 22 },
  { category: "Chest", itemsInside: 6 },
  { category: "Others", itemsInside: 3 },
  { category: "Back", itemsInside: 11 },
  { category: "Snacks", itemsInside: 18 },
  { category: "Minerals", itemsInside: 7 },
  { category: "Legs", itemsInside: 9 },
  { category: "Fruit", itemsInside: 14 },
  { category: "Vitamins", itemsInside: 31 },
  { category: "Arms", itemsInside: 5 },
  { category: "Grains", itemsInside: 20 },
  { category: "Herbs", itemsInside: 16 },
  { category: "Core", itemsInside: 13 },
  { category: "Dairy", itemsInside: 17 },
  { category: "Amino acids", itemsInside: 28 },
  { category: "Cardio", itemsInside: 4 },
  { category: "Oils", itemsInside: 6 },
  { category: "Electrolytes", itemsInside: 19 },
  { category: "Mobility", itemsInside: 8 },
  { category: "Spices", itemsInside: 12 },
  { category: "Enzymes", itemsInside: 5 },
  { category: "Recovery", itemsInside: 21 },
  { category: "Soups", itemsInside: 9 },
  { category: "Probiotics", itemsInside: 14 },
].map((row, i) => ({
  id: `c${i + 1}`,
  pillarKey: PILLAR_TAG_ORDER[i % PILLAR_TAG_ORDER.length],
  category: row.category,
  itemsInside: row.itemsInside,
}));

/** Rows for the “pick items” table on Create New Category */
export const CATEGORY_ITEM_PICKER_ROWS = [
  { id: 124, name: "Vitality Boost System Formula" },
  { id: 123, name: "Radiance Renewal System Formula" },
  { id: 122, name: "Balance Core System Formula" },
  { id: 121, name: "Clarity Focus System Formula" },
  { id: 120, name: "Restful Night System Formula" },
  { id: 119, name: "Joint Comfort System Formula" },
  { id: 118, name: "Digestive Harmony System Formula" },
  { id: 117, name: "Immune Shield System Formula" },
  { id: 116, name: "Energy Surge System Formula" },
  { id: 115, name: "Cardio Support System Formula" },
  { id: 114, name: "Skin Glow System Formula" },
  { id: 113, name: "Bone Strength System Formula" },
];

/** Pre-checked IDs matching the mock (first three rows) */
export const CATEGORY_ITEM_DEFAULT_SELECTED_IDS = [124, 123, 122];
