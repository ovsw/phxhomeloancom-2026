import { BlogIndexRoute } from "../_components/blog-index-route";
import { parseBlogPageSegment } from "@/lib/blog-index";
import { fetchBlogIndex } from "@/sanity/lib/fetch";
import { getDynamicFetchOptions } from "@/sanity/lib/live";
import { generateBlogIndexMetadata } from "@/sanity/lib/metadata";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type Props = { params: Promise<{ page: string }> };

export async function generateMetadata({ params }: Props) {
  const [{ page: segment }, options] = await Promise.all([
    params,
    getDynamicFetchOptions(),
  ]);
  const page = parseBlogPageSegment(segment);
  if (!page) notFound();
  const blogIndex = await fetchBlogIndex({ ...options, stega: false });
  return generateBlogIndexMetadata({ blogIndex, page });
}

function BlogFallback() {
  return (
    <div aria-busy aria-label="Blog content loading" className="min-h-[60vh]">
      <header className="bg-[var(--phx-navy-900)] px-4 py-16 md:px-10">
        <div className="container space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-white/20" />
          <div className="h-10 max-w-lg animate-pulse rounded bg-white/15" />
          <div className="h-5 max-w-xl animate-pulse rounded bg-white/10" />
        </div>
      </header>
      <section className="surface-cream px-4 py-12 md:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div className="h-64 animate-pulse rounded-control bg-muted" key={item} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default function PaginatedBlogPage({ params }: Props) {
  return (
    <Suspense fallback={<BlogFallback />}>
      <PaginatedBlogPageContent params={params} />
    </Suspense>
  );
}

async function PaginatedBlogPageContent({ params }: Props) {
  const [{ page: segment }, { isEnabled }] = await Promise.all([params, draftMode()]);
  const page = parseBlogPageSegment(segment);
  if (!page) notFound();
  if (isEnabled) {
    return <DynamicPaginatedBlogPage page={page} />;
  }
  return <BlogIndexRoute currentPage={page} perspective="published" stega={false} />;
}

async function DynamicPaginatedBlogPage({ page }: { page: number }) {
  const options = await getDynamicFetchOptions();
  return <BlogIndexRoute currentPage={page} {...options} />;
}
