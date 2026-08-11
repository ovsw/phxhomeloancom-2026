import process from "node:process";
import { pathToFileURL } from "node:url";
import { getCliClient } from "sanity/cli";

import { autoRedirectId } from "../functions/auto-redirect/model.ts";
import { getPresentationPath } from "../presentation/routes.ts";
import {
  normalizeRedirectPath,
  readRedirectPath,
  type RedirectRecord,
} from "../schemas/validation/redirect-rules.ts";

const API_VERSION = "2026-08-11";
const PROJECT_ID = "hv0545v9";
const DATASET = "development";

// The five legacy WordPress archive URLs and where they now point.
// Destinations under /blog/category/ must match the final category slugs
// assigned by the rename branch.
export const LEGACY_CATEGORY_REDIRECTS = [
  { source: "/types-of-loans/", destination: "/blog/category/loan-types/" },
  { source: "/requirements/", destination: "/blog/category/getting-approved/" },
  { source: "/personal-finances/", destination: "/blog/category/closing-costs/" },
  {
    source: "/benefits-of-buying-now/",
    destination: "/blog/category/mortgage-rates/",
  },
  { source: "/buyer-education/", destination: "/blog/" },
] as const;

export type InventoryDocument = {
  _id: string;
  _type: string;
  slug?: { current?: unknown } | null;
};

export type RedirectDocument = RedirectRecord & {
  _id: string;
  _type: string;
};

export type MigrationInventory = {
  categorySlugs: string[];
  redirects: RedirectDocument[];
  routedDocuments: InventoryDocument[];
};

type ExpectedRedirectDocument = {
  _id: string;
  _type: "redirect";
  destination: { _type: "slug"; current: string };
  permanent: "true";
  source: { _type: "slug"; current: string };
  status: "active";
};

type RedirectClassification = {
  document: ExpectedRedirectDocument;
  reason?: string;
  status: "create" | "no-op" | "fatal";
};

export type MigrationPlan = {
  creates: ExpectedRedirectDocument[];
  fatal: Array<{ id: string; reason: string }>;
  records: RedirectClassification[];
  summary: { create: number; fatal: number; noOp: number };
};

function readSlug(value: RedirectRecord["source"]) {
  if (!value || typeof value !== "object") return undefined;
  return "_type" in value && value._type === "slug" ? value.current : undefined;
}

function routePath(document: InventoryDocument) {
  const slug =
    typeof document.slug?.current === "string"
      ? document.slug.current
      : undefined;
  return getPresentationPath(document._type, slug);
}

function destinationCategorySlug(destination: string) {
  const match = /^\/blog\/category\/([^/]+)\/$/.exec(destination);
  return match?.[1];
}

function expectedRedirectDocuments(): ExpectedRedirectDocument[] {
  return LEGACY_CATEGORY_REDIRECTS.map(({ source, destination }) => ({
    _id: autoRedirectId(source),
    _type: "redirect",
    status: "active",
    source: { _type: "slug", current: source },
    destination: { _type: "slug", current: destination },
    permanent: "true",
  }));
}

function classifyRedirect(
  expected: ExpectedRedirectDocument,
  inventory: MigrationInventory,
): RedirectClassification {
  const source = normalizeRedirectPath(expected.source.current);

  const categorySlug = destinationCategorySlug(expected.destination.current);
  if (categorySlug && !inventory.categorySlugs.includes(categorySlug)) {
    return {
      document: expected,
      status: "fatal",
      reason: `no published category with slug ${categorySlug}`,
    };
  }

  const routeOwner = inventory.routedDocuments.find(
    (document) => normalizeRedirectPath(routePath(document)) === source,
  );
  if (routeOwner) {
    return {
      document: expected,
      status: "fatal",
      reason: `source is a live route owned by ${routeOwner._type} ${routeOwner._id}`,
    };
  }

  const otherRedirectOwner = inventory.redirects.find(
    (document) =>
      document._id !== expected._id &&
      normalizeRedirectPath(readRedirectPath(document.source)) === source,
  );
  if (otherRedirectOwner) {
    return {
      document: expected,
      status: "fatal",
      reason: `source is already owned by redirect ${otherRedirectOwner._id}`,
    };
  }

  const existing = inventory.redirects.find(
    (document) => document._id === expected._id,
  );
  if (!existing) {
    return { document: expected, status: "create" };
  }
  if (
    readSlug(existing.source) === expected.source.current &&
    readSlug(existing.destination) === expected.destination.current &&
    existing.status === expected.status &&
    existing.permanent === expected.permanent
  ) {
    return { document: expected, status: "no-op" };
  }
  return {
    document: expected,
    status: "fatal",
    reason: "document at the deterministic id differs from the expected redirect",
  };
}

export function buildMigrationPlan(
  inventory: MigrationInventory,
): MigrationPlan {
  const records = expectedRedirectDocuments().map((document) =>
    classifyRedirect(document, inventory),
  );

  return {
    records,
    creates: records.flatMap((record) =>
      record.status === "create" ? [record.document] : [],
    ),
    fatal: records.flatMap((record) =>
      record.status === "fatal" && record.reason
        ? [{ id: record.document._id, reason: record.reason }]
        : [],
    ),
    summary: {
      create: records.filter((record) => record.status === "create").length,
      noOp: records.filter((record) => record.status === "no-op").length,
      fatal: records.filter((record) => record.status === "fatal").length,
    },
  };
}

export function buildDryRunReport(plan: MigrationPlan, apply = false) {
  return {
    projectId: PROJECT_ID,
    dataset: DATASET,
    mode: apply ? "apply" : "dry-run",
    summary: plan.summary,
    fatal: plan.fatal,
    records: plan.records,
  };
}

export function assertTargetDataset(config: {
  dataset?: string;
  projectId?: string;
}) {
  if (config.projectId !== PROJECT_ID || config.dataset !== DATASET) {
    throw new Error(
      `Refusing to run outside ${PROJECT_ID}/${DATASET}; received ${config.projectId}/${config.dataset}`,
    );
  }
}

async function fetchInventory(
  client: ReturnType<typeof getCliClient>,
): Promise<MigrationInventory> {
  return client.fetch<MigrationInventory>(
    `{
      "categorySlugs": *[_type == "category" && defined(slug.current)].slug.current,
      "redirects": *[_type == "redirect"]{
        _id,
        _type,
        status,
        source,
        destination,
        permanent
      },
      "routedDocuments": *[
        _type in ["page", "post", "category"] &&
        defined(slug.current)
      ]{_id, _type, slug}
    }`,
  );
}

export async function run() {
  const apply = process.argv.includes("--apply");
  const client = getCliClient({
    apiVersion: API_VERSION,
    dataset: DATASET,
    perspective: "published",
    useCdn: false,
  });
  assertTargetDataset(client.config());

  const inventory = await fetchInventory(client);
  const plan = buildMigrationPlan(inventory);
  console.log(JSON.stringify(buildDryRunReport(plan, apply), null, 2));

  if (plan.fatal.length) {
    throw new Error(`Aborting before writes: ${plan.fatal.length} fatal issue(s)`);
  }
  if (!apply) return;

  if (plan.creates.length) {
    let transaction = client.transaction();
    for (const document of plan.creates) {
      transaction = transaction.createIfNotExists(document);
    }
    await transaction.commit({ visibility: "sync" });
  }

  const after = buildMigrationPlan(await fetchInventory(client));
  if (after.summary.noOp !== LEGACY_CATEGORY_REDIRECTS.length) {
    throw new Error(
      `Post-write check failed: expected ${LEGACY_CATEGORY_REDIRECTS.length} redirects in place, got ${after.summary.noOp}`,
    );
  }
  console.log(
    JSON.stringify({ applied: true, created: plan.creates.length }, null, 2),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
