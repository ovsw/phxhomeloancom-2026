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
  return <main aria-busy className="container min-h-[50vh] py-16" />;
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
