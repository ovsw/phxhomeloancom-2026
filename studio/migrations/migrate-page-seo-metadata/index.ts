import { at, defineMigration, patch, set, unset } from "sanity/migrate";
import type { SanityDocument } from "sanity";

type LegacyPageSeoDocument = SanityDocument & {
  meta?: unknown;
  seoDescription?: unknown;
  seoTitle?: unknown;
};

export type PageSeoMigrationPlan = {
  description?: string;
  issues: string[];
  title?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function planPageSeoMigration(
  document: LegacyPageSeoDocument,
): PageSeoMigrationPlan {
  const issues: string[] = [];

  if (document.meta !== undefined && !isObject(document.meta)) {
    issues.push(`${document._id}: meta must be an object`);
  }
  if (
    document.seoTitle !== undefined &&
    typeof document.seoTitle !== "string"
  ) {
    issues.push(`${document._id}: seoTitle must be a string`);
  }
  if (
    document.seoDescription !== undefined &&
    typeof document.seoDescription !== "string"
  ) {
    issues.push(`${document._id}: seoDescription must be a string`);
  }

  return {
    issues,
    ...(typeof document.seoTitle === "string"
      ? { title: document.seoTitle }
      : {}),
    ...(typeof document.seoDescription === "string"
      ? { description: document.seoDescription }
      : {}),
  };
}

export default defineMigration({
  title: "Move legacy page SEO fields into canonical metadata",
  documentTypes: ["page"],
  filter:
    '!(_id in path("versions.**")) && (defined(seoTitle) || defined(seoDescription))',
  async *migrate(documents) {
    const plans: Array<{
      document: LegacyPageSeoDocument;
      plan: PageSeoMigrationPlan;
    }> = [];

    for await (const document of documents()) {
      const legacyPage = document as LegacyPageSeoDocument;
      plans.push({
        document: legacyPage,
        plan: planPageSeoMigration(legacyPage),
      });
    }

    const issues = plans.flatMap(({ plan }) => plan.issues);
    if (issues.length > 0) {
      throw new Error(
        `Aborting before writes: ${issues.length} page SEO issue(s)\n${issues.join("\n")}`,
      );
    }

    console.info(
      JSON.stringify({
        documents: plans.length,
        descriptions: plans.filter(({ plan }) => plan.description !== undefined)
          .length,
        titles: plans.filter(({ plan }) => plan.title !== undefined).length,
      }),
    );

    for (const { document, plan } of plans) {
      const operations = [
        ...(plan.title !== undefined
          ? [at("meta.title", set(plan.title))]
          : []),
        ...(plan.description !== undefined
          ? [at("meta.description", set(plan.description))]
          : []),
        at("seoTitle", unset()),
        at("seoDescription", unset()),
      ];

      yield patch(document._id, operations, { ifRevision: document._rev });
    }
  },
});
