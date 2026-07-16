// Tiny shared helpers for the manager engine (React-free).

export const clamp = (lo: number, hi: number, v: number): number =>
  Math.max(lo, Math.min(hi, v));

export const ordinalWord = (n: number): string =>
  `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;
