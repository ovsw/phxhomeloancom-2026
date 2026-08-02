import type { PortableTextProps } from "@portabletext/react";
import { stegaClean } from "next-sanity";

export type PostHeading = {
  children: PostHeading[];
  id: string;
  level: number;
  text: string;
};

export type PostBodyModel = {
  getHeadingId: (block: { _key?: string }) => string | undefined;
  headings: PostHeading[];
  showTableOfContents: boolean;
};

export type ContactAction = {
  buttonLabel: string;
  description: string;
  href: string;
  kind: "external" | "internal" | "phone";
  title: string;
  variant: "default" | "outline" | "secondary";
};

export type PostContactSidebarModel = {
  actions: readonly ContactAction[];
  description: string;
  title: string;
};

export const POST_CONTACT_SIDEBAR = {
  title: "Contact Jimmy",
  description: "Choose the next step that fits where you are in the mortgage process.",
  actions: [
    {
      title: "Call Jimmy",
      description: "Speak with Jimmy's team about your home loan options.",
      buttonLabel: "Call 480-800-8387",
      href: "tel:+14808008387",
      kind: "phone",
      variant: "outline",
    },
    {
      title: "Apply online for a loan today!",
      description: "Fast and easy online application.",
      buttonLabel: "Apply Online",
      href: "https://applynow.goluminate.com/homehub/signup/jimmy.vercellino@goluminate.com",
      kind: "external",
      variant: "default",
    },
    {
      title: "Mortgage Calculator",
      description: "Find out what you can expect to pay for your home loan.",
      buttonLabel: "Calculate Now",
      href: "/mortgage-calculator/",
      kind: "internal",
      variant: "secondary",
    },
    {
      title: "What's My Home Worth?",
      description: "Get a ballpark estimate for your home with our online calculator.",
      buttonLabel: "Calculate Now",
      href: "/home-value-estimator/",
      kind: "internal",
      variant: "secondary",
    },
  ],
} as const satisfies PostContactSidebarModel;

const HEADING_STYLES = new Set(["h2", "h3", "h4", "h5", "h6"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getHeadingText(block: Record<string, unknown>) {
  if (!Array.isArray(block.children)) return "";

  return block.children
    .flatMap((child) => {
      if (!isRecord(child) || child._type !== "span" || typeof child.text !== "string") {
        return [];
      }
      const cleaned = stegaClean(child.text);
      return typeof cleaned === "string" ? [cleaned] : [];
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nestHeadings(flatHeadings: PostHeading[]) {
  const roots: PostHeading[] = [];
  const stack: PostHeading[] = [];

  for (const heading of flatHeadings) {
    while (stack.length && stack.at(-1)!.level >= heading.level) {
      stack.pop();
    }

    const parent = stack.at(-1);
    if (parent) parent.children.push(heading);
    else roots.push(heading);
    stack.push(heading);
  }

  return roots;
}

export function createPostBodyModel(value: PortableTextProps["value"]): PostBodyModel {
  const blocks = Array.isArray(value) ? value : [];
  const headingIdsByBlock = new WeakMap<object, string>();
  const headingIdsByKey: Record<string, string> = {};
  const usedIds = new Set<string>();
  const flatHeadings: PostHeading[] = [];

  for (const block of blocks) {
    if (!isRecord(block) || block._type !== "block" || !HEADING_STYLES.has(String(block.style))) {
      continue;
    }

    const text = getHeadingText(block);
    if (!text) continue;

    const headingNumber = flatHeadings.length + 1;
    const baseSlug = slugifyHeading(text) || `heading-${headingNumber}`;
    let id = baseSlug;
    let suffix = 2;
    while (usedIds.has(id)) {
      id = `${baseSlug}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);
    headingIdsByBlock.set(block, id);

    if (typeof block._key === "string" && block._key) {
      headingIdsByKey[block._key] = id;
    }
    flatHeadings.push({ children: [], id, level: Number(String(block.style).slice(1)), text });
  }

  return {
    getHeadingId: (block) =>
      (block._key ? headingIdsByKey[block._key] : undefined) ?? headingIdsByBlock.get(block),
    headings: nestHeadings(flatHeadings),
    showTableOfContents: flatHeadings.length >= 2,
  };
}
