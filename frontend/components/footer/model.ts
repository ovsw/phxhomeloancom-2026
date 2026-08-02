import type { SanityImageSource } from "@sanity/image-url";
import { urlFor } from "@/sanity/lib/image";

export type FooterLinkModel = {
  key: string;
  label: string;
  href: string;
  openInNewTab: boolean;
};

export type FooterModel = {
  brand: {
    label: string;
    image: { src: string; width: number; height: number } | null;
    phone: FooterLinkModel;
    addressLines: string[];
    mapLink: FooterLinkModel;
    organizationNmlsId: string;
  };
  resources: { heading: string; links: FooterLinkModel[] };
  contact: {
    heading: string;
    fullName: string;
    nmlsId: string;
    phone: FooterLinkModel;
    email: FooterLinkModel;
    website: FooterLinkModel;
  };
  social: { heading: string; links: FooterLinkModel[] };
  compliance: {
    headline: string;
    disclaimer: string;
    nmlsConsumerAccess: FooterLinkModel;
    equalHousingLabel: string;
    copyrightYears: string;
    copyrightOwner: string;
    organizationNmlsId: string;
    organizationPhone: FooterLinkModel;
    credit: string | null;
    legalLinks: FooterLinkModel[];
  };
};

type RawDestination = { href?: string | null; openInNewTab?: boolean | null };
type RawLink = {
  _key?: string | null;
  label?: string | null;
  destination?: RawDestination | null;
};

export type RawFooter = {
  _id?: string | null;
  brand?: {
    phone?: RawLink | null;
    addressLines?: Array<string | null> | null;
    mapLink?: RawLink | null;
  } | null;
  resources?: { heading?: string | null; links?: RawLink[] | null } | null;
  contact?: {
    heading?: string | null;
    fullName?: string | null;
    nmlsId?: string | null;
    phone?: RawLink | null;
    email?: RawLink | null;
    website?: RawLink | null;
  } | null;
  social?: { heading?: string | null; links?: RawLink[] | null } | null;
  compliance?: {
    headline?: string | null;
    disclaimer?: string | null;
    nmlsConsumerAccess?: RawLink | null;
    equalHousingLabel?: string | null;
    copyrightStartYear?: number | null;
    copyrightOwner?: string | null;
    organizationNmlsId?: string | null;
    organizationPhone?: RawLink | null;
    credit?: string | null;
    legalLinks?: RawLink[] | null;
  } | null;
} | null;

export type RawFooterSettings = {
  siteName?: string | null;
  logo?: {
    light?: SanityImageSource | null;
    dark?: SanityImageSource | null;
    width?: number | null;
    height?: number | null;
  } | null;
} | null;

function text(value: string | null | undefined): string | null {
  const clean = value?.trim();
  return clean || null;
}

function normalizeHref(value: string | null | undefined): string | null {
  const href = text(value);
  if (!href || href === "#") return null;
  if (/^(https?:\/\/|mailto:|tel:)/i.test(href)) return href;
  if (/^[a-z][a-z\d+.-]*:/i.test(href)) return null;
  return `/${href.replace(/^\/+/, "")}`;
}

function link(raw: RawLink | null | undefined, fallbackKey?: string): FooterLinkModel | null {
  const key = text(raw?._key) ?? fallbackKey ?? null;
  const label = text(raw?.label);
  const href = normalizeHref(raw?.destination?.href);
  if (!key || !label || !href) return null;
  return { key, label, href, openInNewTab: Boolean(raw?.destination?.openInNewTab) };
}

function links(raw: RawLink[] | null | undefined): FooterLinkModel[] {
  return (raw ?? []).flatMap((item) => {
    const normalized = link(item);
    return normalized ? [normalized] : [];
  });
}

function image(settings: RawFooterSettings): FooterModel["brand"]["image"] {
  const source = settings?.logo?.light ?? settings?.logo?.dark;
  if (!source) return null;
  try {
    return {
      src: urlFor(source).url(),
      width: settings?.logo?.width ?? 300,
      height: settings?.logo?.height ?? 125,
    };
  } catch {
    return null;
  }
}

export function createFooterModel(
  raw: RawFooter,
  settings: RawFooterSettings,
  currentYear: number,
): FooterModel | null {
  if (raw?._id !== "footer") return null;

  const label = text(settings?.siteName);
  const brandPhone = link(raw.brand?.phone, "brand-phone");
  const mapLink = link(raw.brand?.mapLink, "map");
  const addressLines = (raw.brand?.addressLines ?? []).flatMap((line) => {
    const value = text(line);
    return value ? [value] : [];
  });
  const resourcesHeading = text(raw.resources?.heading);
  const resourceLinks = links(raw.resources?.links);
  const contactHeading = text(raw.contact?.heading);
  const contactName = text(raw.contact?.fullName);
  const contactNmlsId = text(raw.contact?.nmlsId);
  const contactPhone = link(raw.contact?.phone, "contact-phone");
  const contactEmail = link(raw.contact?.email, "contact-email");
  const contactWebsite = link(raw.contact?.website, "contact-website");
  const socialHeading = text(raw.social?.heading);
  const socialLinks = links(raw.social?.links);
  const headline = text(raw.compliance?.headline);
  const disclaimer = text(raw.compliance?.disclaimer);
  const nmlsConsumerAccess = link(
    raw.compliance?.nmlsConsumerAccess,
    "nmls-consumer-access",
  );
  const equalHousingLabel = text(raw.compliance?.equalHousingLabel);
  const copyrightOwner = text(raw.compliance?.copyrightOwner);
  const organizationNmlsId = text(raw.compliance?.organizationNmlsId);
  const organizationPhone = link(raw.compliance?.organizationPhone, "organization-phone");
  const legalLinks = links(raw.compliance?.legalLinks);
  const startYear = raw.compliance?.copyrightStartYear;

  if (
    !label ||
    !brandPhone ||
    !mapLink ||
    addressLines.length === 0 ||
    !resourcesHeading ||
    resourceLinks.length === 0 ||
    !contactHeading ||
    !contactName ||
    !contactNmlsId ||
    !contactPhone ||
    !contactEmail ||
    !contactWebsite ||
    !socialHeading ||
    socialLinks.length === 0 ||
    !headline ||
    !disclaimer ||
    !nmlsConsumerAccess ||
    !equalHousingLabel ||
    !copyrightOwner ||
    !organizationNmlsId ||
    !organizationPhone ||
    legalLinks.length === 0 ||
    !Number.isInteger(startYear) ||
    !Number.isInteger(currentYear)
  ) {
    return null;
  }

  const copyrightYears = startYear! < currentYear ? `${startYear}-${currentYear}` : `${currentYear}`;

  return {
    brand: {
      label,
      image: image(settings),
      phone: brandPhone,
      addressLines,
      mapLink,
      organizationNmlsId,
    },
    resources: { heading: resourcesHeading, links: resourceLinks },
    contact: {
      heading: contactHeading,
      fullName: contactName,
      nmlsId: contactNmlsId,
      phone: contactPhone,
      email: contactEmail,
      website: contactWebsite,
    },
    social: { heading: socialHeading, links: socialLinks },
    compliance: {
      headline,
      disclaimer,
      nmlsConsumerAccess,
      equalHousingLabel,
      copyrightYears,
      copyrightOwner,
      organizationNmlsId,
      organizationPhone,
      credit: text(raw.compliance?.credit),
      legalLinks,
    },
  };
}
