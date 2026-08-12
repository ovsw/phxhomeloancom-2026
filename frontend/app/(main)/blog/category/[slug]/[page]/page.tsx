import { CategoryArchiveRoute } from "../../_components/category-archive-route";
import {
  getCategoryPaginatedStaticParams,
  parseBlogPageSegment,
} from "@/lib/blog-index";
import { fetchCategory } from "@/sanity/lib/fetch";
import {
  getDynamicFetchOptions,
  sanityFetchStaticParams,
} from "@/sanity/lib/live";
import { generateCategoryMetadata } from "@/sanity/lib/metadata";
import {
  CATEGORY_STATIC_PARAMS_QUERY,
  type CategoryStaticParam,
} from "@/sanity/queries/category";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = { params: Promise<{ page: string; slug: string }> };

export async function generateStaticParams() {
  const { data } = await sanityFetchStaticParams({
    query: CATEGORY_STATIC_PARAMS_QUERY,
  });
  return getCategoryPaginatedStaticParams(data as unknown as CategoryStaticParam[]);
}

export async function generateMetadata({ params }: Props) {
  const [{ page: segment, slug }, options] = await Promise.all([
    params,
    getDynamicFetchOptions(),
  ]);
  const page = parseBlogPageSegment(segment);
  if (!page) notFound();
  const category = await fetchCategory({ ...options, slug, stega: false });
  if (!category) notFound();
  return generateCategoryMetadata({ category, page });
}

function CategoryFallback() {
  return (
    <div aria-busy aria-label="Category content loading" className="min-h-[60vh]">
      <header className="bg-[var(--phx-navy-900)] px-4 py-16 md:px-10">
        <div className="container space-y-4">
          <div className="h-4 w-36 animate-pulse rounded bg-white/20" />
          <div className="h-10 max-w-lg animate-pulse rounded bg-white/15" />
        </div>
      </header>
      <section className="surface-cream px-4 py-12 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[0, 1, 2].map((item) => <div className="h-64 animate-pulse rounded-control bg-muted" key={item} />)}
        </div>
      </section>
    </div>
  );
}

export default function PaginatedCategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<CategoryFallback />}>
      <PaginatedCategoryPageContent params={params} />
    </Suspense>
  );
}

async function PaginatedCategoryPageContent({ params }: Props) {
  const [{ page: segment, slug }, { isEnabled }] = await Promise.all([params, draftMode()]);
  const page = parseBlogPageSegment(segment);
  if (!page) notFound();
  if (isEnabled) return <DynamicPaginatedCategoryPage page={page} slug={slug} />;
  return <CategoryArchiveRoute currentPage={page} perspective="published" slug={slug} stega={false} />;
}

async function DynamicPaginatedCategoryPage({
  page,
  slug,
}: {
  page: number;
  slug: string;
}) {
  const options = await getDynamicFetchOptions();
  return <CategoryArchiveRoute currentPage={page} slug={slug} {...options} />;
}
