import Blocks from "@/components/blocks";
import { fetchSanityPageBySlug, PAGES_SLUGS_QUERY } from "@/sanity/lib/fetch";
import { notFound } from "next/navigation";
import { generatePageMetadata } from "@/sanity/lib/metadata";
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { PAGE_QUERY_RESULT, PAGES_SLUGS_QUERY_RESULT } from "@/sanity.types";
import { PAGE_QUERY } from "@/sanity/queries/page";
import { draftMode } from "next/headers";
import { Suspense } from "react";
import { createDataAttribute, stegaClean } from "next-sanity";
import { dataset, projectId } from "@/sanity/lib/env";

function PageFallback() {
  return (
    <div aria-busy className="container py-16">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
    </div>
  );
}

export async function generateStaticParams() {
  const { data: pages } = (await sanityFetchStaticParams({
    query: PAGES_SLUGS_QUERY,
  })) as { data: PAGES_SLUGS_QUERY_RESULT };

  return pages.flatMap((page) => {
    const slug = page.slug?.current;
    // Home is served by (main)/page.tsx at /. /index redirects there in next.config.
    if (!slug || slug === "index") {
      return [];
    }

    return [{ slug: slug.split("/").filter(Boolean) }];
  });
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const [{ slug }, { perspective }] = await Promise.all([
    props.params,
    getDynamicFetchOptions(),
  ]);
  const slugPath = slug.join("/");
  const { data: page } = (await sanityFetchMetadata({
    query: PAGE_QUERY,
    params: { slug: slugPath },
    perspective,
  })) as { data: PAGE_QUERY_RESULT };

  if (!page) {
    notFound();
  }

  return generatePageMetadata({ page, slug: slugPath });
}

export default async function Page(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const { isEnabled: isDraftMode } = await draftMode();

  if (isDraftMode) {
    return (
      <Suspense fallback={<PageFallback />}>
        <DynamicPage params={props.params} />
      </Suspense>
    );
  }

  const { slug } = await props.params;
  return (
    <CachedPage slug={slug.join("/")} perspective="published" stega={false} />
  );
}

async function DynamicPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const [{ slug }, { perspective, stega }] = await Promise.all([
    params,
    getDynamicFetchOptions(),
  ]);

  return (
    <CachedPage slug={slug.join("/")} perspective={perspective} stega={stega} />
  );
}

async function CachedPage({
  slug,
  perspective,
  stega,
}: { slug: string } & DynamicFetchOptions) {
  const page = await fetchSanityPageBySlug({ slug, perspective, stega });

  if (!page) {
    notFound();
  }

  const blocks = page.blocks ?? [];
  const isRichTextOnlyPage =
    blocks.length > 0 && blocks.every((block) => block._type === "richTextBlock");
  const rootDataAttribute = stega
    ? (path: "description" | "title") =>
        createDataAttribute({
          baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
          dataset,
          id: page._id,
          path,
          projectId,
          type: "page",
        }).toString()
    : undefined;

  return (
    <>
      {isRichTextOnlyPage && stegaClean(page.title)?.trim() ? (
        <header className="border-b border-slate-200 bg-white py-14 md:py-20">
          <div className="container">
            <div className="max-w-4xl">
              <h1
                className="text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-slate-950"
                data-sanity={rootDataAttribute?.("title")}
              >
                {page.title}
              </h1>
              {stegaClean(page.description)?.trim() ? (
                <p
                  className="mt-5 max-w-3xl text-pretty text-lg leading-8 text-slate-600 md:text-xl"
                  data-sanity={rootDataAttribute?.("description")}
                >
                  {page.description}
                </p>
              ) : null}
            </div>
          </div>
        </header>
      ) : null}
      <Blocks
        blocks={blocks}
        documentId={page._id}
        perspective={perspective}
        stega={stega}
      />
    </>
  );
}
