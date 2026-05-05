"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { addUserProtocol } from "../lib/userProtocols";
import { createPortal } from "react-dom";
import { DEFAULT_SUPPLEMENT_ICON_ID, SupplementIconGlyph, SupplementIconPickerModal } from "./protocolSupplementIcons";

const PILLARS = {
  supplements: { label: "Supplements", color: "#1D9E75" },
  nutrition: { label: "Nutrition", color: "#1D9E75" },
  training: { label: "Training", color: "#D85A30" },
  regeneration: { label: "Regeneration", color: "#8C25E8" },
  recovery: { label: "Recovery", color: "#0B64F0" },
  diagnostics: { label: "Diagnostics", color: "#D40511" },
};

const RECURRENCE_TYPES = ["single_occurrence", "daily", "custom"];
const RECURRENCE_LABELS = {
  single_occurrence: "Single Occurrence",
  daily: "Daily",
  custom: "Custom",
};

/** Normalize stored recurrence to one of the three dropdown values (legacy keys → custom / single_occurrence / daily). */
function recurrenceSelectValue(stored) {
  const r = stored || "daily";
  if (r === "daily") return "daily";
  if (r === "single_occurrence" || r === "one_time") return "single_occurrence";
  return "custom";
}
const RECOVERY_ITEM_TYPES = [
  { value: "session", label: "Session" },
  { value: "task", label: "Task" },
  { value: "assessment", label: "Assessment" },
];
const RECOVERY_SESSION_TYPES = [
  "Massages",
  "Stone massage",
  "Swedish massages",
  "Acupuncture",
  "Cryotherapy",
  "Red Light",
  "Deep Tissue",
  "Sauna",
];

/** Extra option for regeneration services (e.g. HBOT) */
const REGENERATION_SESSION_TYPES = [...RECOVERY_SESSION_TYPES, "Hyperbaric"];

/** Diagnostics pillar — session-type dropdown options */
const DIAGNOSTICS_SESSION_TYPES = [
  "GI-MAP Stool Analysis",
  "DEXA Body Composition Scan",
  "MRI Progress Scan",
  "Ultrasound",
  "CT scan",
  "Colonoscopy",
  "Upper endoscopy",
  "Biopsy — tissue",
];

function guessDiagnosticsSessionType(serviceName) {
  const n = (serviceName || "").toLowerCase();
  if (n.includes("mri")) return "MRI Progress Scan";
  if (n.includes("dexa")) return "DEXA Body Composition Scan";
  if (n.includes("gi-map") || n.includes("stool")) return "GI-MAP Stool Analysis";
  if (n.includes("colon")) return "Colonoscopy";
  if (n.includes("biopsy")) return "Biopsy — tissue";
  return "MRI Progress Scan";
}

function legacyServiceFrequencyToRecurrence(freq) {
  if (!freq) return "custom";
  if (freq === "one_time") return "single_occurrence";
  if (freq === "as_needed") return "daily";
  return "custom";
}

function guessRecoverySessionType(serviceName) {
  const n = (serviceName || "").toLowerCase();
  if (n.includes("cryo")) return "Cryotherapy";
  if (n.includes("sauna")) return "Sauna";
  if (n.includes("acupuncture")) return "Acupuncture";
  if (n.includes("red light")) return "Red Light";
  if (n.includes("deep tissue")) return "Deep Tissue";
  if (n.includes("stone")) return "Stone massage";
  if (n.includes("swedish")) return "Swedish massages";
  if (n.includes("massage") || n.includes("lymphatic") || n.includes("sports")) return "Massages";
  return "Massages";
}
const SUPPLEMENT_CATEGORIES = [
  { value: "systemic_formula", label: "Systemic Formulas" },
  { value: "other_supplement", label: "Other Supplements" },
  { value: "compound", label: "Compounds" },
  { value: "peptide", label: "Peptides" },
];

/** Regeneration pillar only — service catalogue filters on Items tab (not clinical pillar names) */
const SERVICE_CATALOG_CATEGORIES = [
  { value: "massages", label: "Massages" },
  { value: "non_invasive", label: "Non-invasive Treatments" },
  { value: "muscular", label: "Muscular Treatments" },
  { value: "other", label: "Others" },
];

/** Fallback when opening services catalogue without a pillar-specific filter */
const SERVICE_PILLAR_CATALOG_FILTERS = [
  { value: "diagnostics", label: PILLARS.diagnostics.label },
  { value: "regeneration", label: PILLARS.regeneration.label },
  { value: "recovery", label: PILLARS.recovery.label },
];

/** Diagnostics pillar — Items tab filters (`diagnostic_catalog_category` on catalogue rows) */
const SERVICE_DIAGNOSTICS_CATALOG_FILTERS = [
  { value: "laboratory", label: "Laboratory" },
  { value: "imaging", label: "Imaging" },
  { value: "endoscopic", label: "Endoscopic exams" },
  { value: "biopsies", label: "Biopsies" },
  { value: "other", label: "Others" },
];

/** Recovery pillar — Items tab filters (maps onto `service_category` / buckets) */
const SERVICE_RECOVERY_CATALOG_FILTERS = [
  { value: "massages", label: "Massages" },
  { value: "drainages", label: "Drainages" },
  { value: "other", label: "Others" },
];

function recoveryCatalogCategoryMatch(catF, serviceCategory) {
  const sc = serviceCategory || "";
  if (catF === "all") return true;
  if (catF === "massages") return sc === "massages" || sc === "muscular";
  if (catF === "drainages") return sc === "drainages";
  if (catF === "other") return sc === "non_invasive" || sc === "other";
  return false;
}

function recoveryProgramMatchesCatalog(catF, prog) {
  if (catF === "all") return true;
  return (prog.item_ids || []).some((id) => {
    const row = MOCK_CATALOG.services.find((x) => x.id === id);
    return row && recoveryCatalogCategoryMatch(catF, row.service_category);
  });
}

function diagnosticsCatalogChipLabel(dc) {
  return SERVICE_DIAGNOSTICS_CATALOG_FILTERS.find((c) => c.value === dc)?.label || dc;
}

/** Recovery catalogue row — duration line like "≈ 15 mins" / "≈ 1 hour" */
function recoveryCatalogDurationLabel(minutes) {
  if (minutes === undefined || minutes === null) return null;
  const n = Number(minutes);
  if (Number.isNaN(n)) return null;
  if (n >= 60 && n % 60 === 0) {
    const h = n / 60;
    return h === 1 ? "≈ 1 hour" : `≈ ${h} hours`;
  }
  return `≈ ${n} mins`;
}

function diagnosticsProgramMatchesCatalog(catF, prog) {
  if (catF === "all") return true;
  return (prog.item_ids || []).some((id) => {
    const row = MOCK_CATALOG.services.find((x) => x.id === id);
    return row && row.diagnostic_catalog_category === catF;
  });
}

function serviceCategoryLabel(value) {
  return SERVICE_CATALOG_CATEGORIES.find((c) => c.value === value)?.label || value;
}

const MOCK_CATALOG = {
  supplements: [
    { id: "ci-010", name: "VRM1 - Small Parasite Formula", category: "systemic_formula", defaults: { dosage: "2 capsules", route: "oral", frequency: "twice daily", instructions: "Take with meals" } },
    { id: "ci-011", name: "VRM2 - Large Parasite Formula", category: "systemic_formula", defaults: { dosage: "1 capsule", route: "oral", frequency: "once daily", instructions: "Take 30 min before breakfast" } },
    { id: "ci-020", name: "BioToxin Binder", category: "compound", defaults: { dosage: "1 scoop", route: "oral", frequency: "once daily", instructions: "Mix in water. Take 2 hrs away from other supplements" } },
    { id: "ci-021", name: "Activated Charcoal", category: "other_supplement", defaults: { dosage: "500mg", route: "oral", frequency: "twice daily", instructions: "Take away from meals and medications" } },
    { id: "ci-050", name: "BPC-157", category: "peptide", defaults: { dosage: "250mcg", route: "injection", frequency: "once daily", instructions: "Subcutaneous injection. Rotate sites." } },
    { id: "ci-051", name: "TB-500", category: "peptide", defaults: { dosage: "750mcg", route: "injection", frequency: "once daily", instructions: "Subcutaneous morning injection" } },
    { id: "ci-060", name: "Omega-3 Fish Oil", category: "other_supplement", defaults: { dosage: "2000mg", route: "oral", frequency: "twice daily", instructions: "Take with fatty meal" } },
    { id: "ci-061", name: "Curcumin Complex", category: "compound", defaults: { dosage: "1000mg", route: "oral", frequency: "twice daily", instructions: "Take with fat source for absorption" } },
    { id: "ci-062", name: "Collagen Peptides", category: "other_supplement", defaults: { dosage: "20g", route: "oral", frequency: "once daily", instructions: "Mix in coffee or smoothie" } },
    { id: "ci-063", name: "LMNT Electrolytes", category: "other_supplement", defaults: { dosage: "1 packet", route: "oral", frequency: "once daily", instructions: "Mix in 16oz water" } },
    { id: "ci-064", name: "Vitamin C", category: "other_supplement", defaults: { dosage: "1000mg", route: "oral", frequency: "once daily", instructions: "Take with breakfast" } },
  ],
  services: [
    { id: "ci-030", name: "GI-MAP Stool Analysis", pillar: "diagnostics", service_category: "other", diagnostic_catalog_category: "laboratory", duration: 30 },
    { id: "ci-031", name: "DEXA Body Composition Scan", pillar: "diagnostics", service_category: "other", diagnostic_catalog_category: "imaging", duration: 30 },
    { id: "ci-032", name: "MRI Progress Scan", pillar: "diagnostics", service_category: "other", diagnostic_catalog_category: "imaging", duration: 45 },
    { id: "ci-040", name: "Infrared Sauna Session", pillar: "regeneration", service_category: "non_invasive", duration: 45 },
    { id: "ci-041", name: "Red Light Therapy", pillar: "regeneration", service_category: "non_invasive", duration: 20 },
    { id: "ci-042", name: "Hyperbaric Oxygen Therapy", pillar: "regeneration", service_category: "non_invasive", duration: 90 },
    { id: "ci-043", name: "Cryotherapy", pillar: "recovery", service_category: "non_invasive", duration: 15 },
    { id: "ci-044", name: "Manual Lymphatic Drainage", pillar: "recovery", service_category: "drainages", duration: 60 },
    { id: "ci-045", name: "Sports Massage", pillar: "recovery", service_category: "muscular", duration: 60 },
    { id: "ci-046", name: "IV Vitamin Infusion", pillar: "regeneration", service_category: "non_invasive", duration: 45 },
  ],
  exercises: [
    { id: "ex-100", name: "Barbell Bench Press", muscle_group: "chest", equipment: "barbell" },
    { id: "ex-101", name: "Incline Dumbbell Press", muscle_group: "chest", equipment: "dumbbell" },
    { id: "ex-102", name: "Cable Flye", muscle_group: "chest", equipment: "cable" },
    { id: "ex-103", name: "Overhead Barbell Press", muscle_group: "shoulders", equipment: "barbell" },
    { id: "ex-104", name: "Lateral Raise", muscle_group: "shoulders", equipment: "dumbbell" },
    { id: "ex-105", name: "Tricep Dip", muscle_group: "triceps", equipment: "bodyweight" },
    { id: "ex-200", name: "Barbell Back Squat", muscle_group: "quads", equipment: "barbell" },
    { id: "ex-201", name: "Leg Press", muscle_group: "quads", equipment: "machine" },
    { id: "ex-202", name: "Romanian Deadlift", muscle_group: "hamstrings", equipment: "barbell" },
    { id: "ex-203", name: "Lat Pulldown", muscle_group: "back", equipment: "cable" },
    { id: "ex-204", name: "Barbell Row", muscle_group: "back", equipment: "barbell" },
    { id: "ex-205", name: "Face Pull", muscle_group: "rear delts", equipment: "cable" },
    { id: "ex-206", name: "Leg Extension", muscle_group: "quads", equipment: "machine" },
    { id: "ex-207", name: "Leg Curl", muscle_group: "hamstrings", equipment: "machine" },
    { id: "ex-208", name: "Standing Calf Raise", muscle_group: "calves", equipment: "machine" },
    { id: "ex-209", name: "Dumbbell Curl", muscle_group: "biceps", equipment: "dumbbell" },
    { id: "ex-210", name: "Tricep Pushdown", muscle_group: "triceps", equipment: "cable" },
    { id: "ex-211", name: "Hack Squat", muscle_group: "quads", equipment: "machine" },
    { id: "ex-212", name: "Walking Lunge", muscle_group: "quads", equipment: "bodyweight" },
    { id: "ex-213", name: "Seated Cable Row", muscle_group: "back", equipment: "cable" },
    { id: "ex-214", name: "Pull-Up", muscle_group: "back", equipment: "bodyweight" },
    { id: "ex-215", name: "Dumbbell Lateral Raise", muscle_group: "shoulders", equipment: "dumbbell" },
    { id: "ex-216", name: "Hammer Curl", muscle_group: "biceps", equipment: "dumbbell" },
    { id: "ex-217", name: "Skull Crusher", muscle_group: "triceps", equipment: "barbell" },
    { id: "ex-218", name: "Hip Thrust", muscle_group: "glutes", equipment: "barbell" },
    { id: "ex-219", name: "Bulgarian Split Squat", muscle_group: "quads", equipment: "dumbbell" },
    { id: "ex-220", name: "Incline Barbell Bench", muscle_group: "chest", equipment: "barbell" },
    { id: "ex-221", name: "Chest Dip", muscle_group: "chest", equipment: "bodyweight" },
    { id: "ex-222", name: "Arnold Press", muscle_group: "shoulders", equipment: "dumbbell" },
    { id: "ex-223", name: "Deadlift", muscle_group: "back", equipment: "barbell" },
    { id: "ex-224", name: "Sumo Deadlift", muscle_group: "hamstrings", equipment: "barbell" },
    { id: "ex-225", name: "Pendlay Row", muscle_group: "back", equipment: "barbell" },
    { id: "ex-226", name: "T-Bar Row", muscle_group: "back", equipment: "machine" },
    { id: "ex-227", name: "Quad Set", muscle_group: "quads", equipment: "bodyweight" },
    { id: "ex-228", name: "Straight Leg Raise", muscle_group: "quads", equipment: "bodyweight" },
    { id: "ex-229", name: "Heel Slide", muscle_group: "quads", equipment: "bodyweight" },
    { id: "ex-230", name: "Prone Hang", muscle_group: "quads", equipment: "bodyweight" },
    { id: "ex-231", name: "Step Up", muscle_group: "quads", equipment: "bodyweight" },
    { id: "ex-232", name: "Single Leg Press", muscle_group: "quads", equipment: "machine" },
    { id: "ex-233", name: "Box Jump", muscle_group: "quads", equipment: "bodyweight" },
    { id: "ex-234", name: "Lateral Shuffle", muscle_group: "quads", equipment: "bodyweight" },
    { id: "ex-c01", name: "Treadmill — steady state", muscle_group: "cardio", equipment: "treadmill" },
    { id: "ex-c02", name: "Exercise bike — intervals", muscle_group: "cardio", equipment: "bike" },
    { id: "ex-c03", name: "Rowing machine", muscle_group: "cardio", equipment: "machine" },
    { id: "ex-c04", name: "Elliptical", muscle_group: "cardio", equipment: "machine" },
    { id: "ex-c05", name: "Jump rope", muscle_group: "cardio", equipment: "rope" },
    { id: "ex-c06", name: "Airbike — HIIT", muscle_group: "cardio", equipment: "bike" },
    { id: "ex-c07", name: "Stair climber", muscle_group: "cardio", equipment: "machine" },
    { id: "ex-c08", name: "Outdoor run — easy", muscle_group: "cardio", equipment: "bodyweight" },
    { id: "ex-c09", name: "Swimming — laps", muscle_group: "cardio", equipment: "pool" },
    { id: "ex-c10", name: "Walking — incline", muscle_group: "cardio", equipment: "treadmill" },
  ],
};

/** Bundled catalogue entries (programs) — each expands to multiple standalone items when added */
const CATALOG_PROGRAMS = {
  supplements: [
    { id: "prog-sup-a", name: "Anti-inflammatory stack", category: "compound", description: "Curcumin, omega-3, vitamin C", item_ids: ["ci-061", "ci-060", "ci-064"] },
    { id: "prog-sup-b", name: "Gut repair bundle", category: "other_supplement", description: "Binder, charcoal, collagen, omega-3, electrolytes — 5 items", item_ids: ["ci-020", "ci-021", "ci-062", "ci-060", "ci-063"] },
    { id: "prog-sup-c", name: "Peptide pair", category: "peptide", description: "BPC-157 + TB-500", item_ids: ["ci-050", "ci-051"] },
  ],
  services: [
    { id: "prog-svc-a", name: "Recovery intensive week", pillar: "recovery", service_category: "non_invasive", description: "Lymphatic, sports massage, cryotherapy", item_ids: ["ci-044", "ci-045", "ci-043"] },
    { id: "prog-svc-b", name: "Regeneration protocol", pillar: "regeneration", service_category: "non_invasive", description: "Sauna, red light, HBOT", item_ids: ["ci-040", "ci-041", "ci-042"] },
    { id: "prog-svc-c", name: "Diagnostics baseline", pillar: "diagnostics", service_category: "other", description: "GI-MAP, DEXA, MRI", item_ids: ["ci-030", "ci-031", "ci-032"] },
  ],
  exercises: [
    { id: "prog-ex-a", name: "Push day A", muscle_group: "chest", description: "Bench, incline, cable flye, OHP, lateral raise", item_ids: ["ex-100", "ex-101", "ex-102", "ex-103", "ex-104"] },
    { id: "prog-ex-b", name: "Leg strength", muscle_group: "quads", description: "Squat, leg press, RDL, extension, curl", item_ids: ["ex-200", "ex-201", "ex-202", "ex-206", "ex-207"] },
    { id: "prog-ex-c", name: "Pull basics", muscle_group: "back", description: "Lat pulldown, row, face pull", item_ids: ["ex-203", "ex-204", "ex-205"] },
  ],
};

/** Training section only — preset workout rows in “Add Item” modal (Items tab) */
const MOCK_TRAINING_ITEMS = [
  { id: "tw-001", name: "HIIT", muscle_group: "chest", equipment: "barbell", exercise_ids: ["ex-100", "ex-103"] },
  { id: "tw-002", name: "Upper Body A", muscle_group: "chest", equipment: "dumbbell", exercise_ids: ["ex-101", "ex-102"] },
  { id: "tw-003", name: "Self guided lower body workout A", muscle_group: "chest", equipment: "cable", exercise_ids: ["ex-102", "ex-203"] },
  { id: "tw-004", name: "Self guided lower body workout B", muscle_group: "shoulders", equipment: "barbell", exercise_ids: ["ex-103", "ex-104"] },
  { id: "tw-005", name: "Trainer-Led Lower Body Session B", muscle_group: "back", equipment: "cable", exercise_ids: ["ex-203", "ex-204"] },
];

/** Training “Add Item” modal — Programs tab */
const TRAINING_CATALOG_PROGRAMS = [
  { id: "tp-001", name: "Muscle Build 4-Day Microcycle", muscle_group: "chest", equipment: "barbell", description: "Progressive overload microcycle", item_ids: ["tw-001", "tw-002"] },
  { id: "tp-002", name: "Marathon Training Block 1", muscle_group: "chest", equipment: "dumbbell", description: "Aerobic base + strength", item_ids: ["tw-002", "tw-004"] },
  { id: "tp-003", name: "Booty Builder", muscle_group: "chest", equipment: "cable", description: "Glute and posterior chain", item_ids: ["tw-003"] },
  { id: "tp-004", name: "Weight Loss Training", muscle_group: "shoulders", equipment: "barbell", description: "Metabolic strength circuits", item_ids: ["tw-001", "tw-005"] },
];

/** Nutrition pillar — item types (UI only; session vs task) */
const NUTRITION_ITEM_TYPE_OPTIONS = [
  { value: "session", label: "Session" },
  { value: "task", label: "Task" },
];
const NUTRITION_SESSION_TYPES = ["Consultation", "Meal planning", "Follow-up", "Education session", "Grocery review"];

const NUTRITION_CATALOG_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "meat", label: "Meat" },
  { value: "drinks", label: "Drinks" },
  { value: "vegetables", label: "Vegetables" },
  { value: "others", label: "Others" },
];

const MOCK_NUTRITION_CATALOG_ITEMS = [
  { id: "n-m1", name: "Fish", category: "meat" },
  { id: "n-m2", name: "Raw Meat", category: "meat" },
  { id: "n-m3", name: "Poultry", category: "meat" },
  { id: "n-d1", name: "Drink Water", category: "drinks" },
  { id: "n-d2", name: "Drink Orange Juice", category: "drinks" },
  { id: "n-v1", name: "Eat Salad", category: "vegetables" },
  { id: "n-v2", name: "Steamed Broccoli", category: "vegetables" },
  { id: "n-o1", name: "Nuts and seeds", category: "others" },
  { id: "n-o2", name: "Olive oil", category: "others" },
];

const MOCK_NUTRITION_PROGRAMS = [
  { id: "np-1", name: "Vegan", description: "Plant-based eating pattern", item_ids: ["n-v1", "n-v2", "n-o1"] },
  { id: "np-2", name: "Vegetarian", description: "Lacto-ovo vegetarian", item_ids: ["n-m3", "n-d1", "n-v1"] },
  { id: "np-3", name: "Gluten Free", description: "No gluten-containing foods", item_ids: ["n-m1", "n-m2", "n-v1"] },
  { id: "np-4", name: "Keto", description: "Very low carbohydrate", item_ids: ["n-m1", "n-m2", "n-o2"] },
  { id: "np-5", name: "Intermittent Fasting", description: "Time-restricted eating", item_ids: ["n-d1", "n-m3", "n-v2"] },
];

const MOCK_TEMPLATES = [
  { id: "pt-001", name: "Parasite Cleanse Protocol", pillar: "supplements", description: "90-day systemic parasite cleanse with drainage support" },
  { id: "pt-002", name: "Gut Healing Protocol", pillar: "supplements", description: "12-week gut repair with L-glutamine, probiotics, and dietary modifications" },
  { id: "pt-003", name: "Post-Surgical Recovery", pillar: "training", description: "16-week phased recovery protocol with PT progression" },
  { id: "pt-004", name: "Metabolic Reset", pillar: "nutrition", description: "8-week metabolic optimization with intermittent fasting and macro cycling" },
  { id: "pt-005", name: "PPL 6-Day Hypertrophy", pillar: "training", description: "12-week push/pull/legs split for lean mass gain with progressive overload" },
  { id: "pt-006", name: "Upper/Lower 4-Day Split", pillar: "training", description: "8-week upper/lower strength program for intermediate lifters" },
  { id: "pt-007", name: "ACL Reconstruction Rehab", pillar: "training", description: "16-week phased PT protocol: ROM → strength → functional → sport readiness" },
  { id: "pt-008", name: "16:8 Intermittent Fasting", pillar: "nutrition", description: "60-day IF protocol with macro targets, feeding windows, and electrolyte support" },
  { id: "pt-009", name: "Anti-Inflammatory Protocol", pillar: "nutrition", description: "8-week elimination diet targeting inflammation with reintroduction phases" },
  { id: "pt-010", name: "Muscle Gain Nutrition", pillar: "nutrition", description: "12-week caloric surplus plan optimized for hypertrophy training" },
  { id: "pt-011", name: "Post-Surgical Recovery Nutrition", pillar: "nutrition", description: "High-protein tissue repair nutrition with bone broth and anti-inflammatory foods" },
];

let idC = 1000;
const gid = () => `i-${idC++}`;

const V = {
  bg: "#F7F8FC", bgCard: "#FFFFFF", bgHover: "#F3F5FB", bgInput: "#FFFFFF",
  bdr: "#D8DDEA", bdrFocus: "#5B5FED", tx: "#1B2230", txM: "#5E6980", txD: "#8A93A6",
  acc: "#5B5FED", danger: "#D14343", dangerBg: "#FCEBEC", success: "#1D9E75", warn: "#BA7517",
};
const F = `"Instrument Sans","DM Sans",-apple-system,sans-serif`;
const M = `"JetBrains Mono","SF Mono",monospace`;

const S = {
  root: { fontFamily: F, background: V.bg, color: V.tx, minHeight: "100vh" },
  topBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 28px", borderBottom: `1px solid ${V.bdr}`, background: V.bgCard, position: "sticky", top: 0, zIndex: 50 },
  backBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 8, border: `1px solid ${V.bdr}`, background: V.bgCard, color: V.txM, textDecoration: "none", flexShrink: 0 },
  btnP: { background: V.acc, color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F },
  btnS: { background: "transparent", color: V.txM, border: `1px solid ${V.bdr}`, borderRadius: 8, padding: "8px 18px", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: F },
  btnG: { background: "transparent", color: V.txM, border: "none", padding: "6px 12px", fontSize: 13, cursor: "pointer", fontFamily: F, borderRadius: 6 },
  btnD: { background: V.dangerBg, color: V.danger, border: `1px solid ${V.danger}33`, borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: F },
  btnSm: { background: `${V.acc}18`, color: V.acc, border: `1px solid ${V.acc}30`, borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: F },
  btnAddNew: { background: V.acc, color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: F },
  btnAddCatalog: {
    background: "rgba(91, 95, 237, 0.06)",
    color: V.acc,
    border: "1px solid rgba(91, 95, 237, 0.22)",
    borderRadius: 6,
    padding: "6px 14px",
    fontSize: 12,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: F,
  },
  cnt: { maxWidth: 1000, margin: "0 auto", padding: "24px 28px" },
  card: { background: V.bgCard, border: `1px solid ${V.bdr}`, borderRadius: 12, marginBottom: 16, overflow: "hidden" },
  cardH: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: `1px solid ${V.bdr}`, cursor: "pointer", userSelect: "none" },
  cardB: { padding: "16px 18px" },
  fg: { display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" },
  fld: { display: "flex", flexDirection: "column", gap: 4, flex: 1, minWidth: 140 },
  fldF: { display: "flex", flexDirection: "column", gap: 4, flex: "1 1 100%", minWidth: 0 },
  lbl: { fontSize: 11, fontWeight: 600, color: V.txM, textTransform: "uppercase", letterSpacing: "0.06em" },
  inp: { background: V.bgInput, border: `1px solid ${V.bdr}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, color: V.tx, fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box" },
  ta: { background: V.bgInput, border: `1px solid ${V.bdr}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, color: V.tx, fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", minHeight: 60 },
  sel: { background: V.bgInput, border: `1px solid ${V.bdr}`, borderRadius: 6, padding: "8px 10px", fontSize: 13, color: V.tx, fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box" },
  pill: (c) => ({ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, background: `${c}18`, color: c, border: `1px solid ${c}30` }),
  badge: (c) => ({ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.05em", background: `${c}18`, color: c, border: `1px solid ${c}30` }),
  tag: (c) => ({ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: `${c}20`, color: c }),
  iRow: { display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 14px", background: V.bgInput, borderRadius: 8, marginBottom: 8, border: `1px solid ${V.bdr}` },
  empty: { padding: "32px 18px", textAlign: "center", color: V.txD, fontSize: 13 },
  modal: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, .18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 },
  modalC: { background: V.bgCard, border: `1px solid ${V.bdr}`, borderRadius: 14, width: "100%", maxWidth: 620, maxHeight: "80vh", overflow: "auto" },
  modalH: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${V.bdr}` },
  modalB: { padding: "18px 20px" },
  srch: { background: V.bgInput, border: `1px solid ${V.bdr}`, borderRadius: 8, padding: "10px 14px", fontSize: 14, color: V.tx, fontFamily: F, outline: "none", width: "100%", boxSizing: "border-box", marginBottom: 12 },
  catR: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 8, cursor: "pointer", marginBottom: 2 },
  tabBar: { display: "flex", gap: 0, borderBottom: `1px solid ${V.bdr}`, marginBottom: 20, overflowX: "auto" },
  tab: (a) => ({ padding: "10px 16px", fontSize: 13, fontWeight: a ? 600 : 400, color: a ? V.acc : V.txM, borderBottom: a ? `2px solid ${V.acc}` : "2px solid transparent", cursor: "pointer", background: "none", border: "none", fontFamily: F, whiteSpace: "nowrap" }),
  divider: { height: 1, background: V.bdr, margin: "12px 0", border: "none" },
  secH: (c) => ({ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: `${c}12`, borderRadius: 8, marginBottom: 12 }),
  ctxBox: { background: `${V.acc}0c`, border: `1px solid ${V.acc}22`, borderRadius: 10, padding: 14, marginTop: 12 },
};

function pillarLabel(key) {
  return PILLARS[key]?.label || key;
}

function PillarTag({ pillar }) {
  const p = PILLARS[pillar];
  return p ? <span style={S.pill(p.color)}>{p.label}</span> : null;
}

/** Legacy `training.days` → items[] shape; prefer `sec.items` for training pillar */
function migrateTrainingItems(sec) {
  if (sec.pillar !== "training") return [];
  if (sec.items?.length) return sec.items;
  const days = sec.training?.days;
  if (!days?.length) return [];
  return days.map((d, idx) => ({
    id: d.id,
    type: "training",
    icon_id: DEFAULT_SUPPLEMENT_ICON_ID,
    name: d.name || `Day ${d.day_of_week || idx + 1}`,
    training_item_type: "task",
    recurrence_type: "custom",
    start_date: "",
    end_date: "",
    anchor_time: "",
    concierge_reminder_days: "",
    instructions: "",
    exercises: d.exercises || [],
    context_what: "",
    context_expectations: "",
    context_why: "",
  }));
}

function hasLegacyNutritionData(sec) {
  if (sec.pillar !== "nutrition" || !sec.nutrition) return false;
  const n = sec.nutrition;
  return !!(
    n.plan_name ||
    (n.meals && n.meals.length) ||
    (n.macros && Object.values(n.macros).some((v) => v != null && v !== "")) ||
    n.foods_include ||
    n.foods_exclude ||
    n.notes ||
    n.fasting_start
  );
}

function countNutritionItems(sec) {
  if (sec.pillar !== "nutrition") return 0;
  const nutritionRows = (sec.items || []).filter((it) => it.type === "nutrition").length;
  if (nutritionRows > 0) return nutritionRows;
  if (hasLegacyNutritionData(sec)) return 1;
  return 0;
}

function blankNutritionItem(over = {}) {
  return {
    id: gid(),
    type: "nutrition",
    name: "",
    icon_id: DEFAULT_SUPPLEMENT_ICON_ID,
    nutrition_item_type: "task",
    nutrition_session_type: "Consultation",
    recurrence_type: "custom",
    start_date: "",
    end_date: "",
    anchor_time: "",
    concierge_reminder_days: "",
    instructions: "",
    context_what: "",
    context_expectations: "",
    context_why: "",
    ...over,
  };
}

function nutritionItemFromCatalogRow(row) {
  return blankNutritionItem({ name: row.name });
}

function ModalCloseButton({ onClose }) {
  return (
    <button
      type="button"
      style={{
        ...S.btnG,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        padding: 0,
        borderRadius: 8,
        flexShrink: 0,
      }}
      onClick={onClose}
      aria-label="Close"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: "block" }}>
        <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

const CUSTOM_RECURRENCE_UNITS = [
  { value: "day", label: "Day" },
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
];

/** M T W T F S S — values are JavaScript weekday numbers (Sun = 0 … Sat = 6). */
const CUSTOM_WEEKDAY_PICKER = [
  { letter: "M", day: 1 },
  { letter: "T", day: 2 },
  { letter: "W", day: 3 },
  { letter: "T", day: 4 },
  { letter: "F", day: 5 },
  { letter: "S", day: 6 },
  { letter: "S", day: 0 },
];

function defaultRecurrenceCustom() {
  return { repeat_every: 1, repeat_unit: "week", repeat_on: [2, 4] };
}

function normalizeRecurrenceCustom(initial) {
  if (!initial || typeof initial !== "object") return defaultRecurrenceCustom();
  const every = Math.max(1, Number(initial.repeat_every) || 1);
  const unit = CUSTOM_RECURRENCE_UNITS.some((u) => u.value === initial.repeat_unit) ? initial.repeat_unit : "week";
  const rawDays = Array.isArray(initial.repeat_on) ? initial.repeat_on : defaultRecurrenceCustom().repeat_on;
  const on = [...new Set(rawDays.map(Number).filter((d) => d >= 0 && d <= 6))].sort((a, b) => a - b);
  return { repeat_every: every, repeat_unit: unit, repeat_on: on };
}

function CustomRecurrenceModal({ initial, onDone, onCancel }) {
  const base = normalizeRecurrenceCustom(initial);
  const [every, setEvery] = useState(base.repeat_every);
  const [unit, setUnit] = useState(base.repeat_unit);
  const [onDays, setOnDays] = useState(() => [...base.repeat_on]);

  const toggleDay = (d) => {
    setOnDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)));
  };

  const dayBtn = (active) => ({
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: `1px solid ${active ? V.acc : V.bdr}`,
    background: active ? V.acc : V.bgCard,
    color: active ? "#fff" : V.tx,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: F,
    padding: 0,
    flexShrink: 0,
  });

  return (
    <div style={S.modal} onClick={onCancel} role="presentation">
      <div style={{ ...S.modalC, maxWidth: 420 }} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="custom-recurrence-title">
        <div style={{ ...S.modalH, borderBottom: "none", paddingBottom: 0 }}>
          <span id="custom-recurrence-title" style={{ ...S.lbl, fontSize: 13, letterSpacing: "0.08em" }}>
            Custom…
          </span>
          <ModalCloseButton onClose={onCancel} />
        </div>
        <div style={{ ...S.modalB, paddingTop: 12 }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ ...S.lbl, display: "block", marginBottom: 8 }}>Repeat every</label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <input
                style={{ ...S.inp, width: 72 }}
                type="number"
                min={1}
                step={1}
                value={every}
                onChange={(e) => setEvery(Math.max(1, Number(e.target.value) || 1))}
              />
              <select style={{ ...S.sel, flex: 1, minWidth: 120 }} value={unit} onChange={(e) => setUnit(e.target.value)}>
                {CUSTOM_RECURRENCE_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>
          {unit !== "day" && (
            <div style={{ marginBottom: 22 }}>
              <span style={{ ...S.lbl, display: "block", marginBottom: 10 }}>Repeat on</span>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CUSTOM_WEEKDAY_PICKER.map(({ letter, day }) => (
                  <button key={`${letter}-${day}`} type="button" style={dayBtn(onDays.includes(day))} onClick={() => toggleDay(day)} aria-pressed={onDays.includes(day)}>
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" style={S.btnS} onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              style={S.btnP}
              onClick={() =>
                onDone({
                  repeat_every: every,
                  repeat_unit: unit,
                  repeat_on: unit === "day" ? [] : [...onDays],
                })}
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Recurrence dropdown; choosing Custom opens configuration modal. */
function RecurrenceSelect({ item, onItemChange, recurrenceFallback = "daily", selectStyle }) {
  const [customOpen, setCustomOpen] = useState(false);
  const snapshotRef = useRef(null);
  const mergedRaw = item.recurrence_type ?? recurrenceFallback;
  const displayVal = recurrenceSelectValue(mergedRaw);

  const patch = (partial) => onItemChange({ ...item, ...partial });

  const handleSelectChange = (e) => {
    const v = e.target.value;
    if (v === "custom") {
      snapshotRef.current = { ...item };
      patch({ recurrence_type: "custom" });
      setCustomOpen(true);
    } else {
      patch({ recurrence_type: v, recurrence_custom: undefined });
    }
  };

  const handleCustomDone = (custom) => {
    patch({ recurrence_type: "custom", recurrence_custom: custom });
    setCustomOpen(false);
    snapshotRef.current = null;
  };

  const handleCustomCancel = () => {
    setCustomOpen(false);
    if (snapshotRef.current) {
      onItemChange(snapshotRef.current);
      snapshotRef.current = null;
    }
  };

  const openEditCustom = () => {
    snapshotRef.current = { ...item };
    setCustomOpen(true);
  };

  const selStyle = selectStyle || S.sel;

  return (
    <>
      <select style={selStyle} value={displayVal} onChange={handleSelectChange} aria-label="Recurrence">
        {RECURRENCE_TYPES.map((r) => (
          <option key={r} value={r}>{RECURRENCE_LABELS[r] || r}</option>
        ))}
      </select>
      {displayVal === "custom" && (
        <button type="button" style={{ ...S.btnG, fontSize: 11, marginTop: 4, padding: "2px 0", alignSelf: "flex-start" }} onClick={openEditCustom}>
          Edit custom pattern
        </button>
      )}
      {customOpen && (
        <CustomRecurrenceModal initial={item.recurrence_custom} onDone={handleCustomDone} onCancel={handleCustomCancel} />
      )}
    </>
  );
}

const CONCIERGE_REMINDER_TOOLTIP =
  "Number of days before the appointment that concierge should be reminded to book the session.";

/** Info icon fill — softer than body text black */
const CONCIERGE_INFO_ICON_BG = "#8A93A6";

function ConciergeReminderField({ itemId, value, onChange }) {
  const inputId = `concierge-reminder-${itemId}`;
  const tipId = `${inputId}-tooltip`;
  const [tipOpen, setTipOpen] = useState(false);
  const triggerWrapRef = useRef(null);
  const [tipBox, setTipBox] = useState(null);

  const updateTipPosition = useCallback(() => {
    const el = triggerWrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const pad = 10;
    const maxWidth = Math.min(288, Math.max(200, window.innerWidth - 2 * pad));
    let left = r.left + r.width / 2 - maxWidth / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - maxWidth - pad));
    const gap = 8;
    const top = r.top - gap;
    setTipBox({
      position: "fixed",
      left,
      top,
      width: maxWidth,
      transform: "translateY(-100%)",
      boxSizing: "border-box",
      padding: "10px 12px",
      background: V.bgCard,
      color: V.tx,
      fontSize: 12,
      fontWeight: 400,
      fontFamily: F,
      fontStyle: "normal",
      lineHeight: 1.45,
      borderRadius: 8,
      border: `1px solid ${V.bdr}`,
      boxShadow: "0 4px 20px rgba(15, 23, 42, 0.12)",
      zIndex: 10000,
      pointerEvents: "none",
      textAlign: "left",
      textTransform: "none",
      letterSpacing: "normal",
      overflowWrap: "break-word",
    });
  }, []);

  useLayoutEffect(() => {
    if (!tipOpen) {
      setTipBox(null);
      return;
    }
    updateTipPosition();
    const onReposition = () => updateTipPosition();
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
    return () => {
      window.removeEventListener("scroll", onReposition, true);
      window.removeEventListener("resize", onReposition);
    };
  }, [tipOpen, updateTipPosition]);

  const tooltipNode =
    tipOpen &&
    tipBox &&
    typeof document !== "undefined" &&
    createPortal(
      <span id={tipId} role="tooltip" style={tipBox}>
        {CONCIERGE_REMINDER_TOOLTIP}
      </span>,
      document.body,
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 0, overflow: "visible" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", overflow: "visible" }}>
        <label style={S.lbl} htmlFor={inputId}>
          Concierge reminder
        </label>
        <span
          ref={triggerWrapRef}
          style={{ position: "relative", display: "inline-flex", alignItems: "center", overflow: "visible" }}
          onPointerEnter={() => setTipOpen(true)}
          onPointerLeave={() => setTipOpen(false)}
        >
          <button
            type="button"
            id={`${inputId}-info`}
            aria-label="About concierge reminder"
            aria-describedby={tipOpen && tipBox ? tipId : undefined}
            onFocus={() => setTipOpen(true)}
            onBlur={() => setTipOpen(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              borderRadius: "50%",
              border: "none",
              background: CONCIERGE_INFO_ICON_BG,
              color: "#fff",
              fontSize: 10,
              fontWeight: 700,
              fontStyle: "italic",
              cursor: "help",
              flexShrink: 0,
              lineHeight: 1,
              fontFamily: "Georgia, serif",
              padding: 0,
            }}
          >
            i
          </button>
        </span>
      </div>
      {tooltipNode}
      <input
        id={inputId}
        style={S.inp}
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        placeholder="Days"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function CollapseChevron({ expanded }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        flexShrink: 0,
        color: V.txD,
      }}
      aria-hidden
    >
      <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
        {expanded ? (
          <path
            fillRule="evenodd"
            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
          />
        ) : (
          <path
            fillRule="evenodd"
            d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
          />
        )}
      </svg>
    </span>
  );
}

function CatalogModal({ type, onSelect, onSelectProgram, onClose, pillarFilter }) {
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("all");
  const [listMode, setListMode] = useState("items");
  const items = type === "supplements" ? MOCK_CATALOG.supplements : type === "exercises" ? MOCK_CATALOG.exercises : MOCK_CATALOG.services;
  const programs = CATALOG_PROGRAMS[type] || [];
  const regenerationServiceCategoryMode = type === "services" && pillarFilter === "regeneration";
  const recoveryServiceCategoryMode = type === "services" && pillarFilter === "recovery";
  const diagnosticsServiceCategoryMode = type === "services" && pillarFilter === "diagnostics";
  /** Pillar tint for category filter pills + inline category chips only — not for tabs/Add buttons */
  const modalAccent =
    type === "services" && pillarFilter === "regeneration"
      ? PILLARS.regeneration.color
      : type === "services" && pillarFilter === "recovery"
        ? PILLARS.recovery.color
        : type === "services" && pillarFilter === "diagnostics"
          ? PILLARS.diagnostics.color
          : V.acc;
  const sq = search.trim().toLowerCase();
  const filtered = items.filter((i) => {
    const ms = !sq || i.name.toLowerCase().includes(sq);
    let mc;
    if (type === "services") {
      if (regenerationServiceCategoryMode) {
        mc = catF === "all" || i.service_category === catF;
      } else if (recoveryServiceCategoryMode) {
        mc = recoveryCatalogCategoryMatch(catF, i.service_category);
      } else if (diagnosticsServiceCategoryMode) {
        mc = catF === "all" || i.diagnostic_catalog_category === catF;
      } else {
        mc = catF === "all" || i.pillar === catF;
      }
    } else {
      mc = catF === "all" || i.category === catF || i.pillar === catF || i.muscle_group === catF;
    }
    const mp = !pillarFilter || !i.pillar || i.pillar === pillarFilter;
    return ms && mc && mp;
  });
  const filteredPrograms = programs.filter((p) => {
    const ms = !sq || p.name.toLowerCase().includes(sq) || (p.description || "").toLowerCase().includes(sq);
    let mc;
    if (listMode === "programs") {
      mc = true;
    } else if (type === "services") {
      if (regenerationServiceCategoryMode) {
        mc = catF === "all" || p.service_category === catF;
      } else if (recoveryServiceCategoryMode) {
        mc = recoveryProgramMatchesCatalog(catF, p);
      } else if (diagnosticsServiceCategoryMode) {
        mc = diagnosticsProgramMatchesCatalog(catF, p);
      } else {
        mc = catF === "all" || p.pillar === catF;
      }
    } else {
      mc = catF === "all" || p.category === catF || p.pillar === catF || p.muscle_group === catF;
    }
    const mp = type !== "services" || !pillarFilter || !p.pillar || p.pillar === pillarFilter;
    return ms && mc && mp;
  });
  const cats = type === "supplements" ? SUPPLEMENT_CATEGORIES
    : type === "services"
      ? (regenerationServiceCategoryMode
        ? SERVICE_CATALOG_CATEGORIES
        : recoveryServiceCategoryMode
          ? SERVICE_RECOVERY_CATALOG_FILTERS
          : diagnosticsServiceCategoryMode
            ? SERVICE_DIAGNOSTICS_CATALOG_FILTERS
            : SERVICE_PILLAR_CATALOG_FILTERS)
    : [...new Set(items.map((i) => i.muscle_group))].map((g) => ({ value: g, label: g }));

  /** Recovery popup only: category pills match indigo chrome (#5B5FED); other pillars unchanged */
  const filterPillAccent = recoveryServiceCategoryMode ? V.acc : modalAccent;

  const segShell = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 0,
    width: "100%",
    padding: 0,
    borderRadius: 6,
    border: "none",
    boxShadow: "none",
    background: "transparent",
    marginBottom: 14,
    boxSizing: "border-box",
    overflow: "hidden",
  };
  const segBtn = (active) => ({
    width: "100%",
    minWidth: 0,
    margin: 0,
    border: "none",
    borderRadius: 0,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: F,
    background: active ? V.acc : `${V.acc}14`,
    color: active ? "#fff" : V.acc,
    transition: "background 0.15s ease, color 0.15s ease",
    outline: "none",
    boxShadow: "none",
    WebkitAppearance: "none",
    appearance: "none",
  });

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalC} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalH}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>
            {type === "supplements"
              ? "Add from supplement catalogue"
              : type === "exercises"
                ? "Add exercise"
                : pillarFilter === "regeneration" || pillarFilter === "diagnostics" || pillarFilter === "recovery"
                  ? "Add service"
                  : "Add Items"}
          </span>
          <ModalCloseButton onClose={onClose} />
        </div>
        <div style={S.modalB}>
          <input style={S.srch} placeholder="Search catalogue..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          <div style={segShell} role="tablist" aria-label="Catalog view">
            <button type="button" role="tab" aria-selected={listMode === "items"} style={segBtn(listMode === "items")} onClick={() => setListMode("items")}>
              Items
            </button>
            <button type="button" role="tab" aria-selected={listMode === "programs"} style={segBtn(listMode === "programs")} onClick={() => setListMode("programs")}>
              Programs
            </button>
          </div>
          {listMode === "items" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              <button style={{ ...S.btnG, background: catF === "all" ? `${filterPillAccent}18` : "transparent", color: catF === "all" ? filterPillAccent : V.txM, borderRadius: 20, fontSize: 11, padding: "4px 12px" }} onClick={() => setCatF("all")}>All</button>
              {cats.map((c) => (
                <button key={c.value} style={{ ...S.btnG, background: catF === c.value ? `${filterPillAccent}18` : "transparent", color: catF === c.value ? filterPillAccent : V.txM, borderRadius: 20, fontSize: 11, padding: "4px 12px" }} onClick={() => setCatF(c.value)}>{c.label}</button>
              ))}
            </div>
          )}
          <div style={{ maxHeight: 350, overflow: "auto" }}>
            {listMode === "items" && (
              <>
                {filtered.length === 0 && <div style={S.empty}>No items match your search</div>}
                {filtered.map((item) => (
                  <div key={item.id} style={S.catR} onMouseEnter={(e) => (e.currentTarget.style.background = V.bgHover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} onClick={() => onSelect(item)}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: V.txD, marginTop: 2, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                        {regenerationServiceCategoryMode && type === "services" && item.service_category && <span style={S.tag(modalAccent)}>{serviceCategoryLabel(item.service_category)}</span>}
                        {diagnosticsServiceCategoryMode && type === "services" && item.diagnostic_catalog_category && <span style={S.tag(modalAccent)}>{diagnosticsCatalogChipLabel(item.diagnostic_catalog_category)}</span>}
                        {type === "services" && item.pillar && <span style={S.tag(PILLARS[item.pillar]?.color || V.txD)}>{pillarLabel(item.pillar)}</span>}
                        {type !== "services" && item.category && <span style={S.tag(PILLARS.supplements.color)}>{item.category.replace(/_/g, " ")}</span>}
                        {type !== "services" && item.pillar && <span style={S.tag(PILLARS[item.pillar]?.color || V.txD)}>{pillarLabel(item.pillar)}</span>}
                        {item.muscle_group && <span style={S.tag(PILLARS.training.color)}>{item.muscle_group}</span>}
                        {item.equipment && <span style={S.tag(V.txD)}>{item.equipment}</span>}
                        {item.duration !== undefined && item.duration !== null && (
                          <span style={{ color: V.txD, fontSize: 11 }}>
                            {recoveryServiceCategoryMode ? recoveryCatalogDurationLabel(item.duration) : `${item.duration} min`}
                          </span>
                        )}
                      </div>
                    </div>
                    <button type="button" style={S.btnSm}>
                      {recoveryServiceCategoryMode ? "+ Add" : "Add"}
                    </button>
                  </div>
                ))}
              </>
            )}
            {listMode === "programs" && (
              <>
                {filteredPrograms.length === 0 && <div style={S.empty}>No programs match your search</div>}
                {filteredPrograms.map((prog) => (
                  <div key={prog.id} style={S.catR} onMouseEnter={(e) => (e.currentTarget.style.background = V.bgHover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} onClick={() => onSelectProgram?.(prog)}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{prog.name}</div>
                      {prog.description && <div style={{ fontSize: 12, color: V.txM, marginTop: 4 }}>{prog.description}</div>}
                      <div style={{ fontSize: 11, color: V.txD, marginTop: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={{ ...S.tag(V.txM), fontWeight: 600 }}>{prog.item_ids.length} items</span>
                        {regenerationServiceCategoryMode && type === "services" && prog.service_category && <span style={S.tag(modalAccent)}>{serviceCategoryLabel(prog.service_category)}</span>}
                        {type === "services" && prog.pillar && <span style={S.tag(PILLARS[prog.pillar]?.color || V.txD)}>{pillarLabel(prog.pillar)}</span>}
                        {type !== "services" && prog.category && <span style={S.tag(PILLARS.supplements.color)}>{String(prog.category).replace(/_/g, " ")}</span>}
                        {type !== "services" && prog.pillar && <span style={S.tag(PILLARS[prog.pillar]?.color || V.txD)}>{pillarLabel(prog.pillar)}</span>}
                        {type !== "services" && prog.muscle_group && <span style={S.tag(PILLARS.training.color)}>{prog.muscle_group}</span>}
                      </div>
                    </div>
                    <button type="button" style={S.btnSm}>
                      {recoveryServiceCategoryMode ? "+ Add all" : "Add all"}
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Training pillar only — “Add Item” with Items / Programs (does not share CatalogModal) */
function TrainingCatalogModal({ onClose, onSelectItem, onSelectProgram }) {
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("all");
  const [listMode, setListMode] = useState("items");
  const muscleCats = [...new Set(MOCK_TRAINING_ITEMS.map((i) => i.muscle_group))].sort();
  const cats = [{ value: "all", label: "All" }, ...muscleCats.map((g) => ({ value: g, label: g }))];
  const sq = search.trim().toLowerCase();
  const filteredItems = MOCK_TRAINING_ITEMS.filter((i) => {
    const ms = !sq || i.name.toLowerCase().includes(sq);
    const mc = catF === "all" || i.muscle_group === catF;
    return ms && mc;
  });
  const filteredPrograms = TRAINING_CATALOG_PROGRAMS.filter((p) => {
    const ms = !sq || p.name.toLowerCase().includes(sq) || (p.description || "").toLowerCase().includes(sq);
    return ms;
  });
  const segShell = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 0,
    width: "100%",
    padding: 0,
    borderRadius: 6,
    border: "none",
    boxShadow: "none",
    background: "transparent",
    marginBottom: 14,
    boxSizing: "border-box",
    overflow: "hidden",
  };
  const segBtn = (active) => ({
    width: "100%",
    minWidth: 0,
    margin: 0,
    border: "none",
    borderRadius: 0,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: F,
    background: active ? V.acc : `${V.acc}14`,
    color: active ? "#fff" : V.acc,
    transition: "background 0.15s ease, color 0.15s ease",
    outline: "none",
    boxShadow: "none",
    WebkitAppearance: "none",
    appearance: "none",
  });
  const trainingRowAdd = { ...S.btnAddCatalog, fontSize: 12, fontWeight: 500, flexShrink: 0 };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalC} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalH}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Add Item</span>
          <ModalCloseButton onClose={onClose} />
        </div>
        <div style={S.modalB}>
          <input style={S.srch} placeholder="Search Items or programs" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          <div style={segShell} role="tablist" aria-label="Training catalogue">
            <button type="button" role="tab" aria-selected={listMode === "items"} style={segBtn(listMode === "items")} onClick={() => setListMode("items")}>
              Items
            </button>
            <button type="button" role="tab" aria-selected={listMode === "programs"} style={segBtn(listMode === "programs")} onClick={() => setListMode("programs")}>
              Programs
            </button>
          </div>
          {listMode === "items" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {cats.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  style={{
                    ...S.btnG,
                    background: catF === c.value ? `${V.acc}18` : "transparent",
                    color: catF === c.value ? V.acc : V.txM,
                    borderRadius: 20,
                    fontSize: 11,
                    padding: "4px 12px",
                  }}
                  onClick={() => setCatF(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ maxHeight: 350, overflow: "auto" }}>
            {listMode === "items" && (
              <>
                {filteredItems.length === 0 && <div style={S.empty}>No items match your search</div>}
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    style={S.catR}
                    onMouseEnter={(e) => (e.currentTarget.style.background = V.bgHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: V.txD, marginTop: 2, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                        {item.muscle_group && <span style={S.tag(PILLARS.training.color)}>{item.muscle_group}</span>}
                        {item.equipment && <span style={S.tag(V.txD)}>{item.equipment}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      style={trainingRowAdd}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </>
            )}
            {listMode === "programs" && (
              <>
                {filteredPrograms.length === 0 && <div style={S.empty}>No programs match your search</div>}
                {filteredPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    style={S.catR}
                    onMouseEnter={(e) => (e.currentTarget.style.background = V.bgHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{prog.name}</div>
                      {prog.description && <div style={{ fontSize: 12, color: V.txM, marginTop: 4 }}>{prog.description}</div>}
                      <div style={{ fontSize: 11, color: V.txD, marginTop: 6, display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                        {prog.muscle_group && <span style={S.tag(PILLARS.training.color)}>{prog.muscle_group}</span>}
                        {prog.equipment && <span style={S.tag(V.txD)}>{prog.equipment}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      style={trainingRowAdd}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProgram(prog);
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Nutrition pillar — Items / Programs catalogue (mock items + programs) */
function NutritionCatalogModal({ onClose, onSelectItem, onSelectProgram }) {
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("all");
  const [listMode, setListMode] = useState("items");
  /** Tabs + category filters: app accent (blue). “Nutrition” row tags: pillar green. */
  const sq = search.trim().toLowerCase();
  const filteredItems = MOCK_NUTRITION_CATALOG_ITEMS.filter((i) => {
    const ms = !sq || i.name.toLowerCase().includes(sq);
    const mc = catF === "all" || i.category === catF;
    return ms && mc;
  });
  const filteredPrograms = MOCK_NUTRITION_PROGRAMS.filter((p) => {
    const ms = !sq || p.name.toLowerCase().includes(sq) || (p.description || "").toLowerCase().includes(sq);
    return ms;
  });
  const segShell = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 0,
    width: "100%",
    padding: 0,
    borderRadius: 6,
    border: "none",
    boxShadow: "none",
    background: "transparent",
    marginBottom: 14,
    boxSizing: "border-box",
    overflow: "hidden",
  };
  const segBtn = (active) => ({
    width: "100%",
    minWidth: 0,
    margin: 0,
    border: "none",
    borderRadius: 0,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: F,
    background: active ? V.acc : `${V.acc}14`,
    color: active ? "#fff" : V.acc,
    transition: "background 0.15s ease, color 0.15s ease",
    outline: "none",
    boxShadow: "none",
    WebkitAppearance: "none",
    appearance: "none",
  });
  const nutritionRowAdd = { ...S.btnAddCatalog, fontSize: 12, fontWeight: 500, flexShrink: 0 };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalC} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalH}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Add Item</span>
          <ModalCloseButton onClose={onClose} />
        </div>
        <div style={S.modalB}>
          <input style={S.srch} placeholder="Search items or programs" value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          <div style={segShell} role="tablist" aria-label="Nutrition catalogue">
            <button type="button" role="tab" aria-selected={listMode === "items"} style={segBtn(listMode === "items")} onClick={() => setListMode("items")}>
              Items
            </button>
            <button type="button" role="tab" aria-selected={listMode === "programs"} style={segBtn(listMode === "programs")} onClick={() => setListMode("programs")}>
              Programs
            </button>
          </div>
          {listMode === "items" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
              {NUTRITION_CATALOG_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  style={{
                    ...S.btnG,
                    background: catF === c.value ? `${V.acc}18` : "transparent",
                    color: catF === c.value ? V.acc : V.txM,
                    borderRadius: 20,
                    fontSize: 11,
                    padding: "4px 12px",
                  }}
                  onClick={() => setCatF(c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
          <div style={{ maxHeight: 350, overflow: "auto" }}>
            {listMode === "items" && (
              <>
                {filteredItems.length === 0 && <div style={S.empty}>No items match your search</div>}
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    style={S.catR}
                    onMouseEnter={(e) => (e.currentTarget.style.background = V.bgHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: V.txD, marginTop: 4 }}>
                        <span style={S.tag(PILLARS.nutrition.color)}>Nutrition</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      style={nutritionRowAdd}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </>
            )}
            {listMode === "programs" && (
              <>
                {filteredPrograms.length === 0 && <div style={S.empty}>No programs match your search</div>}
                {filteredPrograms.map((prog) => (
                  <div
                    key={prog.id}
                    style={S.catR}
                    onMouseEnter={(e) => (e.currentTarget.style.background = V.bgHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{prog.name}</div>
                      {prog.description && <div style={{ fontSize: 12, color: V.txM, marginTop: 4 }}>{prog.description}</div>}
                      <div style={{ fontSize: 11, color: V.txD, marginTop: 6 }}>
                        <span style={S.tag(PILLARS.nutrition.color)}>Nutrition</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      style={nutritionRowAdd}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProgram(prog);
                      }}
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Training day — pick a single exercise from the master list (does not use CatalogModal) */
function TrainingExerciseModal({ onClose, onSelectExercise }) {
  const [search, setSearch] = useState("");
  const [catF, setCatF] = useState("all");
  const exercises = MOCK_CATALOG.exercises;
  const muscleCats = [...new Set(exercises.map((e) => e.muscle_group))].sort();
  const cats = [{ value: "all", label: "All" }, ...muscleCats.map((g) => ({ value: g, label: g }))];
  const sq = search.trim().toLowerCase();
  const filtered = exercises.filter((e) => {
    const ms =
      !sq ||
      e.name.toLowerCase().includes(sq) ||
      (e.muscle_group || "").toLowerCase().includes(sq) ||
      (e.equipment || "").toLowerCase().includes(sq);
    const mc = catF === "all" || e.muscle_group === catF;
    return ms && mc;
  });
  const trainingRowAdd = { ...S.btnAddCatalog, fontSize: 12, fontWeight: 500, flexShrink: 0 };

  return (
    <div style={S.modal} onClick={onClose}>
      <div style={S.modalC} onClick={(e) => e.stopPropagation()}>
        <div style={S.modalH}>
          <span style={{ fontSize: 15, fontWeight: 600 }}>Add exercise</span>
          <ModalCloseButton onClose={onClose} />
        </div>
        <div style={S.modalB}>
          <input style={S.srch} placeholder="Search exercises..." value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
            {cats.map((c) => (
              <button
                key={c.value}
                type="button"
                style={{
                  ...S.btnG,
                  background: catF === c.value ? `${V.acc}18` : "transparent",
                  color: catF === c.value ? V.acc : V.txM,
                  borderRadius: 20,
                  fontSize: 11,
                  padding: "4px 12px",
                }}
                onClick={() => setCatF(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div style={{ maxHeight: 350, overflow: "auto" }}>
            {filtered.length === 0 && <div style={S.empty}>No exercises match your search</div>}
            {filtered.map((ex) => (
              <div
                key={ex.id}
                style={S.catR}
                onMouseEnter={(e) => (e.currentTarget.style.background = V.bgHover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{ex.name}</div>
                  <div style={{ fontSize: 11, color: V.txD, marginTop: 2, display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                    {ex.muscle_group && <span style={S.tag(PILLARS.training.color)}>{ex.muscle_group}</span>}
                    {ex.equipment && <span style={S.tag(V.txD)}>{ex.equipment}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  style={trainingRowAdd}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectExercise(ex);
                  }}
                >
                  + Add
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SupplementItem({ item, onChange, onRemove }) {
  const u = (f, v) => onChange({ ...item, [f]: v });
  const [iconOpen, setIconOpen] = useState(false);
  const iconId = item.icon_id || DEFAULT_SUPPLEMENT_ICON_ID;
  return (
    <div style={S.iRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button
            type="button"
            aria-label="Choose icon"
            onClick={(e) => {
              e.stopPropagation();
              setIconOpen(true);
            }}
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: `1px solid ${V.bdr}`,
              background: V.bgCard,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <SupplementIconGlyph id={iconId} size={22} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input id={`sup-name-${item.id}`} style={S.inp} value={item.name || ""} onChange={(e) => u("name", e.target.value)} placeholder="Supplement name" aria-label="Supplement name" />
          </div>
          <button type="button" style={{ ...S.btnD, flexShrink: 0 }} onClick={onRemove}>
            Remove
          </button>
        </div>
        {iconOpen && (
          <SupplementIconPickerModal value={iconId} onChange={(id) => u("icon_id", id)} onClose={() => setIconOpen(false)} />
        )}
        <div style={{ ...S.fg, marginBottom: 12 }}>
          <div style={{ ...S.fld, flex: 1, minWidth: 120 }}>
            <label style={S.lbl}>Dosage</label>
            <input style={S.inp} value={item.dosage || ""} onChange={(e) => u("dosage", e.target.value)} placeholder="e.g. 1 scoop" />
          </div>
          <div style={{ ...S.fld, flex: 1, minWidth: 120 }}>
            <label style={S.lbl}>Route</label>
            <input style={S.inp} value={item.route || ""} onChange={(e) => u("route", e.target.value)} placeholder="e.g. oral" />
          </div>
        </div>
        <div style={{ ...S.fg, marginBottom: 12 }}>
          <div style={{ ...S.fld, flex: 1, minWidth: 100 }}>
            <label style={S.lbl}>Recurrence</label>
            <RecurrenceSelect item={item} onItemChange={onChange} recurrenceFallback="daily" />
          </div>
          <div style={{ ...S.fld, flex: 1, minWidth: 100 }}>
            <label style={S.lbl}>Starting at</label>
            <input style={S.inp} type="date" value={item.start_date || ""} onChange={(e) => u("start_date", e.target.value)} />
          </div>
          <div style={{ ...S.fld, flex: 1, minWidth: 100 }}>
            <label style={S.lbl}>Ending on</label>
            <input style={S.inp} type="date" value={item.end_date || ""} onChange={(e) => u("end_date", e.target.value)} />
          </div>
          <div style={{ ...S.fld, flex: 1, minWidth: 100 }}>
            <label style={S.lbl}>Time</label>
            <input style={S.inp} type="time" value={item.anchor_time || ""} onChange={(e) => u("anchor_time", e.target.value)} />
          </div>
        </div>
        <div style={S.fg}>
          <div style={S.fldF}>
            <label style={S.lbl}>Instructions</label>
            <textarea style={S.ta} value={item.instructions || ""} onChange={(e) => u("instructions", e.target.value)} />
          </div>
        </div>
        <div style={S.ctxBox}>
          <div style={{ ...S.lbl, marginBottom: 16 }}>Context fields</div>
          <div style={{ marginBottom: 16 }}>
            <div style={S.fldF}>
              <label style={S.lbl}>The what</label>
              <textarea style={S.ta} placeholder="What is this item? Describe it clearly and concisely." value={item.context_what || ""} onChange={(e) => u("context_what", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={S.fldF}>
              <label style={S.lbl}>The expectations</label>
              <textarea style={S.ta} placeholder="What outcomes or results should the patient expect from this?" value={item.context_expectations || ""} onChange={(e) => u("context_expectations", e.target.value)} />
            </div>
          </div>
          <div style={S.fldF}>
            <label style={S.lbl}>The why</label>
            <textarea style={S.ta} placeholder="Why is this included in the protocol? What's the clinical rationale?" value={item.context_why || ""} onChange={(e) => u("context_why", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RecoveryServiceItem({ item, onChange, onRemove, accentColor = PILLARS.recovery.color, sessionTypeOptions = RECOVERY_SESSION_TYPES }) {
  const u = (f, v) => onChange({ ...item, [f]: v });
  const [iconOpen, setIconOpen] = useState(false);
  const iconId = item.icon_id || DEFAULT_SUPPLEMENT_ICON_ID;
  const kind = item.recovery_item_type || "session";
  const recurrenceFallback = item.recurrence_type || legacyServiceFrequencyToRecurrence(item.frequency);
  const ctxBoxRecovery = { background: `${accentColor}0c`, border: `1px solid ${accentColor}22`, borderRadius: 10, padding: 14, marginTop: 12 };
  /** Label + control stack — tighter to mock vertical rhythm */
  const rf = { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 };
  /** Same 4-col track as recurrence row — Item type = 1 col, Session type = 3 cols */
  const gridSchedule4 = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, marginBottom: 16, alignItems: "start" };
  /** Same width as one field in the 4-col recurrence row (gap 16px → 3 gaps) */
  const itemTypeColMatchSchedule = { width: "calc((100% - 48px) / 4)", maxWidth: "100%", minWidth: 120, boxSizing: "border-box" };

  return (
    <div style={S.iRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button
            type="button"
            aria-label="Choose icon"
            onClick={(e) => {
              e.stopPropagation();
              setIconOpen(true);
            }}
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: `1px solid ${V.bdr}`,
              background: V.bgCard,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <SupplementIconGlyph id={iconId} size={22} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input style={S.inp} value={item.name || ""} onChange={(e) => u("name", e.target.value)} placeholder="Item name" aria-label="Item name" />
          </div>
          <button type="button" style={{ ...S.btnD, flexShrink: 0 }} onClick={onRemove}>
            Remove
          </button>
        </div>
        {iconOpen && <SupplementIconPickerModal value={iconId} onChange={(id) => u("icon_id", id)} onClose={() => setIconOpen(false)} />}

        {kind === "session" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16, alignItems: "flex-start" }}>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Item type</label>
              <select style={{ ...S.sel, width: "100%" }} value={kind} onChange={(e) => u("recovery_item_type", e.target.value)}>
                {RECOVERY_ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Session type</label>
              <select style={{ ...S.sel, width: "100%" }} value={item.recovery_session_type || "Massages"} onChange={(e) => u("recovery_session_type", e.target.value)}>
                {sessionTypeOptions.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {kind === "task" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Item type</label>
              <select style={{ ...S.sel, width: "100%" }} value={kind} onChange={(e) => u("recovery_item_type", e.target.value)}>
                {RECOVERY_ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {kind === "assessment" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Item type</label>
              <select style={{ ...S.sel, width: "100%" }} value={kind} onChange={(e) => u("recovery_item_type", e.target.value)}>
                {RECOVERY_ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: V.txM, marginTop: 8 }}>Assessment scheduling and scoring will be configurable in a future update.</div>
          </div>
        )}

        {kind === "session" && (
          <div style={gridSchedule4}>
            <div style={rf}>
              <label style={S.lbl}>Recurrence</label>
              <RecurrenceSelect item={item} onItemChange={onChange} recurrenceFallback={recurrenceFallback} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Starting at</label>
              <input style={S.inp} type="date" value={item.start_date || ""} onChange={(e) => u("start_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Ending on</label>
              <input style={S.inp} type="date" value={item.end_date || ""} onChange={(e) => u("end_date", e.target.value)} />
            </div>
            <ConciergeReminderField
              itemId={item.id}
              value={item.concierge_reminder_days}
              onChange={(v) => u("concierge_reminder_days", v)}
            />
          </div>
        )}

        {kind === "task" && (
          <div style={gridSchedule4}>
            <div style={rf}>
              <label style={S.lbl}>Recurrence</label>
              <RecurrenceSelect item={item} onItemChange={onChange} recurrenceFallback={recurrenceFallback} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Starting at</label>
              <input style={S.inp} type="date" value={item.start_date || ""} onChange={(e) => u("start_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Ending on</label>
              <input style={S.inp} type="date" value={item.end_date || ""} onChange={(e) => u("end_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Time</label>
              <input style={S.inp} type="time" value={item.anchor_time || ""} onChange={(e) => u("anchor_time", e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ marginBottom: 4 }}>
          <div style={{ ...rf, width: "100%" }}>
            <label style={S.lbl}>Instructions</label>
            <textarea style={S.ta} value={item.notes || ""} onChange={(e) => u("notes", e.target.value)} />
          </div>
        </div>

        <div style={ctxBoxRecovery}>
          <div style={{ ...S.lbl, marginBottom: 16 }}>Context fields</div>
          <div style={{ marginBottom: 16 }}>
            <div style={S.fldF}>
              <label style={S.lbl}>The what</label>
              <textarea style={S.ta} placeholder="What is this item? Describe it clearly and concisely." value={item.context_what || ""} onChange={(e) => u("context_what", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={S.fldF}>
              <label style={S.lbl}>The expectations</label>
              <textarea style={S.ta} placeholder="What outcomes or results should the patient expect from this?" value={item.context_expectations || ""} onChange={(e) => u("context_expectations", e.target.value)} />
            </div>
          </div>
          <div style={S.fldF}>
            <label style={S.lbl}>The why</label>
            <textarea style={S.ta} placeholder="Why is this included in the protocol? What's the clinical rationale?" value={item.context_why || ""} onChange={(e) => u("context_why", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionItemCard({ item, onChange, onRemove, accentColor = PILLARS.nutrition.color }) {
  const u = (f, v) => onChange({ ...item, [f]: v });
  const [iconOpen, setIconOpen] = useState(false);
  const iconId = item.icon_id || DEFAULT_SUPPLEMENT_ICON_ID;
  const kind = item.nutrition_item_type || "task";
  const recurrenceFallback = item.recurrence_type || "custom";
  const ctxBox = { background: `${accentColor}0c`, border: `1px solid ${accentColor}22`, borderRadius: 10, padding: 14, marginTop: 12 };
  const rf = { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 };
  const gridSchedule4 = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, marginBottom: 16, alignItems: "start" };
  const itemTypeColMatchSchedule = { width: "calc((100% - 48px) / 4)", maxWidth: "100%", minWidth: 120, boxSizing: "border-box" };

  return (
    <div style={S.iRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button
            type="button"
            aria-label="Choose icon"
            onClick={(e) => {
              e.stopPropagation();
              setIconOpen(true);
            }}
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: `1px solid ${V.bdr}`,
              background: V.bgCard,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <SupplementIconGlyph id={iconId} size={22} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              style={S.inp}
              value={item.name || ""}
              onChange={(e) => u("name", e.target.value)}
              placeholder="e.g. 16:8 Intermittent Fasting"
              aria-label="Item name"
            />
          </div>
          <button type="button" style={{ ...S.btnD, flexShrink: 0 }} onClick={onRemove}>
            Remove
          </button>
        </div>
        {iconOpen && <SupplementIconPickerModal value={iconId} onChange={(id) => u("icon_id", id)} onClose={() => setIconOpen(false)} />}

        {kind === "session" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16, alignItems: "flex-start" }}>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Item type</label>
              <select style={{ ...S.sel, width: "100%" }} value={kind} onChange={(e) => u("nutrition_item_type", e.target.value)}>
                {NUTRITION_ITEM_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Session type</label>
              <select style={{ ...S.sel, width: "100%" }} value={item.nutrition_session_type || "Consultation"} onChange={(e) => u("nutrition_session_type", e.target.value)}>
                {NUTRITION_SESSION_TYPES.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {kind === "task" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Item type</label>
              <select style={{ ...S.sel, width: "100%" }} value={kind} onChange={(e) => u("nutrition_item_type", e.target.value)}>
                {NUTRITION_ITEM_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {kind === "session" && (
          <div style={gridSchedule4}>
            <div style={rf}>
              <label style={S.lbl}>Recurrence</label>
              <RecurrenceSelect item={item} onItemChange={onChange} recurrenceFallback={recurrenceFallback} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Starting at</label>
              <input style={S.inp} type="date" value={item.start_date || ""} onChange={(e) => u("start_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Ending on</label>
              <input style={S.inp} type="date" value={item.end_date || ""} onChange={(e) => u("end_date", e.target.value)} />
            </div>
            <ConciergeReminderField
              itemId={item.id}
              value={item.concierge_reminder_days}
              onChange={(v) => u("concierge_reminder_days", v)}
            />
          </div>
        )}

        {kind === "task" && (
          <div style={gridSchedule4}>
            <div style={rf}>
              <label style={S.lbl}>Recurrence</label>
              <RecurrenceSelect item={item} onItemChange={onChange} recurrenceFallback={recurrenceFallback} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Starting at</label>
              <input style={S.inp} type="date" value={item.start_date || ""} onChange={(e) => u("start_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Ending on</label>
              <input style={S.inp} type="date" value={item.end_date || ""} onChange={(e) => u("end_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Time</label>
              <input style={S.inp} type="time" value={item.anchor_time || ""} onChange={(e) => u("anchor_time", e.target.value)} />
            </div>
          </div>
        )}

        <div style={{ marginBottom: 4 }}>
          <div style={{ ...rf, width: "100%" }}>
            <label style={S.lbl}>Instructions</label>
            <textarea style={S.ta} value={item.instructions || ""} onChange={(e) => u("instructions", e.target.value)} />
          </div>
        </div>

        <div style={ctxBox}>
          <div style={{ ...S.lbl, marginBottom: 16 }}>Context fields</div>
          <div style={{ marginBottom: 16 }}>
            <div style={S.fldF}>
              <label style={S.lbl}>The what</label>
              <textarea style={S.ta} placeholder="What is this item? Describe it clearly and concisely." value={item.context_what || ""} onChange={(e) => u("context_what", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={S.fldF}>
              <label style={S.lbl}>The expectations</label>
              <textarea style={S.ta} placeholder="What outcomes or results should the patient expect from this?" value={item.context_expectations || ""} onChange={(e) => u("context_expectations", e.target.value)} />
            </div>
          </div>
          <div style={S.fldF}>
            <label style={S.lbl}>The why</label>
            <textarea style={S.ta} placeholder="Why is this included in the protocol? What's the clinical rationale?" value={item.context_why || ""} onChange={(e) => u("context_why", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function NutritionEditor({ data, onChange }) {
  const u = (f, v) => onChange({ ...data, [f]: v });
  const macros = data.macros || {};
  const um = (k, v) => u("macros", { ...macros, [k]: v });
  const meals = data.meals || [];
  const addMeal = () => u("meals", [...meals, { id: gid(), name: "", time: "", notes: "" }]);
  const updateMeal = (i, field, val) => { const m = [...meals]; m[i] = { ...m[i], [field]: val }; u("meals", m); };
  const removeMeal = (i) => u("meals", meals.filter((_, j) => j !== i));
  return (
    <div>
      <div style={S.fg}>
        <div style={{ ...S.fld, flex: 2 }}><label style={S.lbl}>Plan name</label><input style={S.inp} value={data.plan_name || ""} onChange={(e) => u("plan_name", e.target.value)} placeholder="e.g. 16:8 Intermittent Fasting" /></div>
        <div style={S.fld}><label style={S.lbl}>Duration</label><input style={S.inp} value={data.plan_duration || ""} onChange={(e) => u("plan_duration", e.target.value)} placeholder="e.g. 60 days" /></div>
      </div>
      <div style={S.secH(PILLARS.nutrition.color)}><span style={{ fontSize: 13, fontWeight: 600 }}>Macro targets</span></div>
      <div style={S.fg}>
        <div style={S.fld}><label style={S.lbl}>Calories</label><input style={S.inp} type="number" value={macros.calories || ""} onChange={(e) => um("calories", e.target.value)} /></div>
        <div style={S.fld}><label style={S.lbl}>Protein (g)</label><input style={S.inp} type="number" value={macros.protein_g || ""} onChange={(e) => um("protein_g", e.target.value)} /></div>
        <div style={S.fld}><label style={S.lbl}>Carbs (g)</label><input style={S.inp} type="number" value={macros.carbs_g || ""} onChange={(e) => um("carbs_g", e.target.value)} /></div>
        <div style={S.fld}><label style={S.lbl}>Fat (g)</label><input style={S.inp} type="number" value={macros.fat_g || ""} onChange={(e) => um("fat_g", e.target.value)} /></div>
      </div>
      <div style={S.fg}>
        <div style={S.fld}><label style={S.lbl}>Fiber (g)</label><input style={S.inp} type="number" value={macros.fiber_g || ""} onChange={(e) => um("fiber_g", e.target.value)} /></div>
        <div style={S.fld}><label style={S.lbl}>Water (oz/day)</label><input style={S.inp} type="number" value={macros.water_oz || ""} onChange={(e) => um("water_oz", e.target.value)} /></div>
        <div style={{ ...S.fld, flex: 2 }}><label style={S.lbl}>Macro notes</label><input style={S.inp} value={macros.notes || ""} onChange={(e) => um("notes", e.target.value)} placeholder="e.g. Adjust carbs on rest days to 150g" /></div>
      </div>
      <div style={S.fg}><div style={S.fldF}><label style={S.lbl}>Foods to include</label><textarea style={S.ta} placeholder="One per line" value={data.foods_include || ""} onChange={(e) => u("foods_include", e.target.value)} /></div></div>
      <div style={S.fg}><div style={S.fldF}><label style={S.lbl}>Foods to exclude</label><textarea style={S.ta} placeholder="One per line" value={data.foods_exclude || ""} onChange={(e) => u("foods_exclude", e.target.value)} /></div></div>
      <div style={{ ...S.secH(PILLARS.nutrition.color), marginTop: 8 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Fasting windows</span></div>
      <div style={S.fg}>
        <div style={S.fld}><label style={S.lbl}>Fasting start</label><input style={S.inp} type="time" value={data.fasting_start || ""} onChange={(e) => u("fasting_start", e.target.value)} /></div>
        <div style={S.fld}><label style={S.lbl}>Fasting end</label><input style={S.inp} type="time" value={data.fasting_end || ""} onChange={(e) => u("fasting_end", e.target.value)} /></div>
        <div style={S.fld}><label style={S.lbl}>Feeding window (hrs)</label><input style={S.inp} type="number" value={data.feeding_window_hours || ""} onChange={(e) => u("feeding_window_hours", e.target.value)} /></div>
        <div style={S.fld}><label style={S.lbl}>Fasting notes</label><input style={S.inp} value={data.fasting_notes || ""} onChange={(e) => u("fasting_notes", e.target.value)} placeholder="e.g. Black coffee OK during fast" /></div>
      </div>
      <div style={{ ...S.secH(PILLARS.nutrition.color), marginTop: 8, justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>Meal schedule</span>
        <button type="button" style={S.btnSm} onClick={addMeal}>
          Add meal
        </button>
      </div>
      {meals.length === 0 && <div style={{ ...S.empty, padding: "16px" }}>No meals defined — add meals to set timing and notes</div>}
      {meals.map((meal, i) => (
        <div key={meal.id} style={{ ...S.iRow, padding: "8px 12px", alignItems: "center" }}>
          <span style={{ color: V.txD, fontFamily: M, fontSize: 11, width: 18, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
          <div style={{ display: "flex", gap: 8, flex: 1, alignItems: "center", flexWrap: "wrap" }}>
            <input style={{ ...S.inp, width: 120, flexShrink: 0 }} value={meal.name} onChange={(e) => updateMeal(i, "name", e.target.value)} placeholder="Meal name" />
            <input style={{ ...S.inp, width: 90, flexShrink: 0 }} type="time" value={meal.time} onChange={(e) => updateMeal(i, "time", e.target.value)} />
            <input style={{ ...S.inp, flex: 1, minWidth: 150 }} value={meal.notes} onChange={(e) => updateMeal(i, "notes", e.target.value)} placeholder="Notes — what to eat, portion guidance..." />
            <button type="button" style={{ ...S.btnG, color: V.danger, padding: "2px 6px", fontSize: 11, flexShrink: 0 }} onClick={() => removeMeal(i)}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <div style={{ ...S.secH(PILLARS.nutrition.color), marginTop: 8 }}><span style={{ fontSize: 13, fontWeight: 600 }}>Additional notes</span></div>
      <div style={S.fg}><div style={S.fldF}><textarea style={S.ta} value={data.notes || ""} onChange={(e) => u("notes", e.target.value)} placeholder="Reintroduction phases, cycling notes, special considerations..." /></div></div>
    </div>
  );
}

function TrainingItemCard({ item, onChange, onRemove, onAddExercise, onAddFromCatalog }) {
  const u = (f, v) => onChange({ ...item, [f]: v });
  const [iconOpen, setIconOpen] = useState(false);
  const iconId = item.icon_id || DEFAULT_SUPPLEMENT_ICON_ID;
  const kind = item.training_item_type || "task";
  const recurrenceFallback = item.recurrence_type || "custom";
  const exs = item.exercises || [];
  const hasCardioRow = exs.some((ex) => (ex.muscle_group || "").toLowerCase() === "cardio");
  const isCardioExercise = (ex) => (ex.muscle_group || "").toLowerCase() === "cardio";
  const rf = { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 };
  const gridSchedule4 = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, marginBottom: 16, alignItems: "start" };
  const itemTypeColMatchSchedule = { width: "calc((100% - 48px) / 4)", maxWidth: "100%", minWidth: 120, boxSizing: "border-box" };
  const ctxBoxTraining = { background: `${PILLARS.training.color}0c`, border: `1px solid ${PILLARS.training.color}22`, borderRadius: 10, padding: 14, marginTop: 12 };
  const exNest = { border: `1px solid ${V.bdr}`, borderRadius: 8, overflow: "hidden", marginTop: 12, background: V.bgCard };

  const updateExerciseRow = (i, patch) => {
    const next = [...exs];
    next[i] = { ...next[i], ...patch };
    u("exercises", next);
  };

  return (
    <div style={S.iRow}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button
            type="button"
            aria-label="Choose icon"
            onClick={(e) => {
              e.stopPropagation();
              setIconOpen(true);
            }}
            style={{
              width: 40,
              height: 40,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              border: `1px solid ${V.bdr}`,
              background: V.bgCard,
              cursor: "pointer",
              padding: 0,
            }}
          >
            <SupplementIconGlyph id={iconId} size={22} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              style={S.inp}
              value={item.name || ""}
              onChange={(e) => u("name", e.target.value)}
              placeholder="e.g. Self guided lower body workout A"
              aria-label="Workout name"
            />
          </div>
          <button type="button" style={{ ...S.btnD, flexShrink: 0 }} onClick={onRemove}>
            Remove
          </button>
        </div>
        {iconOpen && <SupplementIconPickerModal value={iconId} onChange={(id) => u("icon_id", id)} onClose={() => setIconOpen(false)} />}

        {kind === "session" && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginBottom: 16, alignItems: "flex-start" }}>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Item type</label>
              <select style={{ ...S.sel, width: "100%" }} value={kind} onChange={(e) => u("training_item_type", e.target.value)}>
                {RECOVERY_ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {kind === "task" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Item type</label>
              <select style={{ ...S.sel, width: "100%" }} value={kind} onChange={(e) => u("training_item_type", e.target.value)}>
                {RECOVERY_ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {kind === "assessment" && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...rf, ...itemTypeColMatchSchedule }}>
              <label style={S.lbl}>Item type</label>
              <select style={{ ...S.sel, width: "100%" }} value={kind} onChange={(e) => u("training_item_type", e.target.value)}>
                {RECOVERY_ITEM_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={{ fontSize: 12, color: V.txM, marginTop: 8 }}>Assessment scheduling and scoring will be configurable in a future update.</div>
          </div>
        )}

        {kind === "session" && (
          <div style={gridSchedule4}>
            <div style={rf}>
              <label style={S.lbl}>Recurrence</label>
              <RecurrenceSelect item={item} onItemChange={onChange} recurrenceFallback={recurrenceFallback} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Starting at</label>
              <input style={S.inp} type="date" value={item.start_date || ""} onChange={(e) => u("start_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Ending on</label>
              <input style={S.inp} type="date" value={item.end_date || ""} onChange={(e) => u("end_date", e.target.value)} />
            </div>
            <ConciergeReminderField
              itemId={item.id}
              value={item.concierge_reminder_days}
              onChange={(v) => u("concierge_reminder_days", v)}
            />
          </div>
        )}

        {kind === "task" && (
          <div style={gridSchedule4}>
            <div style={rf}>
              <label style={S.lbl}>Recurrence</label>
              <RecurrenceSelect item={item} onItemChange={onChange} recurrenceFallback={recurrenceFallback} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Starting at</label>
              <input style={S.inp} type="date" value={item.start_date || ""} onChange={(e) => u("start_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Ending on</label>
              <input style={S.inp} type="date" value={item.end_date || ""} onChange={(e) => u("end_date", e.target.value)} />
            </div>
            <div style={rf}>
              <label style={S.lbl}>Time</label>
              <input style={S.inp} type="time" value={item.anchor_time || ""} onChange={(e) => u("anchor_time", e.target.value)} />
            </div>
          </div>
        )}

        <div style={S.fg}>
          <div style={S.fldF}>
            <label style={S.lbl}>Instructions</label>
            <textarea style={S.ta} value={item.instructions || ""} onChange={(e) => u("instructions", e.target.value)} placeholder="" />
          </div>
        </div>

        <div style={exNest}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderBottom: `1px solid ${V.bdr}`, background: V.bgHover }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Exercises</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: V.txD, whiteSpace: "nowrap" }}>
                {exs.length} exercise{exs.length !== 1 ? "s" : ""}
              </span>
              <button type="button" style={S.btnD} onClick={onRemove}>
                Remove day
              </button>
            </div>
          </div>
          <div style={{ padding: "10px 12px" }}>
            <div style={{ display: "flex", gap: 8, padding: "4px 0 8px", borderBottom: `1px solid ${V.bdr}`, marginBottom: 6, alignItems: "center" }}>
              <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, width: 18, textTransform: "uppercase" }}>#</span>
              <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, flex: 2, textTransform: "uppercase" }}>Exercise</span>
              <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, width: 40, textAlign: "center", textTransform: "uppercase" }}>Sets</span>
              <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, width: 12 }} />
              <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, width: 50, textAlign: "center", textTransform: "uppercase" }}>Reps</span>
              <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, width: 12 }} />
              <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, width: 70, textAlign: "center", textTransform: "uppercase" }}>Weight</span>
              <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, width: 72, textAlign: "center", textTransform: "uppercase", flexShrink: 0 }}>Level</span>
              {hasCardioRow && (
                <span style={{ color: V.txD, fontSize: 10, fontWeight: 600, width: 96, textAlign: "center", textTransform: "uppercase", flexShrink: 0 }}>Time</span>
              )}
              <span style={{ width: 28 }} />
            </div>
            {exs.map((ex, i) => (
              <div
                key={ex.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 0",
                  borderBottom: i < exs.length - 1 ? `1px solid ${V.bdr}33` : "none",
                  fontSize: 13,
                }}
              >
                <span style={{ color: V.txD, fontFamily: M, fontSize: 11, width: 18, textAlign: "right" }}>{i + 1}</span>
                <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                  <span style={{ fontWeight: 500 }}>{ex.name}</span>
                  {ex.muscle_group && (
                    <span style={{ fontSize: 9, fontWeight: 600, padding: "1px 5px", borderRadius: 3, background: `${PILLARS.training.color}18`, color: PILLARS.training.color, textTransform: "uppercase" }}>
                      {ex.muscle_group}
                    </span>
                  )}
                </div>
                <input style={{ ...S.inp, width: 40, textAlign: "center", padding: "4px" }} value={ex.sets || ""} onChange={(e) => updateExerciseRow(i, { sets: e.target.value })} />
                <span style={{ color: V.txD, fontSize: 11 }}>×</span>
                <input style={{ ...S.inp, width: 50, textAlign: "center", padding: "4px" }} value={ex.reps || ""} onChange={(e) => updateExerciseRow(i, { reps: e.target.value })} />
                <span style={{ color: V.txD, fontSize: 11 }}>@</span>
                <input style={{ ...S.inp, width: 70, textAlign: "center", padding: "4px" }} value={ex.target_weight || ""} onChange={(e) => updateExerciseRow(i, { target_weight: e.target.value })} />
                <input
                  style={{ ...S.inp, width: 72, textAlign: "center", padding: "4px", fontSize: 12, flexShrink: 0 }}
                  value={ex.level ?? ""}
                  placeholder="e.g. 2"
                  onChange={(e) => updateExerciseRow(i, { level: e.target.value })}
                  aria-label="Complexity level"
                />
                {hasCardioRow &&
                  (isCardioExercise(ex) ? (
                    <input
                      style={{ ...S.inp, width: 96, textAlign: "center", padding: "4px", fontSize: 12, flexShrink: 0 }}
                      value={ex.duration || ""}
                      placeholder="e.g. 30 min"
                      onChange={(e) => updateExerciseRow(i, { duration: e.target.value })}
                      aria-label="Time"
                    />
                  ) : (
                    <span style={{ width: 96, flexShrink: 0, display: "inline-block" }} aria-hidden />
                  ))}
                <button type="button" aria-label="Remove exercise" style={{ ...S.btnG, color: V.danger, padding: "2px 6px", fontSize: 16, lineHeight: 1, fontWeight: 600 }} onClick={() => u("exercises", exs.filter((_, j) => j !== i))}>
                  ×
                </button>
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              <button type="button" style={S.btnSm} onClick={onAddExercise}>
                + Add exercise
              </button>
              {onAddFromCatalog && (
                <button type="button" style={S.btnAddCatalog} onClick={onAddFromCatalog}>
                  + Add from catalogue
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={ctxBoxTraining}>
          <div style={{ ...S.lbl, marginBottom: 16 }}>Context fields</div>
          <div style={{ marginBottom: 16 }}>
            <div style={S.fldF}>
              <label style={S.lbl}>The what</label>
              <textarea style={S.ta} placeholder="What is this item? Describe it clearly and concisely." value={item.context_what || ""} onChange={(e) => u("context_what", e.target.value)} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={S.fldF}>
              <label style={S.lbl}>The expectations</label>
              <textarea style={S.ta} placeholder="What outcomes or results should the patient expect from this?" value={item.context_expectations || ""} onChange={(e) => u("context_expectations", e.target.value)} />
            </div>
          </div>
          <div style={S.fldF}>
            <label style={S.lbl}>The why</label>
            <textarea style={S.ta} placeholder="Why is this included in the protocol? What's the clinical rationale?" value={item.context_why || ""} onChange={(e) => u("context_why", e.target.value)} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProtocolBuilder() {
  const router = useRouter();
  const [meta, setMeta] = useState({ name: "", clinical_objective: "", clinical_use_case: "", eligibility_criteria: "", contraindications: "", duration: "", status: "draft" });
  const [sections, setSections] = useState([]);
  const [catalogModal, setCatalogModal] = useState(null);
  const [activeSec, setActiveSec] = useState(null);
  const [nutritionCatalogTargetItemId, setNutritionCatalogTargetItemId] = useState(null);
  const [templateModal, setTemplateModal] = useState(false);
  const [collapsed, setCollapsed] = useState({});
  const [activeTab, setActiveTab] = useState("all");

  const saveProtocolAndNavigate = (status) => {
    const name = (meta.name || "").trim() || "Untitled protocol";
    addUserProtocol({ name, status });
    router.push("/protocols");
  };

  const toggle = (id) => setCollapsed((p) => ({ ...p, [id]: !p[id] }));
  const addSection = (pillar) =>
    setSections([...sections, { id: gid(), pillar, name: PILLARS[pillar].label, items: [], nutrition: null, training: null }]);
  const removeSection = (id) => setSections(sections.filter((s) => s.id !== id));
  const updateSection = (id, u) => setSections(sections.map((s) => (s.id === id ? { ...s, ...u } : s)));
  const addItem = (secId, ci, type) => {
    setSections(sections.map((s) => {
      if (s.id !== secId) return s;
      const item = type === "supplement" ? { id: gid(), type: "supplement", catalog_id: ci.id, name: ci.name, supplement_category: ci.category, icon_id: DEFAULT_SUPPLEMENT_ICON_ID, dosage: ci.defaults?.dosage || "", route: ci.defaults?.route || "oral", frequency: ci.defaults?.frequency || "", instructions: ci.defaults?.instructions || "", cycle: "", duration: "", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "", context_what: "", context_expectations: "", context_why: "" }
        : ["recovery", "regeneration", "diagnostics"].includes(s.pillar)
          ? {
              id: gid(),
              type: "service",
              catalog_id: ci.id,
              name: ci.name,
              service_pillar: ci.pillar,
              duration_minutes: ci.duration,
              frequency: "weekly",
              preferred_window: "",
              notes: "",
              start_date: "",
              end_date: "",
              recovery_item_type: "session",
              recovery_session_type: s.pillar === "diagnostics"
                ? guessDiagnosticsSessionType(ci.name)
                : s.pillar === "regeneration" && (ci.name || "").toLowerCase().includes("hyperbaric")
                  ? "Hyperbaric"
                  : guessRecoverySessionType(ci.name),
              icon_id: DEFAULT_SUPPLEMENT_ICON_ID,
              recurrence_type: "custom",
              anchor_time: "",
              concierge_reminder_days: "",
              context_what: "",
              context_expectations: "",
              context_why: "",
            }
          : { id: gid(), type: "service", catalog_id: ci.id, name: ci.name, service_pillar: ci.pillar, duration_minutes: ci.duration, frequency: "weekly", preferred_window: "", notes: "", start_date: "", end_date: "" };
      return { ...s, items: [...s.items, item] };
    }));
    setCatalogModal(null);
  };

  const appendExerciseRowsToActiveTrainingItem = (additions) => {
    setSections((prev) =>
      prev.map((s) => {
        if (!activeSec?.startsWith(`ti-${s.id}-`)) return s;
        const iid = activeSec.substring(`ti-${s.id}-`.length);
        const items = migrateTrainingItems(s).map((it) =>
          it.id === iid ? { ...it, exercises: [...(it.exercises || []), ...additions] } : it,
        );
        return { ...s, items, training: null };
      }),
    );
    setCatalogModal(null);
  };

  const exerciseCatalogRow = (ex) => ({
    id: gid(),
    exercise_id: ex.id,
    name: ex.name,
    sets: "3",
    reps: "8-12",
    target_weight: "",
    level: "",
    muscle_group: ex.muscle_group,
    ...((ex.muscle_group || "").toLowerCase() === "cardio" ? { duration: "" } : {}),
  });

  const resolveTrainingCatalogItem = (tItem) => {
    const resolved = (tItem.exercise_ids || []).map((id) => MOCK_CATALOG.exercises.find((e) => e.id === id)).filter(Boolean);
    if (resolved.length === 0) {
      return [
        {
          id: gid(),
          exercise_id: tItem.id,
          name: tItem.name,
          sets: "3",
          reps: "8-12",
          target_weight: "",
          level: "",
          muscle_group: tItem.muscle_group,
          ...((tItem.muscle_group || "").toLowerCase() === "cardio" ? { duration: "" } : {}),
        },
      ];
    }
    return resolved.map((ex) => exerciseCatalogRow(ex));
  };

  const addProgramFromCatalog = (secId, program, catalogKind) => {
    const catalog = catalogKind === "supplements" ? MOCK_CATALOG.supplements : MOCK_CATALOG.services;
    const resolved = program.item_ids.map((id) => catalog.find((x) => x.id === id)).filter(Boolean);
    if (resolved.length === 0) {
      setCatalogModal(null);
      return;
    }
    setSections((prev) => prev.map((s) => {
      if (s.id !== secId) return s;
      const pillar = s.pillar;
      const additions = resolved.map((ci) =>
        catalogKind === "supplements"
          ? { id: gid(), type: "supplement", catalog_id: ci.id, name: ci.name, supplement_category: ci.category, icon_id: DEFAULT_SUPPLEMENT_ICON_ID, dosage: ci.defaults?.dosage || "", route: ci.defaults?.route || "oral", frequency: ci.defaults?.frequency || "", instructions: ci.defaults?.instructions || "", cycle: "", duration: "", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "", context_what: "", context_expectations: "", context_why: "" }
          : ["recovery", "regeneration", "diagnostics"].includes(pillar)
            ? { id: gid(), type: "service", catalog_id: ci.id, name: ci.name, service_pillar: ci.pillar, duration_minutes: ci.duration, frequency: "weekly", preferred_window: "", notes: "", start_date: "", end_date: "", recovery_item_type: "session", recovery_session_type: pillar === "diagnostics" ? guessDiagnosticsSessionType(ci.name) : pillar === "regeneration" && (ci.name || "").toLowerCase().includes("hyperbaric") ? "Hyperbaric" : guessRecoverySessionType(ci.name), icon_id: DEFAULT_SUPPLEMENT_ICON_ID, recurrence_type: "custom", anchor_time: "", concierge_reminder_days: "", context_what: "", context_expectations: "", context_why: "" }
            : { id: gid(), type: "service", catalog_id: ci.id, name: ci.name, service_pillar: ci.pillar, duration_minutes: ci.duration, frequency: "weekly", preferred_window: "", notes: "", start_date: "", end_date: "" },
      );
      return { ...s, items: [...s.items, ...additions] };
    }));
    setCatalogModal(null);
  };

  const removeItem = (sid, iid) =>
    setSections(
      sections.map((s) => {
        if (s.id !== sid) return s;
        if (s.pillar === "training") {
          const items = migrateTrainingItems(s).filter((i) => i.id !== iid);
          return { ...s, items, training: null };
        }
        return { ...s, items: s.items.filter((i) => i.id !== iid) };
      }),
    );
  const updateItem = (sid, iid, u) =>
    setSections(
      sections.map((s) => {
        if (s.id !== sid) return s;
        if (s.pillar === "training") {
          const items = migrateTrainingItems(s).map((i) => (i.id === iid ? u : i));
          return { ...s, items, training: null };
        }
        return { ...s, items: s.items.map((i) => (i.id === iid ? u : i)) };
      }),
    );

  const addBlankTrainingItem = (secId) => {
    setSections(
      sections.map((s) => {
        if (s.id !== secId || s.pillar !== "training") return s;
        const base = migrateTrainingItems(s);
        const item = {
          id: gid(),
          type: "training",
          icon_id: DEFAULT_SUPPLEMENT_ICON_ID,
          name: "",
          training_item_type: "task",
          recurrence_type: "custom",
          start_date: "",
          end_date: "",
          anchor_time: "",
          concierge_reminder_days: "",
          instructions: "",
          exercises: [],
          context_what: "",
          context_expectations: "",
          context_why: "",
        };
        return { ...s, items: [...base, item], training: null };
      }),
    );
  };

  /** Prepends a blank training row then opens the Items / Programs catalogue for that row */
  const addTrainingItemAndOpenCatalog = (secId) => {
    const newId = gid();
    const blank = {
      id: newId,
      type: "training",
      icon_id: DEFAULT_SUPPLEMENT_ICON_ID,
      name: "",
      training_item_type: "task",
      recurrence_type: "custom",
      start_date: "",
      end_date: "",
      anchor_time: "",
      concierge_reminder_days: "",
      instructions: "",
      exercises: [],
      context_what: "",
      context_expectations: "",
      context_why: "",
    };
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== secId || s.pillar !== "training") return s;
        const base = migrateTrainingItems(s);
        return { ...s, items: [...base, blank], training: null };
      }),
    );
    setActiveSec(`ti-${secId}-${newId}`);
    setCatalogModal("training-catalog");
  };

  const addBlankNutritionItem = (secId) => {
    setSections(
      sections.map((s) => {
        if (s.id !== secId || s.pillar !== "nutrition") return s;
        return { ...s, items: [...(s.items || []), blankNutritionItem()] };
      }),
    );
  };

  const addNutritionItemAndOpenCatalog = (secId) => {
    const newId = gid();
    const blank = blankNutritionItem({ id: newId });
    setSections((prev) =>
      prev.map((s) => (s.id === secId && s.pillar === "nutrition" ? { ...s, items: [...(s.items || []), blank] } : s)),
    );
    setActiveSec(secId);
    setNutritionCatalogTargetItemId(newId);
    setCatalogModal("nutrition-catalog");
  };

  const addBlankSupplement = (secId) => {
    setSections(sections.map((s) => {
      if (s.id !== secId) return s;
      const item = { id: gid(), type: "supplement", catalog_id: "", name: "", supplement_category: "other_supplement", icon_id: DEFAULT_SUPPLEMENT_ICON_ID, dosage: "", route: "oral", frequency: "", instructions: "", cycle: "", duration: "", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "", context_what: "", context_expectations: "", context_why: "" };
      return { ...s, items: [...s.items, item] };
    }));
  };

  const addBlankService = (secId) => {
    setSections(sections.map((s) => {
      if (s.id !== secId) return s;
      const item = ["recovery", "regeneration", "diagnostics"].includes(s.pillar)
        ? {
            id: gid(),
            type: "service",
            catalog_id: "",
            name: "",
            service_pillar: s.pillar,
            duration_minutes: 30,
            frequency: "weekly",
            preferred_window: "",
            notes: "",
            start_date: "",
            end_date: "",
            recovery_item_type: "session",
            recovery_session_type: s.pillar === "diagnostics" ? "MRI Progress Scan" : s.pillar === "regeneration" ? "Hyperbaric" : "Massages",
            icon_id: DEFAULT_SUPPLEMENT_ICON_ID,
            recurrence_type: "custom",
            anchor_time: "",
            concierge_reminder_days: "",
            context_what: "",
            context_expectations: "",
            context_why: "",
          }
        : { id: gid(), type: "service", catalog_id: "", name: "", service_pillar: s.pillar, duration_minutes: 30, frequency: "weekly", preferred_window: "", notes: "", start_date: "", end_date: "" };
      return { ...s, items: [...s.items, item] };
    }));
  };

  const loadTemplate = (t) => {
    setMeta({ ...meta, name: t.name, clinical_objective: t.description });
    if (t.id === "pt-001") {
      setSections([
        { id: gid(), pillar: "supplements", name: "Core antiparasitics", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-010", name: "VRM1 - Small Parasite Formula", supplement_category: "systemic_formula", dosage: "2 capsules", route: "oral", frequency: "twice daily", instructions: "Take with meals", cycle: "10 days on / 5 days off", duration: "90 days", recurrence_type: "cyclic", anchor_time: "", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-011", name: "VRM2 - Large Parasite Formula", supplement_category: "systemic_formula", dosage: "1 capsule", route: "oral", frequency: "once daily", instructions: "Take 30 min before breakfast", cycle: "", duration: "90 days", recurrence_type: "daily", anchor_time: "07:30", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "supplements", name: "Drainage and binder support", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-020", name: "BioToxin Binder", supplement_category: "compound", dosage: "1 scoop", route: "oral", frequency: "once daily", instructions: "Mix in water. Take 2 hrs away from other supplements", cycle: "", duration: "90 days", recurrence_type: "daily", anchor_time: "21:00", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-021", name: "Activated Charcoal", supplement_category: "other_supplement", dosage: "500mg", route: "oral", frequency: "twice daily", instructions: "Take away from meals and medications", cycle: "", duration: "90 days", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "diagnostics", name: "Lab work", items: [
          { id: gid(), type: "service", catalog_id: "ci-030", name: "GI-MAP Stool Analysis", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 1", notes: "Baseline", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "regeneration", name: "Detox support", items: [
          { id: gid(), type: "service", catalog_id: "ci-040", name: "Infrared Sauna Session", service_pillar: "regeneration", duration_minutes: 45, frequency: "weekly", preferred_window: "", notes: "Hydrate well before session", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-002") {
      setSections([
        { id: gid(), pillar: "supplements", name: "Gut repair — mucosal support", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-020", name: "BioToxin Binder", supplement_category: "compound", dosage: "1 scoop", route: "oral", frequency: "once daily", instructions: "Mix in water. Take on empty stomach 30 min before breakfast. Binds endotoxins.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "06:30", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-062", name: "Collagen Peptides", supplement_category: "other_supplement", dosage: "20g", route: "oral", frequency: "once daily", instructions: "Mix in bone broth or smoothie. Provides glycine and proline for gut lining repair.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "07:30", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-064", name: "Vitamin C", supplement_category: "other_supplement", dosage: "1000mg", route: "oral", frequency: "twice daily", instructions: "Supports collagen synthesis and immune function.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "supplements", name: "Gut repair — microbial balance", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-060", name: "Omega-3 Fish Oil", supplement_category: "other_supplement", dosage: "3000mg", route: "oral", frequency: "twice daily", instructions: "High dose for gut inflammation. Take with meals.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-061", name: "Curcumin Complex", supplement_category: "compound", dosage: "1000mg", route: "oral", frequency: "twice daily", instructions: "Anti-inflammatory. Take with fat source.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "nutrition", name: "Gut healing diet", items: [], training: null, nutrition: {
          plan_name: "Gut Healing Diet", plan_duration: "12 weeks",
          macros: { calories: "2000", protein_g: "140", carbs_g: "200", fat_g: "70", fiber_g: "25", water_oz: "100", notes: "Moderate fiber — increase slowly. Avoid fiber spikes that irritate damaged gut lining." },
          foods_include: "Bone broth daily (16oz minimum) — gelatin for mucosal repair\nCooked vegetables only (raw can irritate) — zucchini, squash, carrots, sweet potato\nFermented foods (introduce week 3): sauerkraut (1 tbsp), kimchi, plain kefir\nWild-caught fish: salmon, cod\nPasture-raised chicken and eggs\nHealthy fats: olive oil, coconut oil, avocado\nWell-cooked grains: white rice, oatmeal (if tolerated)",
          foods_exclude: "Gluten — all forms for full 12 weeks\nDairy (except ghee and kefir after week 3)\nProcessed foods and artificial additives\nNSAIDs — ibuprofen, aspirin (damage gut lining)\nAlcohol\nSpicy foods (weeks 1-4)\nRaw vegetables (weeks 1-4)\nNuts and seeds whole (weeks 1-6, then introduce ground)",
          fasting_start: "", fasting_end: "", feeding_window_hours: "",
          fasting_notes: "No fasting during gut healing. Consistent small meals reduce digestive burden.",
          meals: [
            { id: gid(), name: "Morning broth", time: "07:00", notes: "8oz warm bone broth + collagen peptides. Gentle on empty stomach." },
            { id: gid(), name: "Breakfast", time: "08:00", notes: "2 soft-boiled eggs + well-cooked oatmeal with ghee." },
            { id: gid(), name: "Lunch", time: "12:00", notes: "Poached salmon + steamed zucchini and carrots + white rice." },
            { id: gid(), name: "Afternoon broth", time: "15:00", notes: "8oz bone broth + small handful of soft-cooked vegetables." },
            { id: gid(), name: "Dinner", time: "18:00", notes: "Chicken thighs + sweet potato + steamed spinach + olive oil." },
          ],
          notes: "Phase progression: Weeks 1-4 strictest (no raw, no fermented, no nuts). Weeks 5-8 introduce fermented foods and ground nuts. Weeks 9-12 introduce raw vegetables and whole nuts. Track bowel movements, bloating, and energy daily.",
        }},
        { id: gid(), pillar: "diagnostics", name: "Lab work", items: [
          { id: gid(), type: "service", catalog_id: "ci-030", name: "GI-MAP Stool Analysis", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 1", notes: "Baseline — assess dysbiosis, parasites, inflammation markers, zonulin", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-030", name: "GI-MAP Stool Analysis", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 12", notes: "Follow-up — compare markers, assess protocol effectiveness", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "regeneration", name: "Gut support services", items: [
          { id: gid(), type: "service", catalog_id: "ci-041", name: "Red Light Therapy", service_pillar: "regeneration", duration_minutes: 20, frequency: "biweekly", preferred_window: "", notes: "Abdominal application. 850nm wavelength. Supports tissue repair and reduces inflammation.", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-003") {
      setSections([
        { id: gid(), pillar: "training", name: "Phase 1: Weeks 1-4 — Gentle mobility", items: [], nutrition: null, training: {
          program_name: "Post-Surgical Mobility Phase", duration_weeks: "4",
          notes: "Pain-free movement only. Focus on circulation, ROM, and preventing adhesions. No resistance beyond bodyweight. Ice after every session.",
          days: [
            { id: gid(), day_of_week: 1, name: "Mobility A — Upper body", exercises: [
              { id: gid(), exercise_id: "ex-228", name: "Straight Leg Raise", sets: "3", reps: "10", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-227", name: "Quad Set", sets: "4", reps: "10 (5s hold)", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-229", name: "Heel Slide", sets: "3", reps: "10", target_weight: "BW", muscle_group: "quads" },
            ]},
            { id: gid(), day_of_week: 3, name: "Mobility B — Lower body", exercises: [
              { id: gid(), exercise_id: "ex-230", name: "Prone Hang", sets: "1", reps: "10 min hold", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-229", name: "Heel Slide", sets: "4", reps: "15", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-212", name: "Walking Lunge", sets: "2", reps: "8 (assisted)", target_weight: "BW", muscle_group: "quads" },
            ]},
            { id: gid(), day_of_week: 5, name: "Mobility C — Full body", exercises: [
              { id: gid(), exercise_id: "ex-227", name: "Quad Set", sets: "3", reps: "10 (5s hold)", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-228", name: "Straight Leg Raise", sets: "3", reps: "10", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-231", name: "Step Up", sets: "3", reps: "8 each", target_weight: "BW", muscle_group: "quads" },
            ]},
          ],
        }},
        { id: gid(), pillar: "training", name: "Phase 2: Weeks 5-8 — Strength rebuild", items: [], nutrition: null, training: {
          program_name: "Post-Surgical Strength Phase", duration_weeks: "4",
          notes: "Introduce light resistance. Machines preferred over free weights for stability. Monitor pain levels — stop if pain exceeds 3/10.",
          days: [
            { id: gid(), day_of_week: 1, name: "Strength A", exercises: [
              { id: gid(), exercise_id: "ex-201", name: "Leg Press", sets: "3", reps: "10", target_weight: "90", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-207", name: "Leg Curl", sets: "3", reps: "10", target_weight: "40", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-231", name: "Step Up", sets: "3", reps: "10 each", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-208", name: "Standing Calf Raise", sets: "3", reps: "15", target_weight: "BW", muscle_group: "calves" },
            ]},
            { id: gid(), day_of_week: 3, name: "Strength B", exercises: [
              { id: gid(), exercise_id: "ex-232", name: "Single Leg Press", sets: "3", reps: "8", target_weight: "50", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-218", name: "Hip Thrust", sets: "3", reps: "10", target_weight: "BW", muscle_group: "glutes" },
              { id: gid(), exercise_id: "ex-206", name: "Leg Extension", sets: "3", reps: "10", target_weight: "40", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-212", name: "Walking Lunge", sets: "3", reps: "10 each", target_weight: "BW", muscle_group: "quads" },
            ]},
          ],
        }},
        { id: gid(), pillar: "training", name: "Phase 3: Weeks 9-16 — Functional return", items: [], nutrition: null, training: {
          program_name: "Post-Surgical Functional Phase", duration_weeks: "8",
          notes: "Progressive loading. Introduce free weights. Sport-specific movement patterns. Clear with surgeon before plyometrics.",
          days: [
            { id: gid(), day_of_week: 1, name: "Lower strength", exercises: [
              { id: gid(), exercise_id: "ex-200", name: "Barbell Back Squat", sets: "4", reps: "8", target_weight: "95", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-202", name: "Romanian Deadlift", sets: "3", reps: "10", target_weight: "65", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-219", name: "Bulgarian Split Squat", sets: "3", reps: "8 each", target_weight: "20 lb DB", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-218", name: "Hip Thrust", sets: "3", reps: "10", target_weight: "95", muscle_group: "glutes" },
            ]},
            { id: gid(), day_of_week: 3, name: "Upper maintenance", exercises: [
              { id: gid(), exercise_id: "ex-100", name: "Barbell Bench Press", sets: "3", reps: "10", target_weight: "95", muscle_group: "chest" },
              { id: gid(), exercise_id: "ex-204", name: "Barbell Row", sets: "3", reps: "10", target_weight: "95", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-103", name: "Overhead Barbell Press", sets: "3", reps: "10", target_weight: "65", muscle_group: "shoulders" },
              { id: gid(), exercise_id: "ex-214", name: "Pull-Up", sets: "3", reps: "6-8", target_weight: "BW", muscle_group: "back" },
            ]},
            { id: gid(), day_of_week: 5, name: "Conditioning and agility", exercises: [
              { id: gid(), exercise_id: "ex-233", name: "Box Jump", sets: "3", reps: "6", target_weight: "12 inch", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-234", name: "Lateral Shuffle", sets: "4", reps: "30 sec", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-212", name: "Walking Lunge", sets: "3", reps: "12 each", target_weight: "25 lb DB", muscle_group: "quads" },
            ]},
          ],
        }},
        { id: gid(), pillar: "supplements", name: "Tissue repair support", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-050", name: "BPC-157", supplement_category: "peptide", dosage: "500mcg", route: "injection", frequency: "twice daily", instructions: "Subcutaneous AM and PM. Rotate sites. Primary tissue repair peptide.", cycle: "8 weeks", duration: "8 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-051", name: "TB-500", supplement_category: "peptide", dosage: "750mcg", route: "injection", frequency: "once daily", instructions: "Subcutaneous morning. Systemic healing support. Weeks 1-4 only.", cycle: "4 weeks", duration: "4 weeks", recurrence_type: "daily", anchor_time: "07:00", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-062", name: "Collagen Peptides", supplement_category: "other_supplement", dosage: "20g", route: "oral", frequency: "once daily", instructions: "Mix in smoothie or broth. Connective tissue support.", cycle: "", duration: "16 weeks", recurrence_type: "daily", anchor_time: "07:30", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-060", name: "Omega-3 Fish Oil", supplement_category: "other_supplement", dosage: "2000mg", route: "oral", frequency: "twice daily", instructions: "Anti-inflammatory. Take with meals.", cycle: "", duration: "16 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "recovery", name: "Recovery services", items: [
          { id: gid(), type: "service", catalog_id: "ci-044", name: "Manual Lymphatic Drainage", service_pillar: "recovery", duration_minutes: 60, frequency: "weekly", preferred_window: "Weeks 1-4", notes: "Swelling management. Gentle pressure around surgical site.", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-045", name: "Sports Massage", service_pillar: "recovery", duration_minutes: 60, frequency: "biweekly", preferred_window: "Weeks 5-16", notes: "Begin after acute phase. Scar tissue mobilization.", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-043", name: "Cryotherapy", service_pillar: "recovery", duration_minutes: 15, frequency: "weekly", preferred_window: "Weeks 1-8", notes: "Full body cryo. Anti-inflammatory and pain management.", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "regeneration", name: "Tissue regeneration", items: [
          { id: gid(), type: "service", catalog_id: "ci-041", name: "Red Light Therapy", service_pillar: "regeneration", duration_minutes: 20, frequency: "weekly", preferred_window: "Weeks 2-12", notes: "850nm over surgical site. Accelerates tissue repair.", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-042", name: "Hyperbaric Oxygen Therapy", service_pillar: "regeneration", duration_minutes: 90, frequency: "weekly", preferred_window: "Weeks 1-8", notes: "1.5 ATA. Enhances tissue oxygenation and healing.", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "diagnostics", name: "Progress imaging", items: [
          { id: gid(), type: "service", catalog_id: "ci-032", name: "MRI Progress Scan", service_pillar: "diagnostics", duration_minutes: 45, frequency: "one_time", preferred_window: "Week 8", notes: "Assess tissue healing progress", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-004") {
      setSections([
        { id: gid(), pillar: "nutrition", name: "Phase 1: Metabolic priming (Weeks 1-2)", items: [], training: null, nutrition: {
          plan_name: "Metabolic Priming — Carb Taper", plan_duration: "2 weeks",
          macros: { calories: "1800", protein_g: "160", carbs_g: "100", fat_g: "85", fiber_g: "30", water_oz: "100", notes: "Taper carbs from current intake down to 100g. Keep protein high. Increase fat to maintain satiety." },
          foods_include: "Lean proteins: chicken, turkey, fish, eggs\nHealthy fats: avocado, olive oil, nuts, seeds, coconut oil\nLow-glycemic vegetables: broccoli, spinach, cauliflower, zucchini\nBerries in moderation (1/2 cup)\nSweet potato (small portion, dinner only)",
          foods_exclude: "All processed sugar and artificial sweeteners\nBread, pasta, cereal, baked goods\nFruit juice and soda\nAlcohol\nSeed oils",
          fasting_start: "20:00", fasting_end: "12:00", feeding_window_hours: "8",
          fasting_notes: "Introduce 12:12 fast week 1, progress to 14:10 week 2. Black coffee, green tea, and water OK during fast.",
          meals: [
            { id: gid(), name: "Meal 1 — Break fast", time: "12:00", notes: "3 eggs + avocado + sauteed greens. High fat, moderate protein." },
            { id: gid(), name: "Meal 2", time: "16:00", notes: "Grilled chicken + large salad with olive oil + handful of almonds." },
            { id: gid(), name: "Meal 3", time: "19:30", notes: "Salmon + small sweet potato + steamed broccoli." },
          ],
          notes: "Expect mild fatigue and cravings days 3-5 as body adapts to lower carbs. Electrolytes help. Energy should normalize by day 7.",
        }},
        { id: gid(), pillar: "nutrition", name: "Phase 2: Intermittent fasting (Weeks 3-6)", items: [], training: null, nutrition: {
          plan_name: "16:8 IF with Macro Cycling", plan_duration: "4 weeks",
          macros: { calories: "1900", protein_g: "170", carbs_g: "130", fat_g: "80", fiber_g: "30", water_oz: "110", notes: "Training days: 170g carbs, 60g fat. Rest days: 80g carbs, 100g fat. Protein constant. Caloric cycling around training." },
          foods_include: "Same as Phase 1 plus:\nWhite rice and oats on training days (post-workout)\nBanana pre-workout\nWhey protein post-workout",
          foods_exclude: "Same as Phase 1",
          fasting_start: "20:00", fasting_end: "12:00", feeding_window_hours: "8",
          fasting_notes: "Full 16:8 protocol. Fasting window 20:00-12:00. Morning LMNT electrolytes during fast.",
          meals: [
            { id: gid(), name: "Meal 1 — Break fast", time: "12:00", notes: "Training day: protein + carbs (eggs + oats). Rest day: protein + fat (eggs + avocado)." },
            { id: gid(), name: "Post-workout / Meal 2", time: "15:30", notes: "Training day: whey shake + banana + rice. Rest day: chicken + salad + olive oil." },
            { id: gid(), name: "Meal 3 — Final meal", time: "19:30", notes: "Lean protein + vegetables. Keep carbs low regardless of day type." },
          ],
          notes: "Weigh daily. Track weekly averages. If average drops more than 1.5 lbs/week, increase calories by 150 (from carbs on training days).",
        }},
        { id: gid(), pillar: "nutrition", name: "Phase 3: Metabolic reset (Weeks 7-8)", items: [], training: null, nutrition: {
          plan_name: "Reverse Diet — Metabolic Reset", plan_duration: "2 weeks",
          macros: { calories: "2200", protein_g: "170", carbs_g: "220", fat_g: "75", fiber_g: "35", water_oz: "100", notes: "Reverse diet: increase carbs by 40-50g/week back toward maintenance. Monitor weight — expect 1-2 lb water weight gain from glycogen, not fat." },
          foods_include: "All Phase 2 foods plus:\nFruits: all types reintroduced\nOats, rice, potatoes at most meals\nDairy reintroduction if desired (start with yogurt)",
          foods_exclude: "Continue avoiding processed sugar\nContinue avoiding seed oils\nLimit alcohol to 1-2 drinks/week maximum",
          fasting_start: "", fasting_end: "", feeding_window_hours: "",
          fasting_notes: "Fasting optional in this phase. If maintaining, keep 14:10. If transitioning out, move to normal meal timing.",
          meals: [
            { id: gid(), name: "Breakfast", time: "08:00", notes: "Oats + protein powder + berries + almond butter." },
            { id: gid(), name: "Lunch", time: "12:00", notes: "Chicken or fish + rice + roasted vegetables + olive oil." },
            { id: gid(), name: "Snack", time: "15:30", notes: "Greek yogurt + fruit + granola." },
            { id: gid(), name: "Dinner", time: "18:30", notes: "Lean protein + potato or sweet potato + large salad." },
          ],
          notes: "Goal is to establish sustainable maintenance calories. The number you stabilize at in week 8 is your new metabolic baseline. Do not cut again for at least 4 weeks.",
        }},
        { id: gid(), pillar: "supplements", name: "Metabolic support", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-063", name: "LMNT Electrolytes", supplement_category: "other_supplement", dosage: "1 packet", route: "oral", frequency: "once daily", instructions: "During fasting window. Prevents electrolyte depletion during carb tapering.", cycle: "", duration: "6 weeks", recurrence_type: "daily", anchor_time: "09:00", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-064", name: "Magnesium Glycinate", supplement_category: "other_supplement", dosage: "400mg", route: "oral", frequency: "once daily", instructions: "Before bed. Supports sleep, insulin sensitivity, and recovery.", cycle: "", duration: "8 weeks", recurrence_type: "daily", anchor_time: "21:00", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-060", name: "Omega-3 Fish Oil", supplement_category: "other_supplement", dosage: "2000mg", route: "oral", frequency: "twice daily", instructions: "Anti-inflammatory. Supports metabolic health.", cycle: "", duration: "8 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "diagnostics", name: "Metabolic markers", items: [
          { id: gid(), type: "service", catalog_id: "ci-031", name: "DEXA Body Composition Scan", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 1", notes: "Baseline body comp", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-031", name: "DEXA Body Composition Scan", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 8", notes: "Final — lean mass vs fat change", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-005") {
      setSections([
        { id: gid(), pillar: "training", name: "PPL 6-Day Hypertrophy Split", items: [], nutrition: null, training: {
          program_name: "PPL 6-Day Hypertrophy Split", duration_weeks: "12",
          notes: "Progressive overload: increase weight when hitting top of rep range for all sets. Rest day every 7th day. Deload every 4th week (reduce volume 40%).",
          days: [
            { id: gid(), day_of_week: 1, name: "Push A — Chest focus", exercises: [
              { id: gid(), exercise_id: "ex-100", name: "Barbell Bench Press", sets: "4", reps: "6-8", target_weight: "225", muscle_group: "chest" },
              { id: gid(), exercise_id: "ex-101", name: "Incline Dumbbell Press", sets: "3", reps: "8-10", target_weight: "70", muscle_group: "chest" },
              { id: gid(), exercise_id: "ex-102", name: "Cable Flye", sets: "3", reps: "10-12", target_weight: "30", muscle_group: "chest" },
              { id: gid(), exercise_id: "ex-103", name: "Overhead Barbell Press", sets: "4", reps: "8-10", target_weight: "135", muscle_group: "shoulders" },
              { id: gid(), exercise_id: "ex-215", name: "Dumbbell Lateral Raise", sets: "3", reps: "12-15", target_weight: "20", muscle_group: "shoulders" },
              { id: gid(), exercise_id: "ex-210", name: "Tricep Pushdown", sets: "3", reps: "10-12", target_weight: "60", muscle_group: "triceps" },
            ]},
            { id: gid(), day_of_week: 2, name: "Pull A — Back width", exercises: [
              { id: gid(), exercise_id: "ex-214", name: "Pull-Up", sets: "4", reps: "6-8", target_weight: "BW+25", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-204", name: "Barbell Row", sets: "4", reps: "8-10", target_weight: "185", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-203", name: "Lat Pulldown", sets: "3", reps: "10-12", target_weight: "150", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-205", name: "Face Pull", sets: "3", reps: "12-15", target_weight: "40", muscle_group: "rear delts" },
              { id: gid(), exercise_id: "ex-209", name: "Dumbbell Curl", sets: "3", reps: "10-12", target_weight: "35", muscle_group: "biceps" },
              { id: gid(), exercise_id: "ex-216", name: "Hammer Curl", sets: "3", reps: "10-12", target_weight: "30", muscle_group: "biceps" },
            ]},
            { id: gid(), day_of_week: 3, name: "Legs A — Quad focus", exercises: [
              { id: gid(), exercise_id: "ex-200", name: "Barbell Back Squat", sets: "4", reps: "6-8", target_weight: "315", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-201", name: "Leg Press", sets: "3", reps: "8-10", target_weight: "450", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-211", name: "Hack Squat", sets: "3", reps: "10-12", target_weight: "180", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-206", name: "Leg Extension", sets: "3", reps: "10-12", target_weight: "150", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-212", name: "Walking Lunge", sets: "3", reps: "12-15", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-208", name: "Standing Calf Raise", sets: "4", reps: "15-20", target_weight: "180", muscle_group: "calves" },
            ]},
            { id: gid(), day_of_week: 4, name: "Push B — Shoulder focus", exercises: [
              { id: gid(), exercise_id: "ex-103", name: "Overhead Barbell Press", sets: "4", reps: "6-8", target_weight: "155", muscle_group: "shoulders" },
              { id: gid(), exercise_id: "ex-222", name: "Arnold Press", sets: "3", reps: "8-10", target_weight: "50", muscle_group: "shoulders" },
              { id: gid(), exercise_id: "ex-220", name: "Incline Barbell Bench", sets: "3", reps: "8-10", target_weight: "185", muscle_group: "chest" },
              { id: gid(), exercise_id: "ex-221", name: "Chest Dip", sets: "3", reps: "10-12", target_weight: "BW+25", muscle_group: "chest" },
              { id: gid(), exercise_id: "ex-104", name: "Lateral Raise", sets: "4", reps: "12-15", target_weight: "20", muscle_group: "shoulders" },
              { id: gid(), exercise_id: "ex-217", name: "Skull Crusher", sets: "3", reps: "10-12", target_weight: "75", muscle_group: "triceps" },
            ]},
            { id: gid(), day_of_week: 5, name: "Pull B — Back thickness", exercises: [
              { id: gid(), exercise_id: "ex-223", name: "Deadlift", sets: "4", reps: "5-6", target_weight: "365", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-226", name: "T-Bar Row", sets: "4", reps: "8-10", target_weight: "135", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-213", name: "Seated Cable Row", sets: "3", reps: "10-12", target_weight: "160", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-205", name: "Face Pull", sets: "3", reps: "12-15", target_weight: "45", muscle_group: "rear delts" },
              { id: gid(), exercise_id: "ex-209", name: "Dumbbell Curl", sets: "3", reps: "8-10", target_weight: "40", muscle_group: "biceps" },
              { id: gid(), exercise_id: "ex-216", name: "Hammer Curl", sets: "2", reps: "10-12", target_weight: "30", muscle_group: "biceps" },
            ]},
            { id: gid(), day_of_week: 6, name: "Legs B — Hamstring focus", exercises: [
              { id: gid(), exercise_id: "ex-202", name: "Romanian Deadlift", sets: "4", reps: "8-10", target_weight: "225", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-218", name: "Hip Thrust", sets: "4", reps: "8-10", target_weight: "275", muscle_group: "glutes" },
              { id: gid(), exercise_id: "ex-219", name: "Bulgarian Split Squat", sets: "3", reps: "10-12", target_weight: "50", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-207", name: "Leg Curl", sets: "3", reps: "10-12", target_weight: "120", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-224", name: "Sumo Deadlift", sets: "3", reps: "8-10", target_weight: "275", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-208", name: "Standing Calf Raise", sets: "4", reps: "15-20", target_weight: "180", muscle_group: "calves" },
            ]},
          ],
        }},
        { id: gid(), pillar: "supplements", name: "Training support stack", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-062", name: "Collagen Peptides", supplement_category: "other_supplement", dosage: "20g", route: "oral", frequency: "once daily", instructions: "Mix in coffee or smoothie. Supports joint health under heavy training.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "07:00", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-060", name: "Omega-3 Fish Oil", supplement_category: "other_supplement", dosage: "2000mg", route: "oral", frequency: "twice daily", instructions: "Take with meals. Anti-inflammatory support.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-006") {
      setSections([
        { id: gid(), pillar: "training", name: "Upper/Lower 4-Day Strength", items: [], nutrition: null, training: {
          program_name: "Upper/Lower 4-Day Split", duration_weeks: "8",
          notes: "Strength-focused. 3 min rest on compounds, 90 sec on accessories. Increase weight 5 lbs on upper compounds and 10 lbs on lower compounds every 2 weeks.",
          days: [
            { id: gid(), day_of_week: 1, name: "Upper A — Horizontal push/pull", exercises: [
              { id: gid(), exercise_id: "ex-100", name: "Barbell Bench Press", sets: "5", reps: "5", target_weight: "205", muscle_group: "chest" },
              { id: gid(), exercise_id: "ex-225", name: "Pendlay Row", sets: "5", reps: "5", target_weight: "185", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-101", name: "Incline Dumbbell Press", sets: "3", reps: "8-10", target_weight: "65", muscle_group: "chest" },
              { id: gid(), exercise_id: "ex-213", name: "Seated Cable Row", sets: "3", reps: "10-12", target_weight: "140", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-209", name: "Dumbbell Curl", sets: "3", reps: "10-12", target_weight: "30", muscle_group: "biceps" },
              { id: gid(), exercise_id: "ex-210", name: "Tricep Pushdown", sets: "3", reps: "10-12", target_weight: "50", muscle_group: "triceps" },
            ]},
            { id: gid(), day_of_week: 2, name: "Lower A — Squat emphasis", exercises: [
              { id: gid(), exercise_id: "ex-200", name: "Barbell Back Squat", sets: "5", reps: "5", target_weight: "285", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-202", name: "Romanian Deadlift", sets: "3", reps: "8-10", target_weight: "205", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-201", name: "Leg Press", sets: "3", reps: "10-12", target_weight: "400", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-207", name: "Leg Curl", sets: "3", reps: "10-12", target_weight: "100", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-208", name: "Standing Calf Raise", sets: "4", reps: "12-15", target_weight: "160", muscle_group: "calves" },
            ]},
            { id: gid(), day_of_week: 4, name: "Upper B — Vertical push/pull", exercises: [
              { id: gid(), exercise_id: "ex-103", name: "Overhead Barbell Press", sets: "5", reps: "5", target_weight: "135", muscle_group: "shoulders" },
              { id: gid(), exercise_id: "ex-214", name: "Pull-Up", sets: "5", reps: "5", target_weight: "BW+10", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-222", name: "Arnold Press", sets: "3", reps: "8-10", target_weight: "45", muscle_group: "shoulders" },
              { id: gid(), exercise_id: "ex-203", name: "Lat Pulldown", sets: "3", reps: "10-12", target_weight: "140", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-205", name: "Face Pull", sets: "3", reps: "12-15", target_weight: "35", muscle_group: "rear delts" },
              { id: gid(), exercise_id: "ex-217", name: "Skull Crusher", sets: "3", reps: "10-12", target_weight: "65", muscle_group: "triceps" },
            ]},
            { id: gid(), day_of_week: 5, name: "Lower B — Deadlift emphasis", exercises: [
              { id: gid(), exercise_id: "ex-223", name: "Deadlift", sets: "5", reps: "5", target_weight: "335", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-219", name: "Bulgarian Split Squat", sets: "3", reps: "8-10", target_weight: "45", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-218", name: "Hip Thrust", sets: "3", reps: "10-12", target_weight: "225", muscle_group: "glutes" },
              { id: gid(), exercise_id: "ex-206", name: "Leg Extension", sets: "3", reps: "10-12", target_weight: "130", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-208", name: "Standing Calf Raise", sets: "4", reps: "12-15", target_weight: "160", muscle_group: "calves" },
            ]},
          ],
        }},
      ]);
    }
    if (t.id === "pt-007") {
      setSections([
        { id: gid(), pillar: "training", name: "Phase 1: Weeks 1-4 — ROM and activation", items: [], nutrition: null, training: {
          program_name: "ACL Rehab Phase 1", duration_weeks: "4",
          notes: "Focus on pain-free ROM. No resistance beyond bodyweight. Ice 15 min after every session. Monitor swelling.",
          days: [
            { id: gid(), day_of_week: 1, name: "PT Session A — Quad activation", exercises: [
              { id: gid(), exercise_id: "ex-227", name: "Quad Set", sets: "4", reps: "10 (5s hold)", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-228", name: "Straight Leg Raise", sets: "3", reps: "10", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-229", name: "Heel Slide", sets: "3", reps: "10", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-230", name: "Prone Hang", sets: "1", reps: "10 min hold", target_weight: "BW", muscle_group: "quads" },
            ]},
            { id: gid(), day_of_week: 3, name: "PT Session B — ROM focus", exercises: [
              { id: gid(), exercise_id: "ex-229", name: "Heel Slide", sets: "4", reps: "15", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-230", name: "Prone Hang", sets: "2", reps: "10 min hold", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-227", name: "Quad Set", sets: "3", reps: "10 (5s hold)", target_weight: "BW", muscle_group: "quads" },
            ]},
            { id: gid(), day_of_week: 5, name: "PT Session C — Gait training", exercises: [
              { id: gid(), exercise_id: "ex-228", name: "Straight Leg Raise", sets: "3", reps: "10", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-227", name: "Quad Set", sets: "3", reps: "10 (5s hold)", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-212", name: "Walking Lunge", sets: "2", reps: "10 (assisted)", target_weight: "BW", muscle_group: "quads" },
            ]},
          ],
        }},
        { id: gid(), pillar: "training", name: "Phase 2: Weeks 5-8 — Strength foundation", items: [], nutrition: null, training: {
          program_name: "ACL Rehab Phase 2", duration_weeks: "4",
          notes: "Introduce resistance bands and light bodyweight squats. Begin stationary bike 10 min warm-up. Continue ice post-session.",
          days: [
            { id: gid(), day_of_week: 1, name: "Strength A — Closed chain", exercises: [
              { id: gid(), exercise_id: "ex-200", name: "Barbell Back Squat", sets: "3", reps: "10", target_weight: "Bar only", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-201", name: "Leg Press", sets: "3", reps: "10", target_weight: "90", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-231", name: "Step Up", sets: "3", reps: "8 each", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-228", name: "Straight Leg Raise", sets: "3", reps: "15", target_weight: "2 lb ankle wt", muscle_group: "quads" },
            ]},
            { id: gid(), day_of_week: 3, name: "Strength B — Hamstring and balance", exercises: [
              { id: gid(), exercise_id: "ex-207", name: "Leg Curl", sets: "3", reps: "10", target_weight: "40", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-218", name: "Hip Thrust", sets: "3", reps: "10", target_weight: "BW", muscle_group: "glutes" },
              { id: gid(), exercise_id: "ex-232", name: "Single Leg Press", sets: "3", reps: "8", target_weight: "70", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-208", name: "Standing Calf Raise", sets: "3", reps: "15", target_weight: "BW", muscle_group: "calves" },
            ]},
            { id: gid(), day_of_week: 5, name: "Strength C — Combined", exercises: [
              { id: gid(), exercise_id: "ex-200", name: "Barbell Back Squat", sets: "3", reps: "10", target_weight: "65", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-207", name: "Leg Curl", sets: "3", reps: "10", target_weight: "50", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-231", name: "Step Up", sets: "3", reps: "10 each", target_weight: "10 lb DB", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-212", name: "Walking Lunge", sets: "3", reps: "10 each", target_weight: "BW", muscle_group: "quads" },
            ]},
          ],
        }},
        { id: gid(), pillar: "training", name: "Phase 3: Weeks 9-12 — Functional strength", items: [], nutrition: null, training: {
          program_name: "ACL Rehab Phase 3", duration_weeks: "4",
          notes: "Add weighted exercises and single-leg work. Begin jogging on AlterG at 60% bodyweight week 10. No cutting or pivoting yet.",
          days: [
            { id: gid(), day_of_week: 1, name: "Functional A", exercises: [
              { id: gid(), exercise_id: "ex-200", name: "Barbell Back Squat", sets: "4", reps: "8", target_weight: "135", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-219", name: "Bulgarian Split Squat", sets: "3", reps: "8 each", target_weight: "25 lb DB", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-202", name: "Romanian Deadlift", sets: "3", reps: "10", target_weight: "95", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-232", name: "Single Leg Press", sets: "3", reps: "10", target_weight: "130", muscle_group: "quads" },
            ]},
            { id: gid(), day_of_week: 3, name: "Functional B", exercises: [
              { id: gid(), exercise_id: "ex-218", name: "Hip Thrust", sets: "4", reps: "10", target_weight: "135", muscle_group: "glutes" },
              { id: gid(), exercise_id: "ex-211", name: "Hack Squat", sets: "3", reps: "10", target_weight: "90", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-207", name: "Leg Curl", sets: "3", reps: "10", target_weight: "80", muscle_group: "hamstrings" },
              { id: gid(), exercise_id: "ex-206", name: "Leg Extension", sets: "3", reps: "10", target_weight: "80", muscle_group: "quads" },
            ]},
          ],
        }},
        { id: gid(), pillar: "training", name: "Phase 4: Weeks 13-16 — Sport readiness", items: [], nutrition: null, training: {
          program_name: "ACL Rehab Phase 4", duration_weeks: "4",
          notes: "Plyometrics and agility. Full bodyweight jogging. Lateral movement drills. Return to sport clearance assessment at week 16.",
          days: [
            { id: gid(), day_of_week: 1, name: "Plyo and agility", exercises: [
              { id: gid(), exercise_id: "ex-233", name: "Box Jump", sets: "4", reps: "6", target_weight: "12 inch", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-234", name: "Lateral Shuffle", sets: "4", reps: "30 sec", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-219", name: "Bulgarian Split Squat", sets: "3", reps: "8 each", target_weight: "40 lb DB", muscle_group: "quads" },
            ]},
            { id: gid(), day_of_week: 3, name: "Strength maintenance", exercises: [
              { id: gid(), exercise_id: "ex-200", name: "Barbell Back Squat", sets: "4", reps: "6", target_weight: "185", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-223", name: "Deadlift", sets: "3", reps: "6", target_weight: "225", muscle_group: "back" },
              { id: gid(), exercise_id: "ex-218", name: "Hip Thrust", sets: "3", reps: "10", target_weight: "185", muscle_group: "glutes" },
            ]},
            { id: gid(), day_of_week: 5, name: "Sport-specific drills", exercises: [
              { id: gid(), exercise_id: "ex-233", name: "Box Jump", sets: "3", reps: "8", target_weight: "18 inch", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-234", name: "Lateral Shuffle", sets: "4", reps: "30 sec", target_weight: "BW", muscle_group: "quads" },
              { id: gid(), exercise_id: "ex-212", name: "Walking Lunge", sets: "3", reps: "12 each", target_weight: "30 lb DB", muscle_group: "quads" },
            ]},
          ],
        }},
        { id: gid(), pillar: "recovery", name: "Manual therapy", items: [
          { id: gid(), type: "service", catalog_id: "ci-044", name: "Manual Lymphatic Drainage", service_pillar: "recovery", duration_minutes: 60, frequency: "weekly", preferred_window: "Weeks 1-4", notes: "Swelling management. Gentle pressure around surgical site.", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-045", name: "Sports Massage", service_pillar: "recovery", duration_minutes: 60, frequency: "biweekly", preferred_window: "Weeks 5-16", notes: "Begin after acute phase. Focus on quad, IT band, and calf.", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "diagnostics", name: "Progress assessments", items: [
          { id: gid(), type: "service", catalog_id: "ci-032", name: "MRI Progress Scan", service_pillar: "diagnostics", duration_minutes: 45, frequency: "one_time", preferred_window: "Week 8", notes: "Assess graft healing", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-008") {
      setSections([
        { id: gid(), pillar: "nutrition", name: "16:8 Fasting protocol", items: [], training: null, nutrition: {
          plan_name: "16:8 Intermittent Fasting", plan_duration: "60 days",
          macros: { calories: "2200", protein_g: "185", carbs_g: "200", fat_g: "78", fiber_g: "35", water_oz: "100", notes: "Protein target is 1g per lb bodyweight. Adjust carbs on rest days to 150g." },
          foods_include: "Lean proteins: chicken breast, wild salmon, ground turkey, eggs\nComplex carbs: sweet potato, rice, oats, quinoa\nHealthy fats: avocado, olive oil, nuts, seeds\nVegetables: unlimited non-starchy greens",
          foods_exclude: "Processed sugar\nSeed oils: canola, soybean, sunflower\nAlcohol during protocol\nDairy — suspected sensitivity (reintroduce after 30 days if GI symptoms resolve)",
          fasting_start: "20:00", fasting_end: "12:00", feeding_window_hours: "8",
          fasting_notes: "Black coffee and water permitted during fast. LMNT electrolytes OK during fasting window.",
          meals: [
            { id: gid(), name: "Meal 1 — Break fast", time: "12:00", notes: "High protein, moderate carb. Eggs + lean meat + rice or oats." },
            { id: gid(), name: "Meal 2 — Main meal", time: "15:30", notes: "Largest meal. Post-workout if training day. Chicken/salmon + sweet potato + greens." },
            { id: gid(), name: "Meal 3 — Final meal", time: "19:30", notes: "Light meal. Protein and fats, low carb. Salmon + avocado + vegetables." },
          ],
          notes: "Begin with 14:10 split for week 1 (fasting end at 10:00) then transition to full 16:8 in week 2. If energy drops significantly, add one small snack at 17:00 during transition.",
        }},
        { id: gid(), pillar: "supplements", name: "Fasting support", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-063", name: "LMNT Electrolytes", supplement_category: "other_supplement", dosage: "1 packet", route: "oral", frequency: "once daily", instructions: "Mix in 16oz water. Consume between 8-10am during fasting window.", cycle: "", duration: "60 days", recurrence_type: "daily", anchor_time: "09:00", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-060", name: "Omega-3 Fish Oil", supplement_category: "other_supplement", dosage: "2000mg", route: "oral", frequency: "twice daily", instructions: "Take with Meal 1 and Meal 3.", cycle: "", duration: "60 days", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "diagnostics", name: "Body composition tracking", items: [
          { id: gid(), type: "service", catalog_id: "ci-031", name: "DEXA Body Composition Scan", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 1", notes: "Baseline body composition", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-031", name: "DEXA Body Composition Scan", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 8", notes: "Follow-up to assess protocol effectiveness", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-009") {
      setSections([
        { id: gid(), pillar: "nutrition", name: "Elimination phase (Weeks 1-4)", items: [], training: null, nutrition: {
          plan_name: "Anti-Inflammatory Elimination", plan_duration: "4 weeks",
          macros: { calories: "2000", protein_g: "150", carbs_g: "180", fat_g: "70", fiber_g: "40", water_oz: "100", notes: "Focus on whole foods. No caloric deficit — this is about food quality, not restriction." },
          foods_include: "Wild-caught fish: salmon, sardines, mackerel (3-4x/week)\nPasture-raised poultry and eggs\nBone broth daily (collagen + glycine)\nLeafy greens: spinach, kale, arugula\nCruciferous: broccoli, cauliflower, brussels sprouts\nBerries: blueberries, strawberries, raspberries\nHealthy fats: avocado, olive oil, coconut oil\nTurmeric, ginger, garlic (anti-inflammatory spices)\nSweet potato, squash, beets (starchy carbs)",
          foods_exclude: "Gluten — all wheat, barley, rye products\nDairy — all forms including whey protein\nSoy — tofu, soy sauce, edamame\nCorn — including corn oil and corn syrup\nProcessed sugar and artificial sweeteners\nSeed oils: canola, soybean, sunflower, safflower\nAlcohol\nCaffeine (limit to 1 cup green tea/day)\nNighshades: tomatoes, peppers, eggplant, potatoes",
          fasting_start: "", fasting_end: "", feeding_window_hours: "",
          fasting_notes: "",
          meals: [
            { id: gid(), name: "Breakfast", time: "07:30", notes: "3 eggs scrambled in coconut oil + sauteed spinach + 1/2 avocado" },
            { id: gid(), name: "Mid-morning snack", time: "10:00", notes: "Bone broth (8oz) + handful of walnuts" },
            { id: gid(), name: "Lunch", time: "12:30", notes: "Wild salmon + sweet potato + large mixed greens salad with olive oil" },
            { id: gid(), name: "Afternoon snack", time: "15:30", notes: "Berries + almond butter (2 tbsp)" },
            { id: gid(), name: "Dinner", time: "18:30", notes: "Chicken thighs + roasted broccoli and cauliflower + rice" },
          ],
          notes: "Track symptoms daily: energy, digestion, joint pain, skin, sleep quality, brain fog. Use 1-10 scale. This data is critical for the reintroduction phase.",
        }},
        { id: gid(), pillar: "nutrition", name: "Reintroduction phase (Weeks 5-8)", items: [], training: null, nutrition: {
          plan_name: "Controlled Reintroduction", plan_duration: "4 weeks",
          macros: { calories: "2000", protein_g: "150", carbs_g: "180", fat_g: "70", fiber_g: "40", water_oz: "100", notes: "Same macros as elimination. Only change is food reintroduction schedule." },
          foods_include: "Continue all foods from elimination phase\nReintroduce ONE food group every 4 days:\nWeek 5: Dairy (start with ghee, then butter, then hard cheese, then milk)\nWeek 6: Gluten (start with sourdough, then pasta, then bread)\nWeek 7: Nightshades (start with cooked tomatoes, then peppers)\nWeek 8: Soy, corn, caffeine",
          foods_exclude: "Continue avoiding processed sugar\nContinue avoiding seed oils\nContinue avoiding alcohol\nRemove any food that triggered symptoms during reintroduction",
          fasting_start: "", fasting_end: "", feeding_window_hours: "",
          fasting_notes: "",
          meals: [],
          notes: "Reintroduction protocol: eat the test food at 2 meals on day 1, then avoid for 3 days and monitor. If symptoms return (energy drop, bloating, joint pain, skin issues, brain fog), that food is flagged and removed for 90 days before retesting.",
        }},
        { id: gid(), pillar: "supplements", name: "Anti-inflammatory support", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-061", name: "Curcumin Complex", supplement_category: "compound", dosage: "1000mg", route: "oral", frequency: "twice daily", instructions: "Take with fat source for absorption. Primary anti-inflammatory.", cycle: "", duration: "8 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-060", name: "Omega-3 Fish Oil", supplement_category: "other_supplement", dosage: "3000mg", route: "oral", frequency: "twice daily", instructions: "Higher dose for inflammation protocol. Take with meals.", cycle: "", duration: "8 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-064", name: "Vitamin C", supplement_category: "other_supplement", dosage: "1000mg", route: "oral", frequency: "twice daily", instructions: "Antioxidant support.", cycle: "", duration: "8 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "diagnostics", name: "Lab work", items: [
          { id: gid(), type: "service", catalog_id: "ci-046", name: "Comprehensive Blood Panel", service_pillar: "diagnostics", duration_minutes: 15, frequency: "one_time", preferred_window: "Week 1", notes: "Baseline — CRP, ESR, homocysteine, fasting insulin, HbA1c", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-046", name: "Comprehensive Blood Panel", service_pillar: "diagnostics", duration_minutes: 15, frequency: "one_time", preferred_window: "Week 8", notes: "Follow-up — compare inflammatory markers", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-010") {
      setSections([
        { id: gid(), pillar: "nutrition", name: "Hypertrophy nutrition plan", items: [], training: null, nutrition: {
          plan_name: "Muscle Gain — Caloric Surplus", plan_duration: "12 weeks",
          macros: { calories: "3200", protein_g: "220", carbs_g: "380", fat_g: "90", fiber_g: "40", water_oz: "120", notes: "Caloric surplus of ~500 cals above TDEE. Protein at 1.2g/lb. Carbs higher on training days. Reduce carbs by 80g on rest days." },
          foods_include: "Lean proteins: chicken breast, 93% ground beef, turkey, eggs, whey protein\nComplex carbs: white rice, jasmine rice, oats, potatoes, sweet potato, cream of rice\nHealthy fats: avocado, peanut butter, whole eggs, olive oil\nFruits: bananas, berries, oranges (pre/post workout)\nVegetables: broccoli, spinach, asparagus, bell peppers",
          foods_exclude: "Excessive alcohol (limits protein synthesis)\nProcessed junk food (empty calories, no micronutrients)\nExcessive fiber pre-workout (GI distress)",
          fasting_start: "", fasting_end: "", feeding_window_hours: "",
          fasting_notes: "",
          meals: [
            { id: gid(), name: "Meal 1 — Breakfast", time: "07:00", notes: "4 whole eggs + 2 whites + oats (80g) + banana. ~650 cal" },
            { id: gid(), name: "Meal 2 — Mid-morning", time: "10:00", notes: "Chicken breast (8oz) + jasmine rice (200g) + broccoli. ~600 cal" },
            { id: gid(), name: "Meal 3 — Pre-workout", time: "13:00", notes: "Whey protein shake + cream of rice (60g) + peanut butter (1 tbsp). ~450 cal" },
            { id: gid(), name: "Meal 4 — Post-workout", time: "16:00", notes: "Lean ground beef (8oz) + white rice (250g) + spinach. ~700 cal" },
            { id: gid(), name: "Meal 5 — Dinner", time: "19:00", notes: "Salmon (6oz) + sweet potato + asparagus + olive oil. ~550 cal" },
            { id: gid(), name: "Meal 6 — Before bed", time: "21:30", notes: "Casein protein or cottage cheese + almond butter. ~250 cal" },
          ],
          notes: "Weigh daily, average weekly. Target 0.5-0.75 lb/week gain. If gaining faster, reduce carbs by 30g. If stalling, add 200 cal from carbs. Reassess macros every 3 weeks.",
        }},
        { id: gid(), pillar: "supplements", name: "Performance stack", items: [
          { id: gid(), type: "supplement", catalog_id: "ci-062", name: "Collagen Peptides", supplement_category: "other_supplement", dosage: "20g", route: "oral", frequency: "once daily", instructions: "Mix in morning coffee. Joint support under heavy training loads.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "07:00", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-064", name: "Magnesium Glycinate", supplement_category: "other_supplement", dosage: "400mg", route: "oral", frequency: "once daily", instructions: "Take before bed. Supports sleep and recovery.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "21:00", start_date: "", end_date: "" },
          { id: gid(), type: "supplement", catalog_id: "ci-060", name: "Omega-3 Fish Oil", supplement_category: "other_supplement", dosage: "2000mg", route: "oral", frequency: "twice daily", instructions: "Take with meals. Anti-inflammatory support for heavy training.", cycle: "", duration: "12 weeks", recurrence_type: "daily", anchor_time: "", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
        { id: gid(), pillar: "diagnostics", name: "Progress tracking", items: [
          { id: gid(), type: "service", catalog_id: "ci-031", name: "DEXA Body Composition Scan", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 1", notes: "Baseline lean mass and body fat", start_date: "", end_date: "" },
          { id: gid(), type: "service", catalog_id: "ci-031", name: "DEXA Body Composition Scan", service_pillar: "diagnostics", duration_minutes: 30, frequency: "one_time", preferred_window: "Week 12", notes: "Final — assess lean mass gained vs fat gained", start_date: "", end_date: "" },
        ], nutrition: null, training: null },
      ]);
    }
    if (t.id === "pt-011") {
      setSections([
        { id: gid(), pillar: "nutrition", name: "Post-surgical recovery nutrition", items: [], training: null, nutrition: {
          plan_name: "Post-Surgical Recovery Nutrition", plan_duration: "16 weeks",
          macros: { calories: "2400", protein_g: "170", carbs_g: "250", fat_g: "80", fiber_g: "30", water_oz: "100", notes: "High protein for tissue repair. Caloric surplus to support healing. Do not restrict calories during recovery." },
          foods_include: "Bone broth daily — collagen and glycine for connective tissue repair\nWild-caught salmon 3x/week — omega-3 for inflammation\nBerries daily — antioxidants for cellular repair\nLeafy greens — vitamin K for bone healing\nEggs — complete amino acid profile\nSweet potatoes — vitamin A for immune function\nCitrus fruits — vitamin C for collagen synthesis\nGarlic and turmeric — natural anti-inflammatory",
          foods_exclude: "Alcohol — impairs healing and interacts with medications\nProcessed sugar — promotes inflammation and slows healing\nExcessive sodium — worsens post-surgical swelling\nFried foods — inflammatory\nExcessive caffeine — can interfere with sleep quality needed for recovery",
          fasting_start: "", fasting_end: "", feeding_window_hours: "",
          fasting_notes: "No fasting during post-surgical recovery. Consistent nutrient delivery is critical for tissue repair.",
          meals: [
            { id: gid(), name: "Breakfast", time: "07:30", notes: "Protein-heavy. 3 eggs + bone broth (8oz) + berries." },
            { id: gid(), name: "Pre-PT snack", time: "09:30", notes: "Light carbs for energy. Banana + almond butter." },
            { id: gid(), name: "Post-PT meal", time: "12:00", notes: "High protein + carb for recovery. Chicken breast + rice + steamed greens." },
            { id: gid(), name: "Afternoon shake", time: "15:30", notes: "Protein shake with collagen peptides + frozen berries + spinach." },
            { id: gid(), name: "Dinner", time: "18:30", notes: "Wild salmon or lean protein + sweet potato + roasted vegetables + olive oil." },
          ],
          notes: "Prioritize protein distribution across all meals (30-40g per meal). Bone broth counts toward daily protein. Hydration is critical — monitor urine color. Adjust calories up if weight drops below pre-surgery baseline.",
        }},
      ]);
    }
    setTemplateModal(false);
  };

  const total = sections.reduce((acc, sec) => {
    if (sec.pillar === "training") return acc + migrateTrainingItems(sec).length;
    if (sec.pillar === "nutrition") return acc + countNutritionItems(sec);
    return acc + (sec.items || []).length + (sec.nutrition ? 1 : 0);
  }, 0);
  const pCounts = {};
  sections.forEach((s) => { pCounts[s.pillar] = (pCounts[s.pillar] || 0) + 1; });
  const filtered = activeTab === "all" ? sections : sections.filter((s) => s.pillar === activeTab);

  return (
    <div style={S.root}>
      <div style={S.topBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/protocols" aria-label="Back to protocols" style={S.backBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </Link>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em" }}>Protocol builder</div>
            <div style={{ fontSize: 12, color: V.txM, marginTop: 2 }}>
              {meta.name || "Untitled protocol"} · <span style={S.badge(V.warn)}>{meta.status}</span> · {total} items · {sections.length} sections
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" style={S.btnS} onClick={() => saveProtocolAndNavigate("Draft")}>
            Save draft
          </button>
          <button
            type="button"
            style={{ ...S.btnS, color: V.warn, borderColor: `${V.warn}40` }}
            onClick={() => saveProtocolAndNavigate("Submitted for review")}
          >
            Submit for review
          </button>
          <button type="button" style={S.btnP} onClick={() => saveProtocolAndNavigate("Active")}>
            Publish
          </button>
        </div>
      </div>

      <div style={S.cnt}>
        {/* Protocol metadata */}
        <div style={S.card}>
          <div style={S.cardH} onClick={() => toggle("meta")}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Protocol details</span>
            <CollapseChevron expanded={!collapsed.meta} />
          </div>
          {!collapsed.meta && (
            <div style={S.cardB}>
              <div style={S.fg}>
                <div style={{ ...S.fld, flex: 2 }}><label style={S.lbl}>Protocol name</label><input style={S.inp} placeholder="e.g. Parasite Cleanse Protocol" value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} /></div>
                <div style={S.fld}><label style={S.lbl}>Duration</label><input style={S.inp} placeholder="e.g. 90 days" value={meta.duration} onChange={(e) => setMeta({ ...meta, duration: e.target.value })} /></div>
              </div>
              <div style={S.fg}><div style={S.fldF}><label style={S.lbl}>Clinical objective</label><textarea style={S.ta} value={meta.clinical_objective} onChange={(e) => setMeta({ ...meta, clinical_objective: e.target.value })} placeholder="What is this protocol trying to achieve?" /></div></div>
              <div style={S.fg}><div style={S.fldF}><label style={S.lbl}>Clinical use case</label><textarea style={S.ta} value={meta.clinical_use_case} onChange={(e) => setMeta({ ...meta, clinical_use_case: e.target.value })} placeholder="When should this protocol be used?" /></div></div>
              <div style={S.fg}>
                <div style={S.fld}><label style={S.lbl}>Eligibility criteria</label><textarea style={S.ta} value={meta.eligibility_criteria} onChange={(e) => setMeta({ ...meta, eligibility_criteria: e.target.value })} placeholder="Who qualifies?" /></div>
                <div style={S.fld}><label style={S.lbl}>Contraindications</label><textarea style={S.ta} value={meta.contraindications} onChange={(e) => setMeta({ ...meta, contraindications: e.target.value })} placeholder="Who should NOT receive this?" /></div>
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {sections.length === 0 && (
          <div style={{ ...S.card, border: `1px dashed ${V.acc}40` }}>
            <div style={{ ...S.empty, padding: "40px 18px" }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: V.tx }}>Start building your protocol</div>
              <div style={{ marginBottom: 18, color: V.txM }}>Load from a template or add sections manually</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button style={S.btnP} onClick={() => setTemplateModal(true)}>Load from template</button>
                <span style={{ color: V.txD, alignSelf: "center", fontSize: 12 }}>or add a section:</span>
                {Object.entries(PILLARS).map(([k, p]) => (
                  <button key={k} type="button" style={{ ...S.btnG, border: `1px solid ${p.color}30`, color: p.color, borderRadius: 8, fontSize: 12 }} onClick={() => addSection(k)}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab bar + add section */}
        {sections.length > 0 && (
          <>
            <div style={S.tabBar}>
              <button style={S.tab(activeTab === "all")} onClick={() => setActiveTab("all")}>All ({sections.length})</button>
              {Object.entries(PILLARS).map(([k, p]) =>
                pCounts[k] ? (
                  <button key={k} type="button" style={S.tab(activeTab === k)} onClick={() => setActiveTab(k)}>
                    {p.label} ({pCounts[k]})
                  </button>
                ) : null,
              )}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: V.txD, marginRight: 4 }}>Add section:</span>
              {Object.entries(PILLARS).map(([k, p]) => (
                <button key={k} type="button" style={{ ...S.btnG, border: `1px solid ${p.color}25`, color: p.color, borderRadius: 6, fontSize: 11, padding: "4px 10px" }} onClick={() => addSection(k)}>
                  {p.label}
                </button>
              ))}
              <div style={{ flex: 1 }} />
              <button style={S.btnS} onClick={() => setTemplateModal(true)}>Load template</button>
            </div>

            {/* Sections */}
            {filtered.map((sec) => {
              const itemCount =
                sec.pillar === "training"
                  ? migrateTrainingItems(sec).length
                  : sec.pillar === "nutrition"
                    ? countNutritionItems(sec)
                    : (sec.items || []).length;
              return (
              <div key={sec.id} style={{ ...S.card, borderLeft: `3px solid ${PILLARS[sec.pillar]?.color || V.bdr}` }}>
                <div style={S.cardH} onClick={() => toggle(sec.id)}>
                  <div style={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1 }} onClick={(e) => e.stopPropagation()}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: V.tx, padding: "0 4px" }}>{sec.name || "Untitled section"}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: V.txD, whiteSpace: "nowrap" }}>
                      {itemCount} item{itemCount !== 1 ? "s" : ""}
                    </span>
                    <button type="button" style={S.btnD} onClick={(e) => { e.stopPropagation(); removeSection(sec.id); }}>Remove</button>
                    <CollapseChevron expanded={!collapsed[sec.id]} />
                  </div>
                </div>
                {!collapsed[sec.id] && (
                  <div style={S.cardB}>
                    {sec.pillar === "supplements" && (
                      <>
                        {sec.items.map((it) => <SupplementItem key={it.id} item={it} onChange={(u) => updateItem(sec.id, it.id, u)} onRemove={() => removeItem(sec.id, it.id)} />)}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button type="button" style={S.btnAddNew} onClick={() => addBlankSupplement(sec.id)}>
                            + Add New
                          </button>
                          <button
                            type="button"
                            style={S.btnAddCatalog}
                            onClick={() => {
                              setActiveSec(sec.id);
                              setCatalogModal("supplements");
                            }}
                          >
                            + Add from catalogue
                          </button>
                        </div>
                      </>
                    )}
                    {sec.pillar === "nutrition" && (
                      <>
                        {(sec.items || [])
                          .filter((it) => it.type === "nutrition")
                          .map((it) => (
                            <NutritionItemCard
                              key={it.id}
                              item={it}
                              onChange={(u) => updateItem(sec.id, it.id, u)}
                              onRemove={() => removeItem(sec.id, it.id)}
                            />
                          ))}
                        {hasLegacyNutritionData(sec) && !sec.items?.some((it) => it.type === "nutrition") && (
                          <NutritionEditor data={sec.nutrition || {}} onChange={(n) => updateSection(sec.id, { nutrition: n })} />
                        )}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button type="button" style={S.btnAddNew} onClick={() => addBlankNutritionItem(sec.id)}>
                            + Add New
                          </button>
                          <button type="button" style={S.btnAddCatalog} onClick={() => addNutritionItemAndOpenCatalog(sec.id)}>
                            + Add from catalogue
                          </button>
                        </div>
                      </>
                    )}
                    {sec.pillar === "training" && (
                      <>
                        {migrateTrainingItems(sec).map((it) => (
                          <TrainingItemCard
                            key={it.id}
                            item={it}
                            onChange={(u) => updateItem(sec.id, it.id, u)}
                            onRemove={() => removeItem(sec.id, it.id)}
                            onAddExercise={() => {
                              setActiveSec(`ti-${sec.id}-${it.id}`);
                              setCatalogModal("training-exercise");
                            }}
                            onAddFromCatalog={() => {
                              setActiveSec(`ti-${sec.id}-${it.id}`);
                              setCatalogModal("training-catalog");
                            }}
                          />
                        ))}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button type="button" style={S.btnAddNew} onClick={() => addBlankTrainingItem(sec.id)}>
                            + Add New
                          </button>
                          <button type="button" style={S.btnAddCatalog} onClick={() => addTrainingItemAndOpenCatalog(sec.id)}>
                            + Add from catalogue
                          </button>
                        </div>
                      </>
                    )}
                    {sec.pillar === "recovery" && (
                      <>
                        {sec.items.map((it) => (
                          <RecoveryServiceItem key={it.id} item={it} accentColor={PILLARS.recovery.color} onChange={(u) => updateItem(sec.id, it.id, u)} onRemove={() => removeItem(sec.id, it.id)} />
                        ))}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button type="button" style={S.btnAddNew} onClick={() => addBlankService(sec.id)}>
                            + Add New
                          </button>
                          <button
                            type="button"
                            style={S.btnAddCatalog}
                            onClick={() => {
                              setActiveSec(sec.id);
                              setCatalogModal("services");
                            }}
                          >
                            + Add from catalogue
                          </button>
                        </div>
                      </>
                    )}
                    {sec.pillar === "diagnostics" && (
                      <>
                        {sec.items.map((it) => (
                          <RecoveryServiceItem
                            key={it.id}
                            item={it}
                            accentColor={PILLARS.diagnostics.color}
                            sessionTypeOptions={DIAGNOSTICS_SESSION_TYPES}
                            onChange={(u) => updateItem(sec.id, it.id, u)}
                            onRemove={() => removeItem(sec.id, it.id)}
                          />
                        ))}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button type="button" style={S.btnAddNew} onClick={() => addBlankService(sec.id)}>
                            + Add New
                          </button>
                          <button
                            type="button"
                            style={S.btnAddCatalog}
                            onClick={() => {
                              setActiveSec(sec.id);
                              setCatalogModal("services");
                            }}
                          >
                            + Add from catalogue
                          </button>
                        </div>
                      </>
                    )}
                    {sec.pillar === "regeneration" && (
                      <>
                        {(sec.items || []).map((it) => (
                          <RecoveryServiceItem
                            key={it.id}
                            item={it}
                            accentColor={PILLARS.regeneration.color}
                            sessionTypeOptions={REGENERATION_SESSION_TYPES}
                            onChange={(u) => updateItem(sec.id, it.id, u)}
                            onRemove={() => removeItem(sec.id, it.id)}
                          />
                        ))}
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                          <button type="button" style={S.btnAddNew} onClick={() => addBlankService(sec.id)}>
                            + Add New
                          </button>
                          <button
                            type="button"
                            style={S.btnAddCatalog}
                            onClick={() => {
                              setActiveSec(sec.id);
                              setCatalogModal("services");
                            }}
                          >
                            + Add from catalogue
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
            })}
          </>
        )}
      </div>

      {/* Modals */}
      {catalogModal === "supplements" && (
        <CatalogModal
          type="supplements"
          onClose={() => setCatalogModal(null)}
          onSelect={(ci) => addItem(activeSec, ci, "supplement")}
          onSelectProgram={(prog) => addProgramFromCatalog(activeSec, prog, "supplements")}
        />
      )}
      {catalogModal === "services" && (
        <CatalogModal
          type="services"
          onClose={() => setCatalogModal(null)}
          onSelect={(ci) => addItem(activeSec, ci, "service")}
          onSelectProgram={(prog) => addProgramFromCatalog(activeSec, prog, "services")}
          pillarFilter={sections.find((s) => s.id === activeSec)?.pillar}
        />
      )}
      {catalogModal === "training-exercise" && (
        <TrainingExerciseModal
          onClose={() => setCatalogModal(null)}
          onSelectExercise={(ex) => appendExerciseRowsToActiveTrainingItem([exerciseCatalogRow(ex)])}
        />
      )}
      {catalogModal === "training-catalog" && (
        <TrainingCatalogModal
          onClose={() => setCatalogModal(null)}
          onSelectItem={(item) => appendExerciseRowsToActiveTrainingItem(resolveTrainingCatalogItem(item))}
          onSelectProgram={(prog) => {
            const additions = [];
            for (const tid of prog.item_ids || []) {
              const tItem = MOCK_TRAINING_ITEMS.find((x) => x.id === tid);
              if (tItem) additions.push(...resolveTrainingCatalogItem(tItem));
            }
            appendExerciseRowsToActiveTrainingItem(additions);
          }}
        />
      )}
      {catalogModal === "nutrition-catalog" && (
        <NutritionCatalogModal
          onClose={() => {
            setNutritionCatalogTargetItemId(null);
            setCatalogModal(null);
          }}
          onSelectItem={(row) => {
            const filled = nutritionItemFromCatalogRow(row);
            setSections((prev) =>
              prev.map((s) => {
                if (s.id !== activeSec || s.pillar !== "nutrition" || !nutritionCatalogTargetItemId) return s;
                return {
                  ...s,
                  items: (s.items || []).map((it) => (it.id === nutritionCatalogTargetItemId ? { ...it, ...filled, id: it.id } : it)),
                };
              }),
            );
            setNutritionCatalogTargetItemId(null);
            setCatalogModal(null);
          }}
          onSelectProgram={(prog) => {
            const resolved = (prog.item_ids || []).map((id) => MOCK_NUTRITION_CATALOG_ITEMS.find((x) => x.id === id)).filter(Boolean);
            const additions = resolved.map((r) => nutritionItemFromCatalogRow(r));
            if (additions.length === 0) {
              setNutritionCatalogTargetItemId(null);
              setCatalogModal(null);
              return;
            }
            setSections((prev) =>
              prev.map((s) => {
                if (s.id !== activeSec || s.pillar !== "nutrition") return s;
                let items = [...(s.items || [])];
                if (nutritionCatalogTargetItemId) {
                  items = items.filter((it) => it.id !== nutritionCatalogTargetItemId);
                }
                return { ...s, items: [...items, ...additions] };
              }),
            );
            setNutritionCatalogTargetItemId(null);
            setCatalogModal(null);
          }}
        />
      )}
      {templateModal && (
        <div style={S.modal} onClick={() => setTemplateModal(false)}>
          <div style={S.modalC} onClick={(e) => e.stopPropagation()}>
            <div style={S.modalH}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Load from protocol template</span>
              <ModalCloseButton onClose={() => setTemplateModal(false)} />
            </div>
            <div style={S.modalB}>
              <input style={S.srch} placeholder="Search templates..." autoFocus />
              {MOCK_TEMPLATES.map((t) => (
                <div key={t.id} style={S.catR} onMouseEnter={(e) => (e.currentTarget.style.background = V.bgHover)} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")} onClick={() => loadTemplate(t)}>
                  <div><div style={{ fontSize: 14, fontWeight: 600 }}>{t.name}</div><div style={{ fontSize: 12, color: V.txM, marginTop: 3 }}>{t.description}</div><div style={{ marginTop: 4 }}><PillarTag pillar={t.pillar} /></div></div>
                  <button style={S.btnSm}>Use</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
