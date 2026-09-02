import { createReadStream } from "node:fs";
import { basename } from "node:path";
import { pathToFileURL } from "node:url";
import type { Patch } from "@sanity/client";
import { getCliClient } from "sanity/cli";

const API_VERSION = "2026-03-23";
const DEFAULT_DATASET = "development";
const ALLOWED_DATASETS = ["development", "production"];
const SETTINGS_ID = "settings";
const HOME_PAGE_ID = "homePage";
const CONTACT_PAGE_ID = "contactMe";
const REDIRECT_ID = "redirect-award-2019-home";
const OLD_AWARD_PATH =
  "/jimmy-vercellino-awarded-top-1-percent-mortgage-originators-in-us-2019";
const SCOTSMAN_RANKING_URL =
  "https://www.scotsmanguide.com/rankings/top-originators/top-originators-rankings-2026/";

type SanityDocument = {
  _id: string;
  _rev: string;
  _type: string;
};

type Block = {
  _key?: string;
  _type?: string;
};

type PageDocument = SanityDocument & {
  blocks?: Block[];
  slug?: { current?: string };
};

type RedirectDocument = SanityDocument & {
  source?: { current?: string };
};

type SettingsDocument = SanityDocument & {
  award?: {
    sealImage?: {
      asset?: { _ref?: string };
    };
  };
};

export function resolveDataset() {
  const explicit = process.env.SANITY_STUDIO_DATASET?.trim();
  const dataset = explicit || DEFAULT_DATASET;
  if (!ALLOWED_DATASETS.includes(dataset)) {
    throw new Error(`Refusing to run against dataset "${dataset}"`);
  }
  return dataset;
}

export function getSealFileArg(argv = process.argv) {
  const index = argv.indexOf("--seal-file");
  return index === -1 ? undefined : argv[index + 1];
}

export function createAwardSettings(sealAssetRef?: string) {
  return {
    _type: "object",
    eyebrow: "A track record you can verify",
    title: "2026 Scotsman Guide Top Originator",
    description:
      "James Vercellino was listed among Scotsman Guide's 2026 Top Originators.",
    sealImage: sealAssetRef
      ? {
          _type: "image",
          asset: { _ref: sealAssetRef, _type: "reference" },
          alt: "Scotsman Guide Top Originators 2026 logo",
        }
      : undefined,
    sealSize: "medium",
    proofLink: {
      _type: "object",
      label: "View list",
      accessibleLabel: "View Scotsman Guide Top Originators 2026 ranking list",
      url: {
        _type: "customUrl",
        type: "external",
        external: SCOTSMAN_RANKING_URL,
        openInNewTab: true,
      },
    },
    ctaButton: {
      _key: "schedule-consult",
      _type: "button",
      text: "Schedule a Consult",
      url: {
        _type: "customUrl",
        type: "internal",
        internal: { _ref: CONTACT_PAGE_ID, _type: "reference" },
        openInNewTab: false,
      },
    },
  };
}

export function buildAwardBlockUnsetPaths(documents: PageDocument[]) {
  return documents.flatMap((document) =>
    (document.blocks ?? []).flatMap((block, index) => {
      if (block._type !== "awardCta") return [];
      const blockPath = block._key
        ? `blocks[_key=="${block._key}"]`
        : `blocks[${index}]`;
      return [
        {
          documentId: document._id,
          path: `${blockPath}.highlight`,
        },
        {
          documentId: document._id,
          path: `${blockPath}.title`,
        },
        {
          documentId: document._id,
          path: `${blockPath}.description`,
        },
        {
          documentId: document._id,
          path: `${blockPath}.buttons`,
        },
      ];
    }),
  );
}

function redirectFields() {
  return {
    destinationReference: { _ref: HOME_PAGE_ID, _type: "reference" },
    permanent: "true",
    source: { _type: "slug", current: OLD_AWARD_PATH },
    status: "active",
  };
}

function summarizePage(document: PageDocument) {
  return {
    id: document._id,
    type: document._type,
    slug: document.slug?.current ?? null,
    awardBlocks: (document.blocks ?? []).filter(
      (block) => block._type === "awardCta",
    ).length,
  };
}

async function uploadSealAsset(client: ReturnType<typeof getCliClient>, file: string) {
  const asset = await client.assets.upload("image", createReadStream(file), {
    filename: basename(file),
  });
  return asset._id;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const sealFile = getSealFileArg();
  const dataset = resolveDataset();
  const client = getCliClient({
    apiVersion: API_VERSION,
    dataset,
    perspective: "raw",
  });

  if (client.config().dataset !== dataset) {
    throw new Error(`Refusing to run outside the ${dataset} dataset`);
  }

  const [
    settings,
    settingsDraft,
    homePage,
    contactPage,
    awardPages,
    pageDocuments,
    redirects,
  ] = await Promise.all([
      client.fetch<SettingsDocument | null>(
        `*[_id == $id && _type == "settings"][0]`,
        { id: SETTINGS_ID },
      ),
      client.fetch<SettingsDocument | null>(
        `*[_id == $id && _type == "settings"][0]`,
        { id: `drafts.${SETTINGS_ID}` },
      ),
      client.fetch<SanityDocument | null>(
        `*[_id == $id && _type == "homePage"][0]`,
        { id: HOME_PAGE_ID },
      ),
      client.fetch<SanityDocument | null>(
        `*[_id == $id && _type == "page"][0]`,
        { id: CONTACT_PAGE_ID },
      ),
      client.fetch<PageDocument[]>(
        `*[_type == "page" && slug.current in [$path, $path + "/"]]{
          _id,
          _rev,
          _type,
          slug
        }`,
        { path: OLD_AWARD_PATH },
      ),
      client.fetch<PageDocument[]>(
        `*[_type in ["page", "homePage"] && count(blocks[_type == "awardCta"]) > 0]{
          _id,
          _rev,
          _type,
          slug,
          blocks[]{_key, _type}
        }`,
      ),
      client.fetch<RedirectDocument[]>(
        `*[_type == "redirect" && source.current in [$path, $path + "/"]]{
          _id,
          _rev,
          _type,
          source
        }`,
        { path: OLD_AWARD_PATH },
      ),
    ]);

  if (!settings) throw new Error("Missing settings singleton");
  if (!homePage) throw new Error("Missing homePage singleton");
  if (!contactPage) throw new Error(`Missing ${CONTACT_PAGE_ID} page`);
  if (redirects.length > 1) {
    throw new Error(`Multiple redirects already claim ${OLD_AWARD_PATH}`);
  }

  const existingSealAssetRef = settings.award?.sealImage?.asset?._ref;
  const needsSealUpload = !existingSealAssetRef;
  if (apply && needsSealUpload && !sealFile) {
    throw new Error("Pass --seal-file <path> before applying");
  }

  console.log(
    JSON.stringify(
      {
        dataset,
        mode: apply ? "apply" : "dry-run",
        settings: {
          id: SETTINGS_ID,
          willSetAward: true,
          willPatchDraft: Boolean(settingsDraft),
          needsSealUpload,
        },
        pagesWithAwardCta: pageDocuments.map(summarizePage),
        oldAwardPagesToDelete: awardPages.map((page: PageDocument) => ({
          id: page._id,
          slug: page.slug?.current,
        })),
        redirect: {
          id: redirects[0]?._id ?? REDIRECT_ID,
          source: OLD_AWARD_PATH,
          destinationReference: HOME_PAGE_ID,
          permanent: true,
          action: redirects[0] ? "patch" : "create",
        },
        unsetFieldCount: buildAwardBlockUnsetPaths(pageDocuments).length,
      },
      null,
      2,
    ),
  );

  if (!apply) return;

  const sealAssetRef = existingSealAssetRef ?? (await uploadSealAsset(client, sealFile!));
  const transaction = client.transaction();
  transaction.patch(SETTINGS_ID, (patch: Patch) =>
    patch.ifRevisionId(settings._rev).set({
      award: createAwardSettings(sealAssetRef),
    }),
  );

  // A stale Settings draft would hide the award in Studio and erase it on publish.
  if (settingsDraft) {
    transaction.patch(settingsDraft._id, (patch: Patch) =>
      patch.ifRevisionId(settingsDraft._rev).set({
        award: createAwardSettings(sealAssetRef),
      }),
    );
  }

  const unsetPaths = buildAwardBlockUnsetPaths(pageDocuments);
  for (const document of pageDocuments) {
    const paths = unsetPaths
      .filter((item) => item.documentId === document._id)
      .map((item) => item.path);
    if (paths.length === 0) continue;
    transaction.patch(document._id, (patch: Patch) =>
      patch.ifRevisionId(document._rev).unset(paths),
    );
  }

  for (const page of awardPages) {
    transaction.delete(page._id);
  }

  if (redirects[0]) {
    transaction.patch(redirects[0]._id, (patch: Patch) =>
      patch
        .ifRevisionId(redirects[0]._rev)
        .set(redirectFields())
        .unset(["destination"]),
    );
  } else {
    transaction.create({ _id: REDIRECT_ID, _type: "redirect", ...redirectFields() });
  }

  await transaction.commit({ visibility: "sync" });

  const after = await client.fetch<{
    settingsAwardTitle?: string;
    oldAwardPageCount: number;
    redirectDestination?: string;
    remainingOldAwardFieldCount: number;
  }>(
    `{
      "settingsAwardTitle": *[_id == $settingsId][0].award.title,
      "oldAwardPageCount": count(*[_type == "page" && slug.current in [$path, $path + "/"]]),
      "redirectDestination": *[_type == "redirect" && source.current in [$path, $path + "/"]][0].destinationReference._ref,
      "remainingOldAwardFieldCount": count(*[
        _type in ["page", "homePage"] &&
        count(blocks[
          _type == "awardCta" &&
          (defined(highlight) || defined(title) || defined(description) || defined(buttons))
        ]) > 0
      ])
    }`,
    {
      path: OLD_AWARD_PATH,
      settingsId: SETTINGS_ID,
    },
  );

  if (
    after.settingsAwardTitle !== createAwardSettings(sealAssetRef).title ||
    after.oldAwardPageCount !== 0 ||
    after.redirectDestination !== HOME_PAGE_ID ||
    after.remainingOldAwardFieldCount !== 0
  ) {
    throw new Error("Verification failed after award migration");
  }

  console.log(JSON.stringify({ applied: true, verified: true }, null, 2));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
