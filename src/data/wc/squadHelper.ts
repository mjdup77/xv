import type { Attr, Role, Squad } from "../../types";

// Shared authoring helper for World Cup squad data files.
export type Ov = Partial<Record<Attr, number>>;
export interface PDef {
  n: string;
  r: Role;
  o: number;
  alt?: Role[];
  s?: Ov;
}

export function squad(
  id: string,
  nation: string,
  year: number,
  flag: string,
  defs: PDef[],
): Squad {
  return {
    id,
    nation,
    year,
    flag,
    players: defs.map((d, i) => ({
      id: `${id}-${i}`,
      name: d.n,
      nation,
      year,
      role: d.r,
      alt: d.alt,
      ovr: d.o,
      overrides: d.s,
    })),
  };
}
