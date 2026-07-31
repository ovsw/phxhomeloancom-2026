import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";
import { PAGE_QUERY } from "../../frontend/sanity/queries/page";

const API_VERSION = "2026-03-23";
const DATASET = "development";
const HOME_PAGE_DRAFT_ID = "drafts.home";
const LOAN_ORIGINATOR_SLUG = "phoenix-loan-originator";
const CONTACT_SLUG = "contact";

type Block = { _key: string; _type: string; [key: string]: unknown };
type ProjectedBlock = Record<string, unknown> & { _key: string; _type: string };
type SourceDocument = {
  _id: string;
  _type: "homePage" | "page";
  _rev: string;
  _createdAt: string;
  _updatedAt: string;
  title?: string;
  description?: string;
  slug?: { _type?: string; current?: string };
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
  const loanOriginatorSource = pageSources.find(
    (source) => source.slug?.current?.replace(/^\//, "") === LOAN_ORIGINATOR_SLUG,
  );
  if (!loanOriginatorSource) {
    throw new Error("No /phoenix-loan-originator page with pageBuilder was found");
  }
  const loanOriginatorDraftId = draftId(loanOriginatorSource._id);
  const contactSource = pageSources.find(
    (source) => source.slug?.current?.replace(/^\//, "") === CONTACT_SLUG,
  );
  if (!contactSource) {
    throw new Error("No /contact page with pageBuilder was found");
  }
  const contactDraftId = draftId(contactSource._id);

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
    blocks: ProjectedBlock[];
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

  const draftClient = client.withConfig({ perspective: "drafts" });
  const queriedLoanOriginator = await draftClient.fetch<{
    _id: string;
    blocks: ProjectedBlock[];
  } | null>(PAGE_QUERY, { slug: LOAN_ORIGINATOR_SLUG });
  const expectedLoanOriginatorTypes = [
    "pageHeader",
    "storyFeature",
    "bigVideoFeature",
    "editorialChapter",
    "editorialChapter",
    "youtubeChannelFeature",
    "personCta",
  ];
  if (
    !queriedLoanOriginator ||
    !isDeepStrictEqual(
      queriedLoanOriginator.blocks.map((block: ProjectedBlock) => block._type),
      expectedLoanOriginatorTypes,
    )
  ) {
    throw new Error("The transitional page query returned an unexpected loan-originator order");
  }

  const pageHeader = queriedLoanOriginator.blocks[0];
  if (!Array.isArray(pageHeader.statistics) || pageHeader.statistics.length !== 3) {
    throw new Error("The transitional page query did not project Page Header statistics");
  }
  const storyFeature = queriedLoanOriginator.blocks[1];
  if (
    !Array.isArray(storyFeature.richText) ||
    !Array.isArray((storyFeature.keyDetails as { items?: unknown[] } | null)?.items) ||
    !(storyFeature.image as { asset?: { _id?: string } } | null)?.asset?._id
  ) {
    throw new Error("The transitional page query did not project Story Feature");
  }
  const bigVideoFeature = queriedLoanOriginator.blocks[2];
  if (typeof bigVideoFeature.youtubeUrl !== "string") {
    throw new Error("The transitional page query did not project Big Video Feature");
  }
  const firstEditorialChapter = queriedLoanOriginator.blocks[3];
  const secondEditorialChapter = queriedLoanOriginator.blocks[4];
  if (
    !Array.isArray(firstEditorialChapter.supportingContent) ||
    !Array.isArray(secondEditorialChapter.supportingContent) ||
    !(firstEditorialChapter.supportingContent as Array<{ _type?: string }>).some(
      (module) => module._type === "quoteCallout",
    ) ||
    !(secondEditorialChapter.supportingContent as Array<{ _type?: string }>).some(
      (module) => module._type === "proofPoints",
    ) ||
    !(secondEditorialChapter.supportingContent as Array<{ _type?: string }>).some(
      (module) => module._type === "impactStatement",
    )
  ) {
    throw new Error("The transitional page query did not project both Editorial Chapters");
  }
  const youtubeChannelFeature = queriedLoanOriginator.blocks[5];
  if (
    !Array.isArray(youtubeChannelFeature.facts) ||
    youtubeChannelFeature.facts.length !== 3 ||
    !(youtubeChannelFeature.channelImage as { asset?: { _id?: string } } | null)?.asset?._id ||
    !(youtubeChannelFeature.mobileChannelImage as { asset?: { _id?: string } } | null)?.asset?._id
  ) {
    throw new Error("The transitional page query did not project YouTube Channel Feature");
  }
  const personCta = queriedLoanOriginator.blocks[6];
  if (
    !Array.isArray(personCta.buttons) ||
    personCta.buttons.length !== 2 ||
    !Array.isArray((personCta.keyDetails as { items?: unknown[] } | null)?.items) ||
    !(personCta.personImage as { asset?: { _id?: string } } | null)?.asset?._id
  ) {
    throw new Error("The transitional page query did not project Person CTA");
  }

  const queriedContact = await draftClient.fetch<{
    _id: string;
    blocks: ProjectedBlock[];
  } | null>(PAGE_QUERY, { slug: CONTACT_SLUG });
  const expectedContactTypes = ["contactForm", "personContactCta", "locationMap"];
  if (
    !queriedContact ||
    !isDeepStrictEqual(
      queriedContact.blocks.map((block: ProjectedBlock) => block._type),
      expectedContactTypes,
    )
  ) {
    throw new Error("The transitional page query returned an unexpected contact-page order");
  }

  const contactForm = queriedContact.blocks[0];
  if (
    !Array.isArray(contactForm.officeHours) ||
    contactForm.officeHours.length !== 3 ||
    !isDeepStrictEqual(
      contactForm.officeHours.map((row: { _key?: string; _type?: string }) => ({
        _key: row._key,
        _type: row._type,
      })),
      [
        { _key: "monday-friday", _type: "officeHoursRow" },
        { _key: "saturday", _type: "officeHoursRow" },
        { _key: "sunday", _type: "officeHoursRow" },
      ],
    ) ||
    !(contactForm.nameField as { label?: string } | null)?.label ||
    !(contactForm.emailField as { label?: string } | null)?.label ||
    !(contactForm.phoneField as { label?: string } | null)?.label ||
    !(contactForm.messageField as { label?: string } | null)?.label ||
    typeof contactForm.unavailableMessage !== "string"
  ) {
    throw new Error("The transitional page query did not project Contact Form");
  }

  const personContactCta = queriedContact.blocks[1];
  if (
    !Array.isArray(personContactCta.contactMethods) ||
    !isDeepStrictEqual(
      personContactCta.contactMethods.map(
        (method: {
          _key?: string;
          _type?: string;
          href?: string;
          label?: string;
          type?: string;
        }) => ({
          _key: method._key,
          _type: method._type,
          href: method.href,
          label: method.label,
          type: method.type,
        }),
      ),
      [
        {
          _key: "phone",
          _type: "personContactMethod",
          href: "tel:4808008387",
          label: "480-800-8387",
          type: "phone",
        },
        {
          _key: "email",
          _type: "personContactMethod",
          href: "mailto:jimmy.vercellino@goluminate.com",
          label: "jimmy.vercellino@goluminate.com",
          type: "email",
        },
        {
          _key: "address",
          _type: "personContactMethod",
          href: "https://maps.app.goo.gl/1g17C8YKuTvx4WvV8",
          label: "3602 E Campbell Ave Ste 1,\nPhoenix, AZ 85018, USA",
          type: "address",
        },
      ],
    ) ||
    personContactCta.eyebrow !== "OR" ||
    personContactCta.title !== "Reach Jimmy directly" ||
    personContactCta.credentialLine !==
      "Phoenix Mortgage Lender Jimmy V · NMLS# 184169" ||
    !(personContactCta.personImage as { asset?: { _id?: string } } | null)?.asset?._id
  ) {
    throw new Error("The transitional page query did not project Person Contact CTA");
  }

  const locationMap = queriedContact.blocks[2];
  if (
    !(locationMap.image as { asset?: { _id?: string } } | null)?.asset?._id ||
    !(locationMap.address as { street?: string } | null)?.street ||
    typeof locationMap.mapEmbedUrl !== "string" ||
    typeof locationMap.directionsUrl !== "string"
  ) {
    throw new Error("The transitional page query did not project Location Map");
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
    loanOriginatorSource: loanOriginatorSource._id,
    loanOriginatorTarget: loanOriginatorDraftId,
    queriedLoanOriginator: queriedLoanOriginator._id,
    queriedLoanOriginatorBlocks: queriedLoanOriginator.blocks.map(
      ({ _key, _type }: ProjectedBlock) => ({ _key, _type }),
    ),
    contactSource: contactSource._id,
    contactTarget: contactDraftId,
    queriedContact: queriedContact._id,
    queriedContactBlocks: queriedContact.blocks.map(
      ({ _key, _type }: ProjectedBlock) => ({ _key, _type }),
    ),
    queriedPersonContactMethods: (
      personContactCta.contactMethods as Array<{
        _key: string;
        _type: string;
        type: string;
      }>
    ).map(({ _key, _type, type }) => ({ _key, _type, type })),
    verified: true,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
