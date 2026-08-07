import { lucideIconNames } from "./lucide-icon-names";

export type CanonicalLucideIconName = (typeof lucideIconNames)[number];

export const canonicalLucideIconNames = lucideIconNames;

const canonicalLucideIconNameSet = new Set<string>(canonicalLucideIconNames);

export function isCanonicalLucideIconName(
  value: unknown,
): value is CanonicalLucideIconName {
  return typeof value === "string" && canonicalLucideIconNameSet.has(value);
}
