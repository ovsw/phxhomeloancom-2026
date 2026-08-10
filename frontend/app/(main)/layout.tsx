import {
  CachedHeader,
  DynamicHeader,
  HeaderFallback,
} from "@/components/header";
import {
  CachedFooter,
  DynamicFooter,
  FooterFallback,
} from "@/components/footer";
import { DisableDraftMode } from "@/components/disable-draft-mode";
import { VisualEditing } from "next-sanity/visual-editing";
import { draftMode } from "next/headers";
import { SanityLive } from "@/sanity/lib/live";
import { Suspense } from "react";
import { revalidateTags } from "@/app/actions/revalidate";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<MainLayoutFallback>{children}</MainLayoutFallback>}>
      <MainLayoutContent>{children}</MainLayoutContent>
    </Suspense>
  );
}

function MainLayoutFallback({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderFallback />
      <main>{children}</main>
      <FooterFallback />
    </>
  );
}

async function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { isEnabled: isDraftMode } = await draftMode();

  return (
    <>
      {isDraftMode ? (
        <Suspense fallback={<HeaderFallback />}>
          <DynamicHeader />
        </Suspense>
      ) : (
        <CachedHeader perspective="published" stega={false} />
      )}
      <main>{children}</main>
      <SanityLive action={revalidateTags} includeDrafts={isDraftMode} />
      {isDraftMode && (
        <>
          <DisableDraftMode />
          <VisualEditing />
        </>
      )}
      {isDraftMode ? (
        <Suspense fallback={<FooterFallback />}>
          <DynamicFooter />
        </Suspense>
      ) : (
        <CachedFooter perspective="published" stega={false} />
      )}
    </>
  );
}
