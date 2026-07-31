import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";
import { PAGE_QUERY } from "../../frontend/sanity/queries/page";

const API_VERSION = "2026-03-23";
const DATASET = "development";
const HOME_PAGE_DRAFT_ID = "drafts.home";

type Block = { _key: string; _type: string; [key: string]: unknown };
type SourceDocument = {
  _id: string;
  _type: "homePage" | "page";
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
  title?: string;
  description?: string;
  pageBuilder?: Block[];
  blocks?: Block[];
  [key: string]: unknown;
};

const baseId = (id: string) => id.replace(/^drafts\./, "");
const draftId = (id: string) => `drafts.${baseId(id)}`;

function preferredSources(documents: SourceDocument[]) {
  const grouped = new Map<string, SourceDocument[]>();
  for (const document of documents) {
    const key = baseId(document._id);
    grouped.set(key, [...(grouped.get(key) ?? []), document]);
  }

  return [...grouped.values()].map((versions) =>
    versions.sort((left, right) => {
      const draftDifference = Number(right._id.startsWith("drafts.")) - Number(left._id.startsWith("drafts."));
      return draftDifference || right._updatedAt.localeCompare(left._updatedAt);
    })[0],
  );
}

function cloneAsDraft(source: SourceDocument) {
  const { _rev, _createdAt, _updatedAt, ...content } = source;
  void _rev;
  void _createdAt;
  void _updatedAt;
  return { ...content, _id: draftId(source._id), _type: "page" as const };
}

async function main() {
  const verifyOnly = process.argv.includes("--verify-only");
  const client = getCliClient({
    apiVersion: API_VERSION,
    dataset: DATASET,
    perspective: "raw",
  });
  if (client.config().dataset !== DATASET) {
    throw new Error(`Refusing to run outside the ${DATASET} dataset`);
  }

  const pageVersions = await client.fetch<SourceDocument[]>(
    `*[_type == "page" && defined(pageBuilder)]`,
  );
  const pageSources = preferredSources(pageVersions);

  const homeVersions = await client.fetch<SourceDocument[]>(
    `*[_type == "homePage" && defined(pageBuilder)]`,
  );
  const homeSource = preferredSources(homeVersions)[0];
  if (!homeSource) throw new Error("No homePage with pageBuilder was found");

  if (!verifyOnly) {
    for (const source of pageSources) {
      const targetId = draftId(source._id);
      await client.createIfNotExists({
        ...cloneAsDraft(source),
        blocks: source.pageBuilder ?? [],
      });
      await client
        .patch(targetId)
        .set({ blocks: source.pageBuilder ?? [] })
        .commit({ visibility: "sync" });
    }

    await client.createIfNotExists({
      _id: HOME_PAGE_DRAFT_ID,
      _type: "page",
      title: homeSource.title ?? "Home",
      slug: { _type: "slug", current: "index" },
      blocks: homeSource.pageBuilder ?? [],
      meta: { description: homeSource.description },
    });
    await client
      .patch(HOME_PAGE_DRAFT_ID)
      .set({
        title: homeSource.title ?? "Home",
        slug: { _type: "slug", current: "index" },
        blocks: homeSource.pageBuilder ?? [],
        "meta.description": homeSource.description,
      })
      .commit({ visibility: "sync" });
  }

  const migrated: SourceDocument[] = await client.fetch(
    `*[_id in $ids]{_id, pageBuilder, "blocks": blocks}`,
    { ids: [...pageSources.map((source) => draftId(source._id)), HOME_PAGE_DRAFT_ID] },
  );
  const byId = new Map<string, SourceDocument>(
    migrated.map((document: SourceDocument) => [document._id, document]),
  );

  for (const source of pageSources) {
    const target = byId.get(draftId(source._id));
    if (!target || !isDeepStrictEqual(target.blocks, source.pageBuilder ?? [])) {
      throw new Error(`Block copy verification failed for ${draftId(source._id)}`);
    }
    if (!isDeepStrictEqual(target.pageBuilder, source.pageBuilder)) {
      throw new Error(`pageBuilder changed for ${draftId(source._id)}`);
    }
  }

  const migratedHome = byId.get(HOME_PAGE_DRAFT_ID);
  if (!migratedHome || !isDeepStrictEqual(migratedHome.blocks, homeSource.pageBuilder ?? [])) {
    throw new Error("Homepage block copy verification failed");
  }

  const queriedHome = await client.fetch<{
    _id: string;
    blocks: Array<Record<string, unknown> & { _key: string; _type: string }>;
  } | null>(PAGE_QUERY, { slug: "index" });
  if (
    !queriedHome ||
    queriedHome.blocks[0]?._type !== "homeHero" ||
    queriedHome.blocks[1]?._type !== "loanFeatureCards" ||
    queriedHome.blocks[2]?._type !== "videoFeature" ||
    queriedHome.blocks[3]?._type !== "phxEmbedSocialReviews" ||
    queriedHome.blocks[4]?._type !== "latestArticles" ||
    queriedHome.blocks[5]?._type !== "faqAccordion" ||
    queriedHome.blocks[6]?._type !== "awardCta"
  ) {
    throw new Error("The transitional page query did not return the supported homepage blocks first");
  }
  const loanFeatureCards = queriedHome.blocks[1];
  if (!Array.isArray(loanFeatureCards.cards) || loanFeatureCards.cards.length === 0) {
    throw new Error("The transitional page query did not project Loan Feature Cards");
  }
  const videoFeature = queriedHome.blocks[2];
  if (typeof videoFeature.youtubeUrl !== "string" || videoFeature.youtubeUrl.length === 0) {
    throw new Error("The transitional page query did not project Video Feature");
  }
  const socialReviews = queriedHome.blocks[3];
  if (
    typeof socialReviews.iframeSrc !== "string" ||
    socialReviews.iframeSrc.length === 0
  ) {
    throw new Error("The transitional page query did not project Social Reviews");
  }
  const latestArticles = queriedHome.blocks[4];
  if (!Array.isArray(latestArticles.articles) || latestArticles.articles.length === 0) {
    throw new Error("The transitional page query did not project Latest Articles");
  }
  const faqAccordion = queriedHome.blocks[5];
  if (!Array.isArray(faqAccordion.faqs) || faqAccordion.faqs.length === 0) {
    throw new Error("The transitional page query did not project FAQ Accordion");
  }
  const awardCta = queriedHome.blocks[6];
  if (!Array.isArray(awardCta.buttons) || awardCta.buttons.length === 0) {
    throw new Error("The transitional page query did not project Award CTA");
  }
  for (const block of queriedHome.blocks.slice(7)) {
    if (!isDeepStrictEqual(Object.keys(block).sort(), ["_key", "_type"])) {
      throw new Error(`Unsupported block ${block._type} returned more than its identity`);
    }
  }

  console.log(JSON.stringify({
    dataset: DATASET,
    mode: verifyOnly ? "verify-only" : "migrate-and-verify",
    homeSource: homeSource._id,
    homeTarget: HOME_PAGE_DRAFT_ID,
    pageDrafts: pageSources.length,
    queriedHome: queriedHome._id,
    queriedBlocks: queriedHome.blocks.map(
      ({ _key, _type }: { _key: string; _type: string }) => ({ _key, _type }),
    ),
    verified: true,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
