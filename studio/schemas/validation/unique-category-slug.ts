import type { ValidationContext } from "sanity";

type SlugValue = { current?: string };

const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function uniqueCategorySlug(
  value: SlugValue | undefined,
  context: ValidationContext,
) {
  const current = value?.current;
  if (!current) return true;

  if (/^\d+$/.test(current)) {
    return "Category slugs cannot contain only numbers";
  }

  if (!CATEGORY_SLUG_PATTERN.test(current)) {
    return "Use lowercase letters, numbers, and single hyphens only";
  }

  const documentId = context.document?._id;
  if (!documentId) return true;

  const publishedId = documentId.replace(/^drafts\./, "");
  const draftId = `drafts.${publishedId}`;
  const client = context
    .getClient({ apiVersion: "2026-03-23" })
    .withConfig({ perspective: "raw" });
  const collision = await client.fetch<{
    _id: string;
    slug: string;
  } | null>(
    `*[
      _type == "category" &&
      !(_id in [$publishedId, $draftId]) &&
      slug.current == $slug
    ][0]{_id, "slug": slug.current}`,
    { draftId, publishedId, slug: current },
  );

  return collision
    ? `This slug is already used by another category: ${collision.slug}`
    : true;
}
