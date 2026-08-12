import { CategoryArchiveRoute } from "../_components/category-archive-route";
import { getCategoryStaticParams } from "@/lib/blog-index";
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

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const { data } = await sanityFetchStaticParams({
    query: CATEGORY_STATIC_PARAMS_QUERY,
  });
  return getCategoryStaticParams(data as unknown as CategoryStaticParam[]);
}

export async function generateMetadata({ params }: Props) {
  const [{ slug }, options] = await Promise.all([params, getDynamicFetchOptions()]);
  const category = await fetchCategory({ ...options, slug, stega: false });
  if (!category) notFound();
  return generateCategoryMetadata({ category, page: 1 });
}

function CategoryFallback() {
  return (
    <div aria-busy aria-label="Category content loading" className="min-h-[60vh]">
      <header className="bg-[var(--phx-navy-900)] px-4 py-16 md:px-10">
        <div className="container space-y-4">
          <div className="h-4 w-36 animate-pulse rounded bg-white/20" />
          <div className="h-10 max-w-lg animate-pulse rounded bg-white/15" />
          <div className="h-5 max-w-xl animate-pulse rounded bg-white/10" />
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

export default function CategoryPage({ params }: Props) {
  return (
    <Suspense fallback={<CategoryFallback />}>
      <CategoryPageContent params={params} />
    </Suspense>
  );
}

async function CategoryPageContent({ params }: Props) {
  const [{ slug }, { isEnabled }] = await Promise.all([params, draftMode()]);
  if (isEnabled) return <DynamicCategoryPage slug={slug} />;
  return <CategoryArchiveRoute currentPage={1} perspective="published" slug={slug} stega={false} />;
}

async function DynamicCategoryPage({ slug }: { slug: string }) {
  const options = await getDynamicFetchOptions();
  return <CategoryArchiveRoute currentPage={1} slug={slug} {...options} />;
}
