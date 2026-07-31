import { isDeepStrictEqual } from "node:util";
import { getCliClient } from "sanity/cli";
import { PAGE_QUERY } from "../../frontend/sanity/queries/page";

const API_VERSION = "2026-03-23";
const DATASET = "development";
const HOME_PAGE_DRAFT_ID = "drafts.home";
const LOAN_ORIGINATOR_SLUG = "phoenix-loan-originator";
const CONTACT_SLUG = "contact";
const OUR_TEAM_SLUG = "our-team";

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
  const ourTeamSource = pageSources.find(
    (source) => source.slug?.current?.replace(/^\//, "") === OUR_TEAM_SLUG,
  );
  if (!ourTeamSource) {
    throw new Error("No /our-team page with pageBuilder was found");
  }
  if (baseId(ourTeamSource._id) !== "kRTGqiPtwZ1pXIol9E5iGF") {
    throw new Error(`Unexpected /our-team source ${ourTeamSource._id}`);
  }
  const ourTeamDraftId = draftId(ourTeamSource._id);

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

  const queriedOurTeam = await draftClient.fetch<{
    _id: string;
    blocks: ProjectedBlock[];
  } | null>(PAGE_QUERY, { slug: OUR_TEAM_SLUG });
  const expectedOurTeamBlocks = [
    { _key: "phx-team-page-header", _type: "pageHeader" },
    { _key: "phx-team-members", _type: "teamMembers" },
  ];
  if (
    !queriedOurTeam ||
    !isDeepStrictEqual(
      queriedOurTeam.blocks.map(({ _key, _type }: ProjectedBlock) => ({
        _key,
        _type,
      })),
      expectedOurTeamBlocks,
    )
  ) {
    throw new Error("The transitional page query returned an unexpected our-team order");
  }

  const teamPageHeader = queriedOurTeam.blocks[0];
  if (
    !isDeepStrictEqual(
      {
        description: teamPageHeader.description,
        eyebrow: teamPageHeader.eyebrow,
        statistics: teamPageHeader.statistics ?? null,
        title: teamPageHeader.title,
      },
      {
        description:
          "A tight-knit group of specialists — origination, certification, and processing — who stay with you from the first conversation all the way to closing day.",
        eyebrow: "Our Team",
        statistics: null,
        title: "The people behind every approval.",
      },
    )
  ) {
    throw new Error("The transitional page query did not project the team Page Header");
  }

  const teamMembers = queriedOurTeam.blocks[1];
  if (
    teamMembers.eyebrow !== "Meet the Team" ||
    teamMembers.title !== "The Highly Motivated Vercellino Team" ||
    !Array.isArray(teamMembers.richText) ||
    (teamMembers.richText[0] as { children?: Array<{ text?: string }> } | undefined)
      ?.children?.[0]?.text !==
      "Three specialists, one shared standard: make your home loan experience second to none. Here's who you'll be working with." ||
    !Array.isArray(teamMembers.members) ||
    !isDeepStrictEqual(
      teamMembers.members.map(
        (member: {
          _key?: string;
          _type?: string;
          _ref?: string;
          document?: {
            _id?: string;
            _type?: string;
            bio?: unknown[];
            email?: string;
            image?: { asset?: { _id?: string } };
            name?: string;
            nmlsId?: string | null;
            phone?: string;
            role?: string;
            sortOrder?: number;
          };
        }) => ({
          _key: member._key,
          _type: member._type,
          _ref: member._ref,
          bioBlocks: member.document?.bio?.length,
          documentId: member.document?._id,
          documentType: member.document?._type,
          email: member.document?.email,
          imageId: member.document?.image?.asset?._id,
          name: member.document?.name,
          nmlsId: member.document?.nmlsId ?? null,
          phone: member.document?.phone,
          role: member.document?.role,
          sortOrder: member.document?.sortOrder,
        }),
      ),
      [
        {
          _key: "legacy-person-54a1360b-c70a-45d6-be93-11e29cbd7b07",
          _type: "reference",
          _ref: "kRTGqiPtwZ1pXIol9E5hNx",
          bioBlocks: 1,
          documentId: "kRTGqiPtwZ1pXIol9E5hNx",
          documentType: "teamMember",
          email: "jimmy.vercellino@goluminate.com",
          imageId: "image-599b4fbb51446a203e50e6bc23a81fe4e0ab18b8-4024x6048-jpg",
          name: "Jimmy Vercellino",
          nmlsId: "184169",
          phone: "602-908-5849",
          role: "Producing Branch Manager",
          sortOrder: 1,
        },
        {
          _key: "legacy-person-e7b8a61f-8583-4c55-a6af-e86bfafac21b",
          _type: "reference",
          _ref: "wyBoXRpm5psD7comxC0xU7",
          bioBlocks: 1,
          documentId: "wyBoXRpm5psD7comxC0xU7",
          documentType: "teamMember",
          email: "Brian.Coakley@goluminate.com",
          imageId: "image-e783e7f1e352989da5421c5380aa2086bb66ce64-1122x1402-png",
          name: "Brian Coakley",
          nmlsId: "1018745",
          phone: "602-908-5849",
          role: "Loan Originator · Prequalification",
          sortOrder: 2,
        },
        {
          _key: "legacy-person-261d9ba9-7a8b-4053-8d65-d8783dfa5978",
          _type: "reference",
          _ref: "4t9n08s0qRtngWyh9gAwrt",
          bioBlocks: 1,
          documentId: "4t9n08s0qRtngWyh9gAwrt",
          documentType: "teamMember",
          email: "jack.roche@goluminate.com",
          imageId: "image-9e4bc27d67d0d7c560881f3bab6af1531d5ccc09-2848x4287-jpg",
          name: "Jack Roche",
          nmlsId: null,
          phone: "602-354-9523",
          role: "Premier Processor",
          sortOrder: 3,
        },
      ],
    )
  ) {
    throw new Error("The transitional page query did not project Team Members");
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
    ourTeamSource: ourTeamSource._id,
    ourTeamTarget: ourTeamDraftId,
    queriedOurTeam: queriedOurTeam._id,
    queriedOurTeamBlocks: queriedOurTeam.blocks.map(
      ({ _key, _type }: ProjectedBlock) => ({ _key, _type }),
    ),
    queriedOurTeamMembers: (teamMembers.members as Array<{
      _key: string;
      _type: string;
      _ref: string;
      document?: { _id?: string };
    }>).map(({ _key, _type, _ref, document }) => ({
      _key,
      _type,
      _ref,
      documentId: document?._id,
    })),
    verified: true,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
