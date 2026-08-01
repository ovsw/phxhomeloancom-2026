import PostCard from "@/components/ui/post-card";
import { contentPath } from "@/lib/routes";
import { fetchSanityPosts } from "@/sanity/lib/fetch";
import {
  getDynamicFetchOptions,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { draftMode } from "next/headers";
import Link from "next/link";
import { stegaClean } from "next-sanity";
import { Suspense } from "react";

export const metadata = {
  title: "Blog",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/`,
  },
};

function BlogFallback() {
  return (
    <div aria-busy className="container py-16">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
    </div>
  );
}

export default async function BlogPage() {
  const { isEnabled: isDraftMode } = await draftMode();
  if (isDraftMode) {
    return (
      <Suspense fallback={<BlogFallback />}>
        <DynamicBlogPage />
      </Suspense>
    );
  }

  return <BlogContent perspective="published" stega={false} />;
}

async function DynamicBlogPage() {
  const options = await getDynamicFetchOptions();
  return <BlogContent {...options} />;
}

async function BlogContent({ perspective, stega }: DynamicFetchOptions) {
  const posts = await fetchSanityPosts({ perspective, stega });

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container">
        <header className="mb-10 max-w-3xl">
          <h1 className="text-balance text-4xl font-semibold leading-tight text-slate-950 md:text-6xl">
            Blog
          </h1>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const slug = stegaClean(post.slug?.current);
            if (!slug) return null;
            return (
              <Link
                className="no-underline"
                href={contentPath(slug)}
                key={slug}
              >
                <PostCard {...post} />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
