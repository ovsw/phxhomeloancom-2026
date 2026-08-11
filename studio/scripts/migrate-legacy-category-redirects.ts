import process from "node:process";
import { pathToFileURL } from "node:url";
import { getCliClient } from "sanity/cli";

import { compileNextRedirects } from "../../frontend/lib/redirects.mjs";
import { HARD_CODED_GONE_ROUTE_PATHS } from "../../frontend/lib/gone-routes.ts";
import { autoRedirectId } from "../functions/auto-redirect/model.ts";
import { getPresentationPath } from "../presentation/routes.ts";
import {
  normalizeRedirectPath,
  readRedirectPath,
  type RedirectRecord,
} from "../schemas/validation/redirect-rules.ts";

const compileRedirectTopology = compileNextRedirects as (
  records: RedirectRecord[],
  options?: { reservedSources?: readonly string[] },
) => unknown;

const API_VERSION = "2026-08-11";
const PROJECT_ID = "hv0545v9";
const DATASET = "development";

export const LEGACY_CATEGORY_REDIRECTS = [
  {
    source: "/types-of-loans/",
    destination: "/blog/category/loan-types/",
    categoryId: "9e74332a-7a4e-4322-bd00-91dd80c29e94",
    categorySlug: "loan-types",
  },
  {
    source: "/requirements/",
    destination: "/blog/category/getting-approved/",
    categoryId: "5fd54e84-404e-459f-bc8f-6ea5435149f9",
    categorySlug: "getting-approved",
  },
  {
    source: "/personal-finances/",
    destination: "/blog/category/closing-costs/",
    categoryId: "ec3cbe04-4630-4c73-bc41-f73523b2de97",
    categorySlug: "closing-costs",
  },
  {
    source: "/benefits-of-buying-now/",
    destination: "/blog/category/mortgage-rates/",
    categoryId: "a8649d6b-6478-4c41-8294-e3b947539946",
    categorySlug: "mortgage-rates",
  },
  {
    source: "/buyer-education/",
    destination: "/blog/",
  },
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
  blogIndexes: InventoryDocument[];
  deterministicDocuments: RedirectDocument[];
  redirects: RedirectDocument[];
  routedDocuments: InventoryDocument[];
  targetCategories: InventoryDocument[];
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

function publishedId(id: string) {
  return id.replace(/^drafts\./, "");
}

function readSlug(value: RedirectRecord["source"]) {
  if (!value || typeof value !== "object") return undefined;
  return "_type" in value && value._type === "slug" ? value.current : undefined;
}

function exactRedirectMatch(
  document: RedirectDocument,
  expected: ExpectedRedirectDocument,
) {
  return (
    document._id === expected._id &&
    document._type === expected._type &&
    readSlug(document.source) === expected.source.current &&
    readSlug(document.destination) === expected.destination.current &&
    document.status === expected.status &&
    document.permanent === expected.permanent
  );
}

function routePath(document: InventoryDocument) {
  const slug =
    typeof document.slug?.current === "string"
      ? document.slug.current
      : undefined;
  return getPresentationPath(document._type, slug);
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

function targetErrors(inventory: MigrationInventory) {
  const fatal: Array<{ id: string; reason: string }> = [];

  for (const mapping of LEGACY_CATEGORY_REDIRECTS) {
    if (!("categoryId" in mapping)) continue;

    const versions = inventory.targetCategories.filter(
      (document) => publishedId(document._id) === mapping.categoryId,
    );
    const published = versions.find(
      (document) => document._id === mapping.categoryId,
    );
    if (!published || published._type !== "category") {
      fatal.push({
        id: mapping.categoryId,
        reason: "target category has no published category document",
      });
      continue;
    }
    if (published.slug?.current !== mapping.categorySlug) {
      fatal.push({
        id: mapping.categoryId,
        reason: `published target slug must be ${mapping.categorySlug}`,
      });
    }

    const draft = versions.find(
      (document) => document._id === `drafts.${mapping.categoryId}`,
    );
    if (draft && (draft._type !== "category" || draft.slug?.current !== mapping.categorySlug)) {
      fatal.push({
        id: draft._id,
        reason: `draft target slug must be ${mapping.categorySlug}`,
      });
    }
  }

  const blogIndex = inventory.blogIndexes.find(
    (document) =>
      document._id === "blogIndex" &&
      document._type === "blogIndex" &&
      normalizeRedirectPath(routePath(document)) === "/blog",
  );
  if (!blogIndex) {
    fatal.push({
      id: "blogIndex",
      reason: "published blog index route /blog/ does not resolve",
    });
  }

  return fatal;
}

function classifyRedirect(
  expected: ExpectedRedirectDocument,
  inventory: MigrationInventory,
): RedirectClassification {
  const source = normalizeRedirectPath(expected.source.current);
  const deterministicPublished = inventory.deterministicDocuments.find(
    (document) => document._id === expected._id,
  );
  const deterministicDraft = inventory.deterministicDocuments.find(
    (document) => document._id === `drafts.${expected._id}`,
  );
  if (deterministicDraft) {
    return {
      document: expected,
      status: "fatal",
      reason: `draft ${deterministicDraft._id} could publish over the migration`,
    };
  }

  const routeOwner = inventory.routedDocuments.find(
    (document) => normalizeRedirectPath(routePath(document)) === source,
  );
  if (routeOwner) {
    return {
      document: expected,
      status: "fatal",
      reason: `source is already owned by ${routeOwner._type} ${routeOwner._id}`,
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

  if (!deterministicPublished) {
    return { document: expected, status: "create" };
  }
  if (!exactRedirectMatch(deterministicPublished, expected)) {
    return {
      document: expected,
      status: "fatal",
      reason: "document at the deterministic id differs from the expected redirect",
    };
  }
  return { document: expected, status: "no-op" };
}

function topologyErrors(
  inventory: MigrationInventory,
  expected: ExpectedRedirectDocument[],
) {
  try {
    compileRedirectTopology([...inventory.redirects, ...expected], {
      reservedSources: HARD_CODED_GONE_ROUTE_PATHS,
    });
    return [];
  } catch (error) {
    return [
      {
        id: "redirect-topology",
        reason: error instanceof Error ? error.message : String(error),
      },
    ];
  }
}

export function buildMigrationPlan(
  inventory: MigrationInventory,
): MigrationPlan {
  const expected = expectedRedirectDocuments();
  const records = expected.map((document) =>
    classifyRedirect(document, inventory),
  );
  const fatal = [
    ...targetErrors(inventory),
    ...records.flatMap((record) =>
      record.status === "fatal" && record.reason
        ? [{ id: record.document._id, reason: record.reason }]
        : [],
    ),
    ...topologyErrors(inventory, expected),
  ];

  return {
    records,
    creates: records.flatMap((record) =>
      record.status === "create" ? [record.document] : [],
    ),
    fatal,
    summary: {
      create: records.filter((record) => record.status === "create").length,
      noOp: records.filter((record) => record.status === "no-op").length,
      fatal: records.filter((record) => record.status === "fatal").length,
    },
  };
}

export function buildAuditErrors(inventory: MigrationInventory) {
  const plan = buildMigrationPlan(inventory);
  const errors = plan.fatal.map(({ id, reason }) => `${id}: ${reason}`);

  for (const record of plan.records) {
    if (record.status !== "no-op") {
      errors.push(`${record.document._id}: expected an exact published redirect`);
    }

    const source = normalizeRedirectPath(record.document.source.current);
    const routeOwners = inventory.routedDocuments.filter(
      (document) => normalizeRedirectPath(routePath(document)) === source,
    );
    const redirectOwners = inventory.redirects.filter(
      (document) =>
        normalizeRedirectPath(readRedirectPath(document.source)) === source,
    );
    if (
      routeOwners.length !== 0 ||
      redirectOwners.length !== 1 ||
      redirectOwners[0]._id !== record.document._id
    ) {
      errors.push(
        `${record.document._id}: legacy source must have exactly one owner`,
      );
    }
  }

  return [...new Set(errors)];
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
  const categoryIds = LEGACY_CATEGORY_REDIRECTS.flatMap((mapping) =>
    "categoryId" in mapping ? [mapping.categoryId] : [],
  );
  const categoryVersionIds = categoryIds.flatMap((id) => [id, `drafts.${id}`]);
  const redirectIds = expectedRedirectDocuments().flatMap(({ _id }) => [
    _id,
    `drafts.${_id}`,
  ]);

  return client.fetch<MigrationInventory>(
    `{
      "blogIndexes": *[_id in ["blogIndex", "drafts.blogIndex"]]{_id, _type},
      "deterministicDocuments": *[_id in $redirectIds]{
        _id,
        _type,
        status,
        source,
        destination,
        permanent
      },
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
      ]{_id, _type, slug},
      "targetCategories": *[_id in $categoryVersionIds]{_id, _type, slug}
    }`,
    { categoryVersionIds, redirectIds },
  );
}

export async function run() {
  const apply = process.argv.includes("--apply");
  const client = getCliClient({
    apiVersion: API_VERSION,
    dataset: DATASET,
    perspective: "raw",
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

  const auditErrors = buildAuditErrors(await fetchInventory(client));
  if (auditErrors.length) {
    throw new Error(`Post-write audit failed:\n${auditErrors.join("\n")}`);
  }
  console.log(
    JSON.stringify(
      {
        applied: true,
        created: plan.creates.length,
        exactRedirects: LEGACY_CATEGORY_REDIRECTS.length,
        collisionAudit: true,
        topologyAudit: true,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
