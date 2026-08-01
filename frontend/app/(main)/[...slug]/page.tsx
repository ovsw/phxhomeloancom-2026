import Blocks from "@/components/blocks";
import PostHero from "@/components/blocks/post-hero";
import RichTextContent from "@/components/rich-text-content";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import {
  fetchSanityPageBySlug,
  fetchSanityPostBySlug,
  PAGES_SLUGS_QUERY,
  POSTS_SLUGS_QUERY,
} from "@/sanity/lib/fetch";
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  sanityFetchStaticParams,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { generatePageMetadata } from "@/sanity/lib/metadata";
import { dataset, projectId } from "@/sanity/lib/env";
import { PAGE_QUERY } from "@/sanity/queries/page";
import { POST_QUERY } from "@/sanity/queries/post";
import type {
  PAGE_QUERY_RESULT,
  PAGES_SLUGS_QUERY_RESULT,
  POST_QUERY_RESULT,
  POSTS_SLUGS_QUERY_RESULT,
} from "@/sanity.types";
import type { PortableTextProps } from "@portabletext/react";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { createDataAttribute, stegaClean } from "next-sanity";
import { Suspense } from "react";

type BreadcrumbLink = {
  label: string;
  href: string;
};

function PageFallback() {
  return (
    <div aria-busy className="container py-16">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
    </div>
  );
}

function resolveRootContent(
  page: PAGE_QUERY_RESULT,
  post: POST_QUERY_RESULT,
  slug: string,
) {
  if (page && post) {
    throw new Error(`Root route collision for /${slug}/`);
  }
  return page || post || null;
}

export async function generateStaticParams() {
  const [{ data: pages }, { data: posts }] = await Promise.all([
    sanityFetchStaticParams({ query: PAGES_SLUGS_QUERY }) as Promise<{
      data: PAGES_SLUGS_QUERY_RESULT;
    }>,
    sanityFetchStaticParams({ query: POSTS_SLUGS_QUERY }) as Promise<{
      data: POSTS_SLUGS_QUERY_RESULT;
    }>,
  ]);

  const slugs = [
    ...pages.map((page) => page.slug?.current),
    ...posts.map((post) => post.slug?.current),
  ];

  return slugs.flatMap((value) => {
    const slug = value?.replace(/^\/+|\/+$/g, "");
    if (!slug || slug === "index") return [];
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
  const [{ data: page }, { data: post }] = await Promise.all([
    sanityFetchMetadata({
      query: PAGE_QUERY,
      params: { slug: slugPath },
      perspective,
    }) as Promise<{ data: PAGE_QUERY_RESULT }>,
    sanityFetchMetadata({
      query: POST_QUERY,
      params: { slug: slugPath },
      perspective,
    }) as Promise<{ data: POST_QUERY_RESULT }>,
  ]);
  const content = resolveRootContent(page, post, slugPath);
  if (!content) notFound();

  return generatePageMetadata({ page: content, slug: slugPath });
}

export default async function RootContentPage(props: {
  params: Promise<{ slug: string[] }>;
}) {
  const { isEnabled: isDraftMode } = await draftMode();

  if (isDraftMode) {
    return (
      <Suspense fallback={<PageFallback />}>
        <DynamicRootContent params={props.params} />
      </Suspense>
    );
  }

  const { slug } = await props.params;
  return (
    <CachedRootContent
      slug={slug.join("/")}
      perspective="published"
      stega={false}
    />
  );
}

async function DynamicRootContent({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const [{ slug }, { perspective, stega }] = await Promise.all([
    params,
    getDynamicFetchOptions(),
  ]);

  return (
    <CachedRootContent
      slug={slug.join("/")}
      perspective={perspective}
      stega={stega}
    />
  );
}

async function CachedRootContent({
  slug,
  perspective,
  stega,
}: { slug: string } & DynamicFetchOptions) {
  const [page, post] = await Promise.all([
    fetchSanityPageBySlug({ slug, perspective, stega }),
    fetchSanityPostBySlug({ slug, perspective, stega }),
  ]);
  const content = resolveRootContent(page, post, slug);
  if (!content) notFound();

  return content._type === "post" ? (
    <PostContent post={content} stega={stega} />
  ) : (
    <PageContent page={content} perspective={perspective} stega={stega} />
  );
}

function PageContent({
  page,
  perspective,
  stega,
}: {
  page: NonNullable<PAGE_QUERY_RESULT>;
  perspective: DynamicFetchOptions["perspective"];
  stega: boolean;
}) {
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

function PostContent({
  post,
  stega,
}: {
  post: NonNullable<POST_QUERY_RESULT>;
  stega: boolean;
}) {
  const links: BreadcrumbLink[] = [
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog/" },
    { label: post.title as string, href: "#" },
  ];
  const bodyDataAttribute = stega
    ? createDataAttribute({
        baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
        dataset,
        id: post._id,
        path: "body",
        projectId,
        type: "post",
      }).toString()
    : undefined;

  return (
    <section>
      <div className="container py-16 xl:py-20">
        <article className="mx-auto max-w-3xl">
          <Breadcrumbs links={links} />
          <PostHero {...post} />
          {post.body?.length ? (
            <RichTextContent
              dataSanity={bodyDataAttribute}
              value={post.body as PortableTextProps["value"]}
            />
          ) : null}
        </article>
      </div>
    </section>
  );
}
