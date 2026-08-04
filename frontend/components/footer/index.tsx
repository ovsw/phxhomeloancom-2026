import { createFooterModel } from "./model";
import { SiteFooter } from "./site-footer";
import { createDataAttribute } from "next-sanity";
import { fetchSanityFooter, fetchSanitySettings, getCurrentYear } from "@/sanity/lib/fetch";
import { getDynamicFetchOptions, type DynamicFetchOptions } from "@/sanity/lib/live";
import { dataset, projectId } from "@/sanity/lib/env";

export { SiteFooter } from "./site-footer";

export function FooterFallback() {
  return (
    <footer
      aria-busy
      aria-label="Site footer loading"
      className="min-h-[42rem] bg-[#0c1329] px-4 py-16 md:px-10 md:py-[5.5rem] lg:min-h-[34rem]"
    >
      <div className="mx-auto grid max-w-[75rem] gap-12 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div className="h-40 animate-pulse rounded-lg bg-white/10" key={item} />
        ))}
      </div>
    </footer>
  );
}

function FooterUnavailable() {
  return (
    <footer className="bg-[#0c1329] px-4 py-16 text-center text-sm text-white/75" data-footer-state="unavailable">
      Footer information is temporarily unavailable.
    </footer>
  );
}

export async function DynamicFooter() {
  const { perspective, stega } = await getDynamicFetchOptions();
  return <CachedFooter perspective={perspective} stega={stega} />;
}

export async function CachedFooter({ perspective, stega }: DynamicFetchOptions) {
  const [rawFooter, settings, year] = await Promise.all([
    fetchSanityFooter({ perspective, stega }),
    fetchSanitySettings({ perspective, stega }),
    getCurrentYear(),
  ]);
  const model = createFooterModel(rawFooter, settings, year);
  const dataAttribute = stega
    ? (path: string) =>
        createDataAttribute({
          baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
          dataset,
          id: "footer",
          path,
          projectId,
          type: "footer",
        }).toString()
    : undefined;

  return model ? <SiteFooter dataAttribute={dataAttribute} model={model} /> : <FooterUnavailable />;
}
