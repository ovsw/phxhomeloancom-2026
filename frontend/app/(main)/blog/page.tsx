import { BlogIndexRoute } from "./_components/blog-index-route";
import { fetchBlogIndex } from "@/sanity/lib/fetch";
import { generateBlogIndexMetadata } from "@/sanity/lib/metadata";
import { getDynamicFetchOptions } from "@/sanity/lib/live";
import { draftMode } from "next/headers";
import { Suspense } from "react";

export async function generateMetadata() {
  const options = await getDynamicFetchOptions();
  const blogIndex = await fetchBlogIndex({ ...options, stega: false });
  return generateBlogIndexMetadata({ blogIndex, page: 1 });
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

export default function BlogPage() {
  return (
    <Suspense fallback={<BlogFallback />}>
      <BlogPageContent />
    </Suspense>
  );
}

async function BlogPageContent() {
  const { isEnabled } = await draftMode();
  if (isEnabled) {
    return <DynamicBlogPage />;
  }
  return <BlogIndexRoute currentPage={1} perspective="published" stega={false} />;
}

async function DynamicBlogPage() {
  const options = await getDynamicFetchOptions();
  return <BlogIndexRoute currentPage={1} {...options} />;
}
