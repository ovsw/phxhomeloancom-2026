import { pathToFileURL } from "node:url";
import { isDeepStrictEqual } from "node:util";
import type { Patch } from "@sanity/client";
import { getCliClient } from "sanity/cli";

const API_VERSION = "2026-09-03";
const DATASET = "development";
const PAGE_ID = "fhaLoan";
const EXPECTED_SLUG = "/phoenix-fha-loan";

type RichTextBlock = {
  _key: string;
  _type: "block";
  children: Array<{
    _key: string;
    _type: "span";
    marks: string[];
    text: string;
  }>;
  markDefs: unknown[];
  style: string;
};

type SanityDocument = {
  _id: string;
  _rev: string;
  _type: string;
  body?: unknown;
  [key: string]: unknown;
};

type PageDocument = SanityDocument & {
  blocks?: Array<Record<string, any>>;
  description?: string;
  meta?: Record<string, unknown>;
  slug?: { current?: string };
};

const FAQ_COPY: Record<string, string[]> = {
  "faq-fha-what-is-it": [
    "An FHA loan is a mortgage issued by an approved lender and insured by the Federal Housing Administration. You can use an FHA program to buy, refinance, or improve an eligible primary residence, subject to program and lender rules.",
    "FHA guidelines can allow a smaller down payment and more flexible credit review than some conventional loans. Mortgage insurance adds cost, so we compare both options before you choose.",
  ],
  "faq-fha-down-payment": [
    "FHA guidelines allow a 3.5% minimum down payment for borrowers with a credit score of 580 or higher. Scores from 500 to 579 require at least 10% down. Lenders can set higher requirements, and your full application and the property still need approval.",
    "Eligible gift funds may cover the required down payment when the donor, transfer, and gift letter meet FHA documentation rules. Some Maricopa County buyers may also qualify for assistance. Program terms and funding change, so ask us to confirm what is open before you make a plan.",
  ],
  "faq-fha-credit-score": [
    "FHA guidelines permit scores from 500. A score from 500 to 579 requires at least 10% down, while a score of 580 or higher permits 3.5% down. Lenders can require a higher score and must review your income, debts, funds, credit history, and property.",
    "A bankruptcy or foreclosure does not always rule out an FHA loan. Waiting periods and other requirements apply. We can review your current position and explain the next step.",
  ],
  "faq-fha-mip-vs-pmi": [
    "FHA loans have an upfront mortgage insurance premium and an annual premium that is usually divided across monthly payments. Annual MIP generally lasts 11 years when the original loan-to-value ratio is 90% or less, and for the loan term when it is above 90%.",
    "Conventional PMI follows different rules and may be cancellable. We can compare the insurance cost and duration for the loan options you qualify for.",
  ],
  "faq-fha-first-time-buyers": [
    "No. FHA loans are available to eligible first-time and repeat buyers. The home must meet FHA requirements and be your primary residence.",
    "Your loan still depends on credit, income, debts, funds, property review, and lender approval. We can compare FHA and conventional options for your situation.",
  ],
  "faq-fha-refinance-later": [
    "You can refinance an FHA loan if you qualify for a new loan. A refinance may change or remove mortgage insurance, but it also brings a new rate, payment, closing costs, and approval. We compare the savings with the cost and break-even period before recommending a change.",
    "You can also make extra principal payments. Check your loan documents and servicer instructions before you do.",
  ],
};

export const FAQ_IDS = Object.keys(FAQ_COPY);

function paragraph(key: string, text: string): RichTextBlock {
  return {
    _key: key,
    _type: "block",
    children: [
      {
        _key: `${key}-span`,
        _type: "span",
        marks: [],
        text,
      },
    ],
    markDefs: [],
    style: "normal",
  };
}

function requiredByKey(
  items: Array<Record<string, any>>,
  key: string,
): Record<string, any> {
  const item = items.find((candidate) => candidate._key === key);
  if (!item) throw new Error(`Missing array item ${key}`);
  return item;
}

function replaceParagraph(container: Record<string, any>, key: string, text: string) {
  const richText = container.richText ?? container.body;
  if (!Array.isArray(richText)) throw new Error(`Missing rich text for ${key}`);
  const index = richText.findIndex((item: RichTextBlock) => item._key === key);
  if (index === -1) throw new Error(`Missing paragraph ${key}`);
  richText[index] = paragraph(key, text);
}

export function validatePage(document: PageDocument | undefined) {
  if (!document) return `Document ${PAGE_ID} does not exist`;
  if (document._id !== PAGE_ID || document._type !== "page") {
    return `Expected the published page document with ID ${PAGE_ID}`;
  }
  if (!document._rev) return "The current page revision is required";
  if (document.slug?.current !== EXPECTED_SLUG) {
    return `slug.current must be ${EXPECTED_SLUG}`;
  }
  if (!Array.isArray(document.blocks)) return "The page blocks are required";
  return undefined;
}

export function buildPageMutation(document: PageDocument) {
  const validationError = validatePage(document);
  if (validationError) throw new Error(validationError);

  const blocks = structuredClone(document.blocks!);
  const header = requiredByKey(blocks, "page-header-fha");
  header.description =
    "FHA loans can offer a smaller down payment and more flexible credit guidelines than some conventional loans. We can help you compare the full cost, including mortgage insurance, for a Phoenix-area home.";
  const downStat = requiredByKey(header.statistics, "stat-down");
  downStat.description =
    "FHA minimum for scores of 580 or higher. Lender requirements also apply.";
  const scoreStat = requiredByKey(header.statistics, "stat-score");
  scoreStat.value = "500 FHA minimum";
  scoreStat.description =
    "Lenders can require a higher score and full qualification.";
  const sellerStat = requiredByKey(header.statistics, "stat-seller");
  sellerStat.value = "May be allowed";
  sellerStat.description =
    "Seller contributions depend on the costs and current FHA rules.";

  const basics = requiredByKey(blocks, "chapter-what-it-is");
  replaceParagraph(
    basics,
    "what-p1",
    "An FHA loan is issued by an approved lender and insured by the Federal Housing Administration. FHA sets program rules, while the lender reviews your full application and the property.",
  );
  replaceParagraph(
    basics,
    "what-p2",
    "FHA guidelines can allow a smaller down payment and more flexible credit review than some conventional loans. FHA mortgage insurance adds an upfront cost and an annual premium, so we compare the full payment and long-term cost before you choose.",
  );
  requiredByKey(basics.supportingContent, "impact-down-payment").description =
    "This example uses the 3.5% FHA minimum for a borrower who meets the credit and underwriting requirements. The final amount depends on your price, loan, and approval.";

  const comparison = requiredByKey(blocks, "table-fha-vs-conventional");
  comparison.intro =
    "FHA and conventional loans fit different borrower profiles. Compare the down payment, credit rules, mortgage insurance, seller contributions, rate, and total cost for the options you qualify for.";
  const rows = comparison.table.rows;
  requiredByKey(rows, "row-down").cells = [
    "Minimum down payment",
    "3.5% at 580 or higher; 10% at 500 to 579 under FHA guidelines. Lender rules apply.",
    "Some programs allow 3%; eligibility and lender rules vary.",
  ];
  requiredByKey(rows, "row-credit").cells = [
    "Credit score floor",
    "FHA permits 500; lenders can require higher.",
    "Varies by program and lender.",
  ];
  requiredByKey(rows, "row-mi").cells = [
    "Mortgage insurance",
    "Upfront and annual MIP. Annual MIP generally lasts 11 years or the loan term, based on original loan-to-value ratio.",
    "PMI may apply below 20% down; cancellation follows the loan terms and federal rules.",
  ];
  requiredByKey(rows, "row-seller").cells = [
    "Seller-paid closing costs",
    "May be allowed for eligible costs, subject to FHA limits.",
    "Limits vary by down payment, occupancy, and program.",
  ];
  requiredByKey(rows, "row-best").cells = [
    "May fit",
    "Buyers with limited savings or lower credit scores.",
    "Buyers who qualify for its pricing and mortgage-insurance terms.",
  ];

  const advantages = requiredByKey(blocks, "benefit-cards-advantages");
  advantages.intro =
    "FHA guidelines can reduce the cash and credit barriers to buying a home. Your lender still reviews the full application and property.";
  const advantageCards = advantages.cards;
  replaceParagraph(
    requiredByKey(advantageCards, "adv-down"),
    "adv-down-p",
    "FHA guidelines allow a 3.5% minimum down payment with a credit score of 580 or higher. Scores from 500 to 579 require at least 10% down. Lenders can set higher requirements.",
  );
  const giftCard = requiredByKey(advantageCards, "adv-gift");
  giftCard.title = "Eligible gift funds can help";
  replaceParagraph(
    giftCard,
    "adv-gift-p",
    "Gift funds may cover the required down payment when the donor, transfer, and gift letter meet FHA rules. A gift cannot require repayment.",
  );
  const creditCard = requiredByKey(advantageCards, "adv-credit");
  creditCard.title = "FHA permits scores from 500";
  replaceParagraph(
    creditCard,
    "adv-credit-p",
    "A score from 500 to 579 requires at least 10% down under FHA guidelines. A score of 580 or higher permits 3.5% down. Your lender can require a higher score and must approve the full loan.",
  );
  replaceParagraph(
    requiredByKey(advantageCards, "adv-seller"),
    "adv-seller-p",
    "FHA rules may allow seller contributions toward eligible costs. The amount depends on the contract, appraisal, and current FHA limits.",
  );
  const prepayCard = requiredByKey(advantageCards, "adv-prepay");
  prepayCard.title = "You can pay principal faster";
  replaceParagraph(
    prepayCard,
    "adv-prepay-p",
    "Extra principal payments can build equity faster. A later refinance depends on your finances, home value, rates, costs, and approval.",
  );

  const requirements = requiredByKey(blocks, "loan-requirements");
  requirements.intro =
    "FHA guidelines can allow a lower down payment and lower credit scores than some conventional loans. Approval still depends on your income, debts, funds, credit history, the property, and lender requirements.";
  const creditChapter = requiredByKey(requirements.chapters, "credit");
  creditChapter.title = "A lower program floor, with full lender review";
  replaceParagraph(
    creditChapter,
    "credit-p1",
    "FHA guidelines permit scores from 500, but lenders can set higher minimums. Your score affects the minimum down payment, and the lender reviews your full credit history. Bankruptcy and foreclosure waiting periods may apply.",
  );
  creditChapter.note =
    "FHA down-payment tiers apply only when the borrower and property meet all other requirements.";
  const moneyChapter = requiredByKey(requirements.chapters, "money-up-front");
  moneyChapter.title = "A 3.5% minimum may be possible";
  replaceParagraph(
    moneyChapter,
    "money-p1",
    "FHA guidelines allow 3.5% down with a score of 580 or higher. Eligible gift funds may cover the required down payment when they meet FHA source and documentation rules. Seller contributions may help with eligible closing costs.",
  );
  const giftStat = requiredByKey(
    requiredByKey(moneyChapter.evidence, "money-stats").stats,
    "stat-gift",
  );
  giftStat.label = "Eligible gift funds allowed";
  giftStat.value = "Allowed";
  const insuranceChapter = requiredByKey(
    requirements.chapters,
    "mortgage-insurance",
  );
  replaceParagraph(
    insuranceChapter,
    "mip-p1",
    "FHA loans have an upfront mortgage insurance premium and an annual premium that is usually divided across monthly payments. Annual MIP generally lasts 11 years when the original loan-to-value ratio is 90% or less, and for the loan term when it is above 90%. A refinance creates a new loan and depends on approval, rates, costs, and terms.",
  );
  requiredByKey(
    requiredByKey(insuranceChapter.evidence, "mip-tiers").tiers,
    "tier-duration",
  ).value = "11 years or loan term";
  insuranceChapter.note =
    "We can compare FHA's full cost with conventional options for your profile.";
  requirements.closingNote =
    "Some Phoenix-area buyers may qualify for down-payment assistance. Funding and terms change, so ask us to confirm what is open.";

  const assistance = requiredByKey(blocks, "chapter-home-in-five");
  assistance.title = "Could Home in Five help with upfront costs?";
  replaceParagraph(
    assistance,
    "hi5-p1",
    "Home in Five may offer down-payment and closing-cost assistance with an eligible first mortgage for a home in Maricopa County. Both first-time and repeat buyers may be eligible. Program funding and loan options can change.",
  );
  replaceParagraph(
    assistance,
    "hi5-p2",
    "The assistance amount, income limit, credit and debt-to-income rules, education requirement, interest rate, second-lien payment and forgiveness terms, and funding availability depend on the product and date. Ask our team to confirm which options are open and whether you qualify.",
  );
  const assistanceImpact = requiredByKey(
    assistance.supportingContent,
    "impact-hi5",
  );
  assistanceImpact.statement = "Program-specific";
  assistanceImpact.label = "assistance and second-lien terms";
  assistanceImpact.description =
    "There is no single Home in Five percentage, income cap, rate, payment, or forgiveness schedule. We will check current funding and explain the selected option before you decide.";

  const advisor = requiredByKey(blocks, "advisor-cta-why-fha");
  advisor.title = "Your Phoenix FHA loan team";
  replaceParagraph(
    advisor,
    "why-p1",
    "An FHA loan can be useful when a conventional loan does not fit your savings or credit profile. Our team will compare the down payment, mortgage insurance, rate, payment, and long-term cost with you.",
  );
  replaceParagraph(
    advisor,
    "why-p2",
    "Call, send a message, or visit our Phoenix office. We will explain the requirements and help you decide whether FHA fits your plans.",
  );

  const description =
    "Learn how FHA loans work for Phoenix-area homebuyers, including down payments, credit, mortgage insurance, refinancing, and current assistance options.";

  return {
    id: document._id,
    ifRevisionID: document._rev,
    set: {
      blocks,
      description,
      meta: { ...document.meta, description },
    },
  };
}

export function buildFaqMutation(document: SanityDocument) {
  const copy = FAQ_COPY[document._id];
  if (!copy) throw new Error(`Unexpected FAQ document ${document._id}`);
  if (document._type !== "faq") throw new Error(`${document._id} is not an FAQ`);
  if (!document._rev) throw new Error(`${document._id} has no revision`);
  return {
    id: document._id,
    ifRevisionID: document._rev,
    set: {
      body: copy.map((text, index) => paragraph(`${document._id}-p${index}`, text)),
    },
  };
}

function isPageApplied(document: PageDocument, mutation: ReturnType<typeof buildPageMutation>) {
  return Object.entries(mutation.set).every(([field, value]) =>
    isDeepStrictEqual(document[field], value),
  );
}

async function main() {
  const apply = process.argv.includes("--apply");
  const datasetFlag = process.argv.find((arg) => arg.startsWith("--dataset="));
  const dataset = datasetFlag?.slice("--dataset=".length) ?? DATASET;
  if (dataset !== DATASET) {
    throw new Error(`Refusing to run outside the ${DATASET} dataset`);
  }

  const client = getCliClient({
    apiVersion: API_VERSION,
    dataset,
    perspective: "raw",
  });
  const publishedClient = client.withConfig({ perspective: "published" });
  if (client.config().dataset !== DATASET) {
    throw new Error(`Refusing to run outside the ${DATASET} dataset`);
  }

  const ids = [PAGE_ID, ...FAQ_IDS];
  const documents = await client.fetch<SanityDocument[]>(
    `*[_id in $ids || _id in $draftIds]`,
    { ids, draftIds: ids.map((id) => `drafts.${id}`) },
  );
  const drafts = documents.filter((document: SanityDocument) =>
    document._id.startsWith("drafts."),
  );
  if (drafts.length) {
    throw new Error(
      `Refusing to overwrite existing drafts: ${drafts.map((draft: SanityDocument) => draft._id).join(", ")}`,
    );
  }
  const byId = new Map<string, SanityDocument>(
    documents.map((document: SanityDocument) => [document._id, document]),
  );
  const page = byId.get(PAGE_ID) as PageDocument | undefined;
  const pageMutation = buildPageMutation(page as PageDocument);
  const faqMutations = FAQ_IDS.map((id) => {
    const document = byId.get(id);
    if (!document) throw new Error(`Missing FAQ document ${id}`);
    return buildFaqMutation(document);
  });
  const alreadyApplied =
    isPageApplied(page as PageDocument, pageMutation) &&
    faqMutations.every((mutation) =>
      isDeepStrictEqual(byId.get(mutation.id)?.body, mutation.set.body),
    );

  console.log(
    JSON.stringify(
      {
        dataset,
        mode: apply ? "apply" : "dry-run",
        pageId: PAGE_ID,
        faqIds: FAQ_IDS,
        alreadyApplied,
      },
      null,
      2,
    ),
  );
  if (!apply) return;

  if (!alreadyApplied) {
    const transaction = client.transaction();
    transaction.patch(pageMutation.id, (patch: Patch) =>
      patch.ifRevisionId(pageMutation.ifRevisionID).set(pageMutation.set),
    );
    for (const mutation of faqMutations) {
      transaction.patch(mutation.id, (patch: Patch) =>
        patch.ifRevisionId(mutation.ifRevisionID).set(mutation.set),
      );
    }
    await transaction.commit({ visibility: "sync" });
  }

  const [rawAfter, publishedAfter] = await Promise.all([
    client.fetch<SanityDocument[]>(`*[_id in $ids]`, { ids }),
    publishedClient.fetch<SanityDocument[]>(`*[_id in $ids]`, { ids }),
  ]);
  for (const [perspective, after] of [
    ["raw", rawAfter],
    ["published", publishedAfter],
  ] as const) {
    const afterById = new Map<string, SanityDocument>(
      after.map((document: SanityDocument) => [document._id, document]),
    );
    const pageAfter = afterById.get(PAGE_ID) as PageDocument | undefined;
    if (!pageAfter || !isPageApplied(pageAfter, pageMutation)) {
      throw new Error(`Verification failed for the FHA page in ${perspective}`);
    }
    for (const mutation of faqMutations) {
      if (!isDeepStrictEqual(afterById.get(mutation.id)?.body, mutation.set.body)) {
        throw new Error(`Verification failed for ${mutation.id} in ${perspective}`);
      }
    }
  }

  console.log(
    JSON.stringify(
      {
        applied: alreadyApplied ? 0 : ids.length,
        pageId: PAGE_ID,
        faqCount: FAQ_IDS.length,
        perspectives: ["published", "raw"],
        targetDraftCount: 0,
        verified: true,
      },
      null,
      2,
    ),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
