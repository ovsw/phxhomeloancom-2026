import { createDataAttribute, stegaClean } from "next-sanity";
import Blocks from "@/components/blocks";
import FaqPageJsonLd from "@/components/faq-json-ld";
import QuickNav from "@/components/quick-nav";
import { createQuickNavModel } from "@/lib/quick-nav";
import PostHero from "@/components/blocks/post-hero";
import { createPostBodyModel } from "@/components/post-sidebar/model";
import { PostSidebar } from "@/components/post-sidebar/post-sidebar";
import RichTextContent from "@/components/rich-text-content";
import { dataset, projectId } from "@/sanity/lib/env";
import type { DynamicFetchOptions } from "@/sanity/lib/live";
import type { PAGE_QUERY_RESULT, POST_QUERY_RESULT } from "@/sanity.types";

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
  const quickNav = createQuickNavModel(blocks, page.showQuickNav !== false);
  const heroBlocks = blocks.slice(0, quickNav.heroCount);
  const contentBlocks = blocks.slice(quickNav.heroCount);
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
      <FaqPageJsonLd blocks={blocks} />
      {isRichTextOnlyPage && stegaClean(page.title)?.trim() ? (
        <header className="surface-white border-b border-border py-14 md:py-20">
          <div className="container">
            <div className="max-w-4xl">
              <h1
                className="text-balance text-[clamp(2.5rem,5vw,4rem)] font-semibold leading-[1.08] tracking-[-0.02em] text-foreground"
                data-sanity={rootDataAttribute?.("title")}
              >
                {page.title}
              </h1>
              {stegaClean(page.description)?.trim() ? (
                <p
                  className="mt-5 max-w-3xl text-pretty text-lg leading-8 text-muted-foreground md:text-xl"
                  data-sanity={rootDataAttribute?.("description")}
                >
                  {page.description}
                </p>
              ) : null}
            </div>
          </div>
        </header>
      ) : null}
      {heroBlocks.length > 0 ? (
        <Blocks
          blocks={heroBlocks}
          documentId={page._id}
          perspective={perspective}
          stega={stega}
        />
      ) : null}
      {quickNav.showQuickNav ? <QuickNav items={quickNav.items} /> : null}
      <Blocks
        anchorIds={quickNav.anchorIdByKey}
        blocks={contentBlocks}
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
  const body = post.body ?? [];
  const bodyModel = createPostBodyModel(body);
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
    <section className="bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-20 md:px-6 md:py-24 lg:px-0">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <article className="min-w-0">
            <PostHero {...post} />
            {body.length ? (
              <RichTextContent
                dataSanity={bodyDataAttribute}
                getHeadingId={bodyModel.getHeadingId}
                value={body}
              />
            ) : null}
          </article>
          <PostSidebar bodyModel={bodyModel} />
        </div>
      </div>
    </section>
  );
}

export function RootContentView({
  content,
  perspective,
  stega,
}: {
  content: NonNullable<PAGE_QUERY_RESULT | POST_QUERY_RESULT>;
  perspective: DynamicFetchOptions["perspective"];
  stega: boolean;
}) {
  return content._type === "post" ? (
    <PostContent post={content} stega={stega} />
  ) : (
    <PageContent page={content} perspective={perspective} stega={stega} />
  );
}
