import type { Player, Role, Slot, SlotId } from "../types";

export const ROLE_LABEL: Record<Role, string> = {
  prop: "Prop",
  hooker: "Hooker",
  lock: "Lock",
  flanker: "Flanker",
  number8: "No. 8",
  scrumhalf: "Scrum-half",
  flyhalf: "Fly-half",
  centre: "Centre",
  wing: "Wing",
  fullback: "Fullback",
};

export function positionLabel(p: Player): string {
  const base = ROLE_LABEL[p.role];
  if (p.alt?.length) return `${base} / ${ROLE_LABEL[p.alt[0]]}`;
  return base;
}

export const ROLE_ABBR: Record<Role, string> = {
  prop: "PR",
  hooker: "HK",
  lock: "LK",
  flanker: "FL",
  number8: "N8",
  scrumhalf: "SH",
  flyhalf: "FH",
  centre: "CE",
  wing: "WG",
  fullback: "FB",
};

// Short tag for versatile players, e.g. "FH/CE". Empty if single-position.
export function versatilityTag(p: Player): string {
  if (!p.alt?.length) return "";
  return [p.role, ...p.alt].map((r) => ROLE_ABBR[r]).join("/");
}

// The fixed XV. `accepts` controls which roles can fill each slot.
// x/y are percentages for the pitch layout (attacking upward).
export const SLOTS: Slot[] = [
  { id: "LH", number: 1, label: "Loosehead Prop", accepts: ["prop"], x: 30, y: 11 },
  { id: "HK", number: 2, label: "Hooker", accepts: ["hooker"], x: 50, y: 9 },
  { id: "TH", number: 3, label: "Tighthead Prop", accepts: ["prop"], x: 70, y: 11 },
  { id: "L4", number: 4, label: "Lock", accepts: ["lock"], x: 40, y: 23 },
  { id: "L5", number: 5, label: "Lock", accepts: ["lock"], x: 60, y: 23 },
  { id: "F6", number: 6, label: "Blindside Flanker", accepts: ["flanker", "number8"], x: 22, y: 33 },
  { id: "F7", number: 7, label: "Openside Flanker", accepts: ["flanker", "number8"], x: 78, y: 33 },
  { id: "N8", number: 8, label: "Number 8", accepts: ["number8", "flanker"], x: 50, y: 35 },
  { id: "SH", number: 9, label: "Scrum-half", accepts: ["scrumhalf"], x: 50, y: 46 },
  { id: "FH", number: 10, label: "Fly-half", accepts: ["flyhalf"], x: 35, y: 55 },
  { id: "IC", number: 12, label: "Inside Centre", accepts: ["centre", "flyhalf"], x: 40, y: 65 },
  { id: "OC", number: 13, label: "Outside Centre", accepts: ["centre"], x: 60, y: 66 },
  { id: "LW", number: 11, label: "Left Wing", accepts: ["wing", "fullback"], x: 15, y: 73 },
  { id: "RW", number: 14, label: "Right Wing", accepts: ["wing", "fullback"], x: 85, y: 73 },
  { id: "FB", number: 15, label: "Fullback", accepts: ["fullback", "wing"], x: 50, y: 87 },
];

export const SLOT_BY_ID: Record<SlotId, Slot> = Object.fromEntries(
  SLOTS.map((s) => [s.id, s]),
) as Record<SlotId, Slot>;

export function eligibleSlots(roles: string[], slotIds: SlotId[] = SLOTS.map((s) => s.id)): SlotId[] {
  return slotIds.filter((id) =>
    SLOT_BY_ID[id].accepts.some((r) => roles.includes(r)),
  );
}
