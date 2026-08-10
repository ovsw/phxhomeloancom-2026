import Blocks from "@/components/blocks";
import { fetchHomePage } from "@/sanity/lib/fetch";
import { generatePageMetadata } from "@/sanity/lib/metadata";
import MissingSanityPage from "@/components/ui/missing-sanity-page";
import {
  getDynamicFetchOptions,
  sanityFetchMetadata,
  type DynamicFetchOptions,
} from "@/sanity/lib/live";
import { HOME_PAGE_QUERY_RESULT } from "@/sanity.types";
import { HOME_PAGE_QUERY } from "@/sanity/queries/home-page";
import { draftMode } from "next/headers";
import { Suspense } from "react";

function PageFallback() {
  return (
    <div aria-busy aria-label="Page content loading" className="min-h-[60vh]">
      <section className="bg-[var(--phx-navy-900)] px-4 py-16 md:px-10">
        <div className="container space-y-4">
          <div className="h-4 w-28 animate-pulse rounded bg-white/20" />
          <div className="h-10 max-w-xl animate-pulse rounded bg-white/15" />
          <div className="h-5 max-w-md animate-pulse rounded bg-white/10" />
        </div>
      </section>
      <section className="container grid gap-6 py-12 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div className="h-36 animate-pulse rounded-control bg-muted" key={item} />
        ))}
      </section>
    </div>
  );
}

export async function generateMetadata() {
  const { perspective } = await getDynamicFetchOptions();
  const { data: page } = (await sanityFetchMetadata({
    query: HOME_PAGE_QUERY,
    perspective,
  })) as { data: HOME_PAGE_QUERY_RESULT };

  return generatePageMetadata({ page, path: "/" });
}

export default function IndexPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <IndexPageContent />
    </Suspense>
  );
}

async function IndexPageContent() {
  const { isEnabled: isDraftMode } = await draftMode();

  if (isDraftMode) {
    return <DynamicIndexPage />;
  }

  return <CachedIndexPage perspective="published" stega={false} />;
}

async function DynamicIndexPage() {
  const { perspective, stega } = await getDynamicFetchOptions();
  return <CachedIndexPage perspective={perspective} stega={stega} />;
}

async function CachedIndexPage({ perspective, stega }: DynamicFetchOptions) {
  const page = await fetchHomePage({ perspective, stega });

  if (!page) {
    return MissingSanityPage({ document: "homePage", documentId: "homePage" });
  }

  return (
    <Blocks
      blocks={page?.blocks ?? []}
      documentId={page._id}
      documentType="homePage"
      perspective={perspective}
      stega={stega}
    />
  );
}
