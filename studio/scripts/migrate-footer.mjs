import process from "node:process";
import { isDeepStrictEqual } from "node:util";
import { pathToFileURL } from "node:url";
import { createClient } from "@sanity/client";

const FOOTER_ID = "footer";
const EXPECTED_SUMMARY = { legalLinks: 2, resourceLinks: 8, socialLinks: 5 };

function required(value, message) {
  if (typeof value !== "string" || !value.trim()) throw new Error(message);
  return value.trim();
}

function externalDestination(external, openInNewTab = false) {
  return {
    _type: "footerDestination",
    external,
    kind: "external",
    openInNewTab,
  };
}

function footerLink(key, label, external, openInNewTab = false) {
  return {
    _key: key,
    _type: "footerLink",
    destination: externalDestination(external, openInNewTab),
    label,
  };
}

function transformLegacyLink(source, owner) {
  const key = required(source?._key, `${owner} is missing _key`);
  const label = required(source?.name, `${key} is missing a label`);
  if (source?.url?.type === "internal" && source.url.internal?._ref) {
    return {
      _key: key,
      _type: "footerLink",
      destination: {
        _type: "footerDestination",
        internal: { _ref: source.url.internal._ref, _type: "reference" },
        kind: "internal",
        openInNewTab: Boolean(source.url.openInNewTab),
      },
      label,
    };
  }
  const external = required(source?.url?.external || source?.url?.href, `${key} has no URL`);
  return footerLink(key, label, external, Boolean(source.url.openInNewTab));
}

function columnByKey(source, key) {
  const column = source.columns?.find((item) => item?._key === key);
  if (!column) throw new Error(`Legacy footer is missing ${key}`);
  return column;
}

function linkByKey(column, key) {
  const value = column.links?.find((item) => item?._key === key);
  if (!value) throw new Error(`${column._key} is missing ${key}`);
  return transformLegacyLink(value, column._key);
}

function telephoneHref(label) {
  const digits = required(label, "Phone number is missing").replace(/\D/g, "");
  return `tel:+${digits.length === 10 ? `1${digits}` : digits}`;
}

export function transformLegacyFooter(source) {
  if (source?._id !== FOOTER_ID || source?._type !== "footer") {
    throw new Error("Expected the legacy footer singleton");
  }
  if (!Array.isArray(source.columns)) {
    if (source.brand && source.resources && source.contact && source.social && source.compliance) {
      return source;
    }
    throw new Error("Footer is neither legacy nor canonical");
  }

  const resources = columnByKey(source, "useful-resources");
  const contact = columnByKey(source, "contact-jimmy");
  const compliance = source.compliance;
  if (!compliance) throw new Error("Legacy footer has no compliance content");

  const contactPhone = linkByKey(contact, "call-jimmy");
  const contactEmail = linkByKey(contact, "email-jimmy");
  const contactWebsite = linkByKey(contact, "website");
  const organizationPhoneLabel = required(
    compliance.organizationPhone,
    "Organization phone is missing",
  );

  return {
    _id: FOOTER_ID,
    _type: "footer",
    brand: {
      _type: "object",
      addressLines: ["3602 E Campbell Ave,", "Phoenix AZ 85018"],
      mapLink: footerLink(
        "google-maps",
        "Google Maps",
        "https://www.google.com/maps/place/3602+E+Campbell+Ave,+Phoenix,+AZ+85018",
        true,
      ),
      phone: footerLink("brand-phone", "602-908-5849", "tel:+16029085849"),
    },
    resources: {
      _type: "object",
      heading: required(resources.title, "Resources heading is missing"),
      links: resources.links.map((item) => transformLegacyLink(item, resources._key)),
    },
    contact: {
      _type: "object",
      email: contactEmail,
      fullName: "Jimmy Vercellino",
      heading: required(contact.title, "Contact heading is missing"),
      nmlsId: "184169",
      phone: contactPhone,
      website: contactWebsite,
    },
    social: {
      _type: "object",
      heading: "Follow",
      links: [
        footerLink(
          "youtube",
          "YouTube",
          "https://www.youtube.com/watch?v=OOfeMMtcOCI",
          true,
        ),
        footerLink("twitter", "Twitter", "https://twitter.com/phxhomeloan", true),
        footerLink(
          "linkedin",
          "LinkedIn",
          "https://www.linkedin.com/in/jimmy-vercellino-29060930/",
          true,
        ),
        footerLink(
          "facebook",
          "Facebook",
          "https://www.facebook.com/TheVercellinoTeam",
          true,
        ),
        footerLink(
          "instagram",
          "Instagram",
          "https://www.instagram.com/jimmyvercellino_/",
          true,
        ),
      ],
    },
    compliance: {
      _type: "object",
      copyrightOwner: required(compliance.copyrightOwner, "Copyright owner is missing"),
      copyrightStartYear: compliance.copyrightStartYear,
      credit: compliance.credit,
      disclaimer: required(compliance.disclaimer, "Disclaimer is missing"),
      equalHousingLabel: required(
        compliance.equalHousingLabel,
        "Equal Housing label is missing",
      ),
      headline: required(compliance.headline, "Compliance headline is missing"),
      legalLinks: (compliance.legalLinks || []).map((item) =>
        transformLegacyLink(item, "legalLinks"),
      ),
      nmlsConsumerAccess: footerLink(
        "nmls-consumer-access",
        required(compliance.nmlsConsumerAccessLabel, "NMLS label is missing"),
        required(compliance.nmlsConsumerAccessUrl, "NMLS URL is missing"),
        true,
      ),
      organizationNmlsId: required(
        compliance.organizationNmlsId,
        "Organization NMLS ID is missing",
      ),
      organizationPhone: footerLink(
        "organization-phone",
        organizationPhoneLabel,
        telephoneHref(organizationPhoneLabel),
      ),
    },
  };
}

function contentShape(document) {
  if (!document) return null;
  const { _createdAt, _rev, _system, _updatedAt, ...content } = document;
  return content;
}

function summarize(document) {
  return {
    legalLinks: document.compliance?.legalLinks?.length ?? 0,
    resourceLinks: document.resources?.links?.length ?? 0,
    socialLinks: document.social?.links?.length ?? 0,
  };
}

async function run() {
  process.loadEnvFile(".env");
  process.loadEnvFile("../frontend/.env.local");
  const apply = process.argv.includes("--apply");
  const dataset = required(process.env.SANITY_STUDIO_DATASET, "Missing dataset");
  const client = createClient({
    apiVersion: "2026-08-02",
    dataset,
    perspective: "raw",
    projectId: required(process.env.SANITY_STUDIO_PROJECT_ID, "Missing project ID"),
    token: required(
      process.env.SANITY_AUTH_TOKEN || process.env.SANITY_API_READ_TOKEN,
      "Missing Sanity token",
    ),
    useCdn: false,
  });
  const source = await client.getDocument(FOOTER_ID);
  if (!source) throw new Error("Missing footer singleton");
  const transformed = transformLegacyFooter(source);
  const summary = summarize(transformed);
  if (!isDeepStrictEqual(summary, EXPECTED_SUMMARY)) {
    throw new Error(`Unexpected footer inventory: ${JSON.stringify(summary)}`);
  }

  const canonical = !Array.isArray(source.columns);
  console.log(
    JSON.stringify({
      dataset,
      mode: apply ? "apply" : "dry-run",
      noOp: canonical,
      sourceRevision: source._rev,
      summary,
    }),
  );
  if (!apply || canonical) return;

  const { _id, _type, ...fields } = transformed;
  await client
    .patch(FOOTER_ID)
    .ifRevisionId(source._rev)
    .set(fields)
    .unset(["columns", "label", "subtitle"])
    .commit({ visibility: "sync" });

  const stored = await client.getDocument(FOOTER_ID);
  if (!isDeepStrictEqual(contentShape(stored), transformed)) {
    throw new Error("Stored canonical footer does not match the transform");
  }
  console.log(JSON.stringify({ applied: true, targetRevision: stored._rev, verified: true }));
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
