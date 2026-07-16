// Non-component helpers shared by the manager UI.

export function nav(route: string): void {
  location.hash = route ? `#/manager/${route}` : "#/manager";
}

export const ordinal = (n: number): string =>
  `${n}${n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th"}`;
