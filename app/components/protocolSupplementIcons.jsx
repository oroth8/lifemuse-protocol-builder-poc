"use client";

import { useMemo, useState } from "react";

const V = { bdr: "#D8DDEA", tx: "#1B2230", txM: "#5E6980", acc: "#5B5FED", bgCard: "#FFFFFF" };

const ICON_BASE = "/supplement-icons";

/** @typedef {{ id: string, label: string, file: string, keywords: string }} SupplementIconDef */

/** All selectable icons (PNG assets in /public/supplement-icons/). */
export const SUPPLEMENT_ICONS = /** @type {const} */ ([
  { id: "directions_run", label: "Running", file: "directions_run.png", keywords: "run running cardio exercise fitness movement directions" },
  { id: "massage", label: "Massage", file: "massage.png", keywords: "massage therapy spa relaxation recovery soft tissue" },
  { id: "labs", label: "Labs", file: "labs.png", keywords: "labs laboratory testing blood test diagnostics science beaker" },
  { id: "monitor_weight", label: "Weight", file: "monitor_weight.png", keywords: "weight scale monitor body composition bmi" },
  { id: "sports_gymnastics", label: "Gymnastics", file: "sports_gymnastics.png", keywords: "gymnastics flexibility sport movement training" },
  { id: "vector_dumbbell", label: "Dumbbell", file: "vector_dumbbell.png", keywords: "dumbbell weights strength gym fitness exercise iron" },
  { id: "physical_therapy", label: "Physical therapy", file: "physical_therapy.png", keywords: "physical therapy pt rehab rehabilitation recovery mobility" },
  { id: "vector_kick", label: "Martial arts kick", file: "vector_kick.png", keywords: "kick martial arts combat sport stretch legs tae kwon" },
  { id: "vector_cloche", label: "Meal / food", file: "vector_cloche.png", keywords: "meal food dining cloche plate eat nutrition take with food" },
  { id: "rowing", label: "Rowing", file: "rowing.png", keywords: "rowing cardio erg machine fitness sport water" },
  { id: "sports_kabaddi", label: "Team sport", file: "sports_kabaddi.png", keywords: "kabaddi sport team wrestling grappling conditioning" },
  { id: "conditions", label: "Conditions", file: "conditions.png", keywords: "conditions symptoms diagnosis medical checklist eye vision" },
  { id: "heart_smile", label: "Heart wellness", file: "heart_smile.png", keywords: "heart smile wellness mood happiness cardiovascular love health" },
  { id: "genetics", label: "Genetics", file: "genetics.png", keywords: "genetics dna hereditary genes testing ancestry" },
  { id: "healing", label: "Healing", file: "healing.png", keywords: "healing recovery wellness leaf nature herb immune repair" },
  { id: "mindfulness", label: "Mindfulness", file: "mindfulness.png", keywords: "mindfulness meditation calm mental breath stress zen sparkles" },
  { id: "self_improvement", label: "Self improvement", file: "self_improvement.png", keywords: "self improvement growth goals habit coaching users person" },
  { id: "local_dining", label: "Dining", file: "local_dining.png", keywords: "dining restaurant meal fork spoon nutrition eating local" },
  { id: "yoshoku", label: "Western-style meal", file: "yoshoku.png", keywords: "meal western plate food dining calories nutrition" },
  { id: "breastfeeding", label: "Breastfeeding", file: "breastfeeding.png", keywords: "breastfeeding nursing infant baby lactation maternity prenatal mother" },
  { id: "directions_walk", label: "Walking", file: "directions_walk.png", keywords: "walk walking steps movement daily activity gentle cardio" },
  { id: "pool", label: "Pool / swim", file: "pool.png", keywords: "pool swimming swim water aquatic laps hydration sport" },
  { id: "local_drink", label: "Drink / hydration", file: "local_drink.png", keywords: "drink water hydration beverage bottle liquid drops mineral" },
  { id: "clear_day", label: "Sun / daytime", file: "clear_day.png", keywords: "sun daytime vitamin d morning outdoor clear sky bright light" },
  { id: "vector_group", label: "Community", file: "vector_group.png", keywords: "community group family social team users people together support" },
  { id: "sports_martial_arts", label: "Martial arts", file: "sports_martial_arts.png", keywords: "martial arts karate taekwondo combat stance discipline kick punch" },
  { id: "shower", label: "Shower", file: "shower.png", keywords: "shower hygiene rinse skincare topical wash bathroom water" },
  { id: "barefoot", label: "Barefoot / footprint", file: "barefoot.png", keywords: "barefoot footprint steps grounding walking feet movement trail" },
  { id: "breastfeeding_alt", label: "Nursing (alt)", file: "breastfeeding_alt.png", keywords: "breastfeeding nursing baby infant lactation alt duplicate" },
  { id: "ac_unit", label: "Cold / AC", file: "ac_unit.png", keywords: "cold cooling ac snowflake frozen chilled fridge winter anti inflammatory cool storage" },
  { id: "acupuncture", label: "Acupuncture", file: "acupuncture.png", keywords: "acupuncture needles traditional chinese medicine tcm meridian points holistic" },
  { id: "gradient", label: "Gradient / blend", file: "gradient.png", keywords: "gradient blend transition split oil liquid capsule supplement layers" },
  { id: "invert_colors", label: "Invert / contrast", file: "invert_colors.png", keywords: "invert contrast pill blister pack tablets capsules medication pharmacy packaging" },
  { id: "deblur", label: "Clarity / focus", file: "deblur.png", keywords: "clarity focus sharp vision supplement cognitive mental lens eye" },
  { id: "stress_management", label: "Stress", file: "stress_management.png", keywords: "stress management calm cortisol adaptogen anxiety relaxation nervous system" },
  { id: "hot_tub", label: "Hot tub / spa", file: "hot_tub.png", keywords: "hot tub spa hydrotherapy soak jets recovery relaxation heat therapy warm water" },
  { id: "add_alert", label: "Reminder / alert", file: "add_alert.png", keywords: "alert reminder bell notification medication schedule supplement alarm dose timing cross medical" },
  { id: "sauna", label: "Sauna / steam", file: "sauna.png", keywords: "sauna steam heat steam room sweat detox recovery wellness spa vapor therapy" },
  { id: "vector_bed", label: "Sleep / bed", file: "vector_bed.png", keywords: "sleep bed rest nighttime insomnia recovery melatonin circadian pillow dream" },
  { id: "snooze", label: "Sleep / snooze", file: "snooze.png", keywords: "snooze sleep alarm clock late night rest supplement timed medication zzz evening" },
]);

const ICON_BY_ID = Object.fromEntries(SUPPLEMENT_ICONS.map((i) => [i.id, i]));

/** Maps removed SVG icon ids to the nearest PNG asset so saved protocols keep a sensible icon. */
const LEGACY_ICON_ID_MAP = {
  stethoscope: "labs",
  eye: "conditions",
  leaf: "healing",
  user: "vector_group",
  beaker: "labs",
  sun: "clear_day",
  magnifying: "labs",
  bolt: "stress_management",
  heart: "heart_smile",
  sparkles: "mindfulness",
  fire: "healing",
  cube: "invert_colors",
  scale: "monitor_weight",
  cpu: "genetics",
  circle_stack: "conditions",
  musical: "mindfulness",
  gift: "heart_smile",
  shield: "healing",
  wrench: "physical_therapy",
  pill: "invert_colors",
  chart: "labs",
};

export const DEFAULT_SUPPLEMENT_ICON_ID = "labs";

function resolveIconId(id) {
  if (id && ICON_BY_ID[id]) return id;
  if (id && LEGACY_ICON_ID_MAP[id]) return LEGACY_ICON_ID_MAP[id];
  return DEFAULT_SUPPLEMENT_ICON_ID;
}

function iconSrcForId(id) {
  const resolved = resolveIconId(id);
  const def = ICON_BY_ID[resolved];
  return def ? `${ICON_BASE}/${def.file}` : `${ICON_BASE}/${ICON_BY_ID[DEFAULT_SUPPLEMENT_ICON_ID].file}`;
}

export function SupplementIconGlyph({ id, size = 22 }) {
  const resolved = resolveIconId(id);
  const def = ICON_BY_ID[resolved];
  const src = def ? `${ICON_BASE}/${def.file}` : iconSrcForId(DEFAULT_SUPPLEMENT_ICON_ID);
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      draggable={false}
      style={{ display: "block", flexShrink: 0, objectFit: "contain", pointerEvents: "none" }}
    />
  );
}

const pickerStyles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(15, 23, 42, .2)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 16 },
  panel: { background: V.bgCard, border: `1px solid ${V.bdr}`, borderRadius: 12, width: "100%", maxWidth: 400, boxShadow: "0 12px 40px rgba(15,23,42,.12)" },
  head: { padding: "12px 16px", borderBottom: `1px solid ${V.bdr}` },
  headTitle: { fontSize: 11, fontWeight: 700, color: V.txM, letterSpacing: "0.08em" },
  body: { padding: 16 },
  search: { width: "100%", boxSizing: "border-box", border: `1px solid ${V.bdr}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, marginBottom: 12, outline: "none" },
  grid: { display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, maxHeight: 280, overflowY: "auto" },
  cell: (sel) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    aspectRatio: "1",
    borderRadius: 8,
    border: sel ? `2px solid ${V.acc}` : `1px solid ${V.bdr}`,
    background: sel ? `${V.acc}08` : "transparent",
    cursor: "pointer",
    padding: 6,
  }),
  cellImg: { width: "100%", height: "100%", maxWidth: 26, maxHeight: 26, objectFit: "contain" },
};

export function SupplementIconPickerModal({ value, onChange, onClose }) {
  const [q, setQ] = useState("");
  const resolvedValue = resolveIconId(value);
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return SUPPLEMENT_ICONS;
    return SUPPLEMENT_ICONS.filter((i) => {
      const blob = `${i.keywords} ${i.label} ${i.id}`.toLowerCase();
      return blob.includes(s);
    });
  }, [q]);

  return (
    <div style={pickerStyles.overlay} onClick={onClose} role="presentation">
      <div style={pickerStyles.panel} onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="icon-picker-title">
        <div style={pickerStyles.head}>
          <div id="icon-picker-title" style={pickerStyles.headTitle}>
            CHOOSE AN ICON
          </div>
        </div>
        <div style={pickerStyles.body}>
          <input style={pickerStyles.search} placeholder="e.g. Pill" value={q} onChange={(e) => setQ(e.target.value)} autoFocus aria-label="Search icons" />
          <div style={pickerStyles.grid}>
            {filtered.map((icon) => (
              <button
                key={icon.id}
                type="button"
                style={pickerStyles.cell(resolvedValue === icon.id)}
                onClick={() => {
                  onChange(icon.id);
                  onClose();
                }}
                title={icon.label}
                aria-label={icon.label}
              >
                <img src={`${ICON_BASE}/${icon.file}`} alt="" style={pickerStyles.cellImg} draggable={false} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
