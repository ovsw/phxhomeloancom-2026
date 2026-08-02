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
  return <main aria-busy className="container min-h-[50vh] py-16" />;
}

export default async function BlogPage() {
  const { isEnabled } = await draftMode();
  if (isEnabled) {
    return (
      <Suspense fallback={<BlogFallback />}>
        <DynamicBlogPage />
      </Suspense>
    );
  }
  return <BlogIndexRoute currentPage={1} perspective="published" stega={false} />;
}

async function DynamicBlogPage() {
  const options = await getDynamicFetchOptions();
  return <BlogIndexRoute currentPage={1} {...options} />;
}
