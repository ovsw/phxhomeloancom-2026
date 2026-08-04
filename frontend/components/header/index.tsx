import { createHeaderBrandModel, createHeaderNavigationModel } from "./model";
import { Header } from "./site-header";
import { fetchSanityNavigation, fetchSanitySettings } from "@/sanity/lib/fetch";
import { getDynamicFetchOptions, type DynamicFetchOptions } from "@/sanity/lib/live";
export { Header } from "./site-header";

export function HeaderFallback() {
  return (
    <header aria-busy className="sticky top-0 z-[60] h-(--header-height) w-full border-b border-border/80 bg-background/95" />
  );
}

export async function DynamicHeader() {
  const { perspective, stega } = await getDynamicFetchOptions();
  return <CachedHeader perspective={perspective} stega={stega} />;
}

export async function CachedHeader({ perspective, stega }: DynamicFetchOptions) {
  const [settings, rawNavigation] = await Promise.all([
    fetchSanitySettings({ perspective, stega }),
    fetchSanityNavigation({ perspective, stega }),
  ]);
  const model = {
    brand: createHeaderBrandModel(settings),
    navigation: createHeaderNavigationModel(rawNavigation),
  };

  return <Header model={model} />;
}
