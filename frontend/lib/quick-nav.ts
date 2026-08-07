import { stegaClean } from "next-sanity";

/* Must stay in sync with the hero group in studio/schemas/blocks/page-builder.ts. */
const HERO_BLOCK_TYPES = new Set(["homeHero", "pageHeader"]);

type QuickNavSourceBlock = {
  _key: string;
  _type: string;
  sectionNav?: {
    showInQuickNav?: boolean | null;
    navLabel?: string | null;
  } | null;
};

export type QuickNavItem = {
  id: string;
  key: string;
  label: string;
};

export type QuickNavModel = {
  anchorIdByKey: Record<string, string>;
  heroCount: number;
  items: QuickNavItem[];
  showQuickNav: boolean;
};

function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A section appears in the quick nav when it has a nav label and its toggle
 * is not explicitly off. The nav itself only shows for two or more items —
 * a single-item jump nav is noise.
 */
export function createQuickNavModel(
  blocks: QuickNavSourceBlock[],
  enabled: boolean,
): QuickNavModel {
  let heroCount = 0;
  while (
    heroCount < blocks.length &&
    HERO_BLOCK_TYPES.has(blocks[heroCount]._type)
  ) {
    heroCount += 1;
  }

  const anchorIdByKey: Record<string, string> = {};
  const items: QuickNavItem[] = [];
  const usedIds = new Set<string>();

  for (const block of blocks) {
    const nav = block.sectionNav;
    if (!nav || nav.showInQuickNav === false) continue;

    const rawLabel = typeof nav.navLabel === "string" ? nav.navLabel : "";
    const cleanLabel = stegaClean(rawLabel)?.trim();
    if (!cleanLabel) continue;

    const baseId = slugify(cleanLabel) || `section-${items.length + 1}`;
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    anchorIdByKey[block._key] = id;
    /* Keep the raw (stega-encoded) label so Presentation maps the nav text
       back to the section's navLabel field. */
    items.push({ id, key: block._key, label: rawLabel });
  }

  return {
    anchorIdByKey,
    heroCount,
    items,
    showQuickNav: enabled && items.length >= 2,
  };
}
