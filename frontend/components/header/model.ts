export type HeaderLinkModel = {
  href: string;
  label: string;
  openInNewTab: boolean;
};

export type HeaderChildLinkModel = {
  key: string;
  label: string;
  description: string;
  icon: string;
  link: HeaderLinkModel;
};

export type HeaderNavigationItem =
  | {
      key: string;
      kind: "link";
      label: string;
      link: HeaderLinkModel;
    }
  | {
      key: string;
      kind: "group";
      label: string;
      links: HeaderChildLinkModel[];
    };

export type HeaderNavigationModel = {
  items: HeaderNavigationItem[];
  actions: Array<{ key: string; link: HeaderLinkModel }>;
};

export type HeaderModel = {
  brand: HeaderBrandModel;
  navigation: HeaderNavigationModel;
};

type RawDestination = { href?: string | null; openInNewTab?: boolean | null };
type RawChildLink = {
  _key?: string | null;
  label?: string | null;
  description?: string | null;
  icon?: string | null;
  destination?: RawDestination | null;
};
type RawItem = {
  _key?: string | null;
  kind?: string | null;
  label?: string | null;
  destination?: RawDestination | null;
  links?: RawChildLink[] | null;
};
type RawAction = {
  _key?: string | null;
  label?: string | null;
  destination?: RawDestination | null;
};

export type RawHeaderNavigation = {
  _id?: string | null;
  items?: RawItem[] | null;
  actions?: RawAction[] | null;
} | null;

export function createHeaderBrandModel(
  settings: SETTINGS_QUERY_RESULT,
): HeaderBrandModel {
  const light = settings?.logo?.light;
  const dark = settings?.logo?.dark;
  const width = (settings?.logo?.width as number | undefined) ?? 160;
  const height = (settings?.logo?.height as number | undefined) ?? 56;
  const image = (source: NonNullable<typeof light> | null | undefined) =>
    source ? { src: urlFor(source).url(), width, height } : null;

  return {
    label: settings?.siteName?.trim() || "PHX Home Loan",
    light: image(light),
    dark: image(dark),
  };
}

function normalizeHref(value: string | null | undefined): string | null {
  const href = value?.trim();
  if (!href || href === "#") return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href;
  if (/^[a-z][a-z\d+.-]*:/i.test(href)) return null;
  const rooted = `/${href.replace(/^\/+/, "")}`;
  return rooted === "/" || rooted.length > 1 ? rooted : null;
}

function normalizeLink(
  label: string | null | undefined,
  destination: RawDestination | null | undefined,
): HeaderLinkModel | null {
  const cleanLabel = label?.trim();
  const href = normalizeHref(destination?.href);
  if (!cleanLabel || !href) return null;
  return {
    href,
    label: cleanLabel,
    openInNewTab: Boolean(destination?.openInNewTab),
  };
}

export function createHeaderNavigationModel(
  raw: RawHeaderNavigation,
): HeaderNavigationModel {
  const items: HeaderNavigationItem[] = [];

  for (const item of raw?.items ?? []) {
    const key = item._key?.trim();
    const label = item.label?.trim();
    if (!key || !label) continue;

    if (item.kind === "link") {
      const link = normalizeLink(label, item.destination);
      if (link) items.push({ key, kind: "link", label, link });
      continue;
    }

    if (item.kind === "group") {
      const links: HeaderChildLinkModel[] = [];
      for (const child of item.links ?? []) {
        const childKey = child._key?.trim();
        const childLabel = child.label?.trim();
        const description = child.description?.trim();
        // stegaClean, not just trim: in draft mode Sanity injects invisible
        // stega characters into every string, and this value is a lookup key
        // into the icon map — the encoded form matches nothing. Visible text
        // (label, description) deliberately keeps its encoding so it stays
        // click-to-edit in Presentation.
        const icon = stegaClean(child.icon)?.trim();
        const link = normalizeLink(childLabel, child.destination);
        if (childKey && childLabel && description && icon && link) {
          links.push({ key: childKey, label: childLabel, description, icon, link });
        }
      }
      if (links.length > 0) items.push({ key, kind: "group", label, links });
    }
  }

  const actions = (raw?.actions ?? []).flatMap((action) => {
    const key = action._key?.trim();
    const link = normalizeLink(action.label, action.destination);
    return key && link ? [{ key, link }] : [];
  });

  return { items, actions };
}
import { stegaClean } from "next-sanity";
import { urlFor } from "@/sanity/lib/image";
import type { SETTINGS_QUERY_RESULT } from "@/sanity.types";

export type HeaderBrandModel = {
  label: string;
  light: { src: string; width: number; height: number } | null;
  dark: { src: string; width: number; height: number } | null;
};
