"use client";

import PortableTextRenderer from "@/components/portable-text-renderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { XIcon } from "lucide-react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

type VideoFeatureProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "videoFeature" }
>;

function getYouTubeVideoId(url?: string | null) {
  const cleanUrl = stegaClean(url);

  if (!cleanUrl) return null;

  try {
    const parsedUrl = new URL(cleanUrl);
    const hostname = parsedUrl.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
      if (parsedUrl.pathname.startsWith("/embed/")) {
        return parsedUrl.pathname.split("/").filter(Boolean)[1] ?? null;
      }

      return parsedUrl.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

export default function VideoFeature({
  buttons,
  eyebrow,
  richText,
  thumbnailImage,
  title,
  useCreamBackground,
  youtubeUrl,
}: VideoFeatureProps) {
  const videoId = getYouTubeVideoId(youtubeUrl);
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : null;
  const fallbackThumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;
  const cleanTitle = stegaClean(title)?.trim();
  const cleanEyebrow = stegaClean(eyebrow)?.trim();
  const headingId = useId();
  const dialogTitleId = useId();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isLightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isLightboxOpen]);

  const closeLightbox = () => setIsLightboxOpen(false);
  const playLabel = cleanTitle ? `Play: ${cleanTitle}` : "Play video";
  const videoLabel = cleanTitle ? `${cleanTitle} video` : "Video";

  return (
    <section
      aria-labelledby={cleanTitle ? headingId : undefined}
      className={cn(
        "section-pad",
        stegaClean(useCreamBackground) ? "surface-cream" : "surface-white",
      )}
      id="video-feature"
    >
      <div className="container grid gap-split lg:grid-cols-[1.05fr_1fr] lg:items-center">
        <div className="flex flex-col gap-3.5">
          <div className="overflow-hidden rounded-[14px] bg-[#0c1329] shadow-media-frame">
            <button
              aria-label={playLabel}
              className="group relative block aspect-video w-full overflow-hidden rounded-[10px] bg-[#0c1329] text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              disabled={!embedUrl}
              onClick={() => {
                if (embedUrl) setIsLightboxOpen(true);
              }}
              ref={triggerRef}
              type="button"
            >
              {thumbnailImage?.asset?._id ? (
                <Image
                  alt={thumbnailImage.alt || videoLabel}
                  className="rounded-none object-cover"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  src={urlFor(thumbnailImage).width(1280).height(720).url()}
                />
              ) : fallbackThumbnailUrl ? (
                <span
                  aria-label={videoLabel}
                  className="absolute inset-0 bg-cover bg-center"
                  role="img"
                  style={{ backgroundImage: `url(${fallbackThumbnailUrl})` }}
                />
              ) : (
                <span className="absolute inset-0 bg-[#0c1329]" />
              )}
              <span className="absolute inset-0 bg-gradient-to-t from-[#080d1e]/50 to-[#080d1e]/5" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex size-[76px] items-center justify-center rounded-full bg-cyan-700 text-white shadow-[0_12px_32px_rgba(8,13,30,0.4)] transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105">
                  <span
                    aria-hidden="true"
                    className="ml-1 h-0 w-0 border-y-[13px] border-y-transparent border-l-[21px] border-l-current"
                  />
                </span>
              </span>
            </button>
          </div>
          <p className="pl-6 typo-meta-label text-muted-foreground">
            ▶ {cleanTitle ? title : "Video"} · 2 min
          </p>
        </div>

        <div className="flex max-w-2xl flex-col gap-5">
          {cleanEyebrow || cleanTitle ? (
            <div>
              {cleanEyebrow ? (
                <p className="mb-3.5 typo-eyebrow text-primary">
                  {eyebrow}
                </p>
              ) : null}
              {cleanTitle ? (
                <h2
                  className="text-balance typo-section-heading text-foreground"
                  id={headingId}
                >
                  {title}
                </h2>
              ) : null}
            </div>
          ) : null}
          {richText?.length ? (
            <div className="text-pretty typo-body text-muted-foreground [&_p]:my-0">
              <PortableTextRenderer value={richText} />
            </div>
          ) : null}
          {buttons?.length ? (
            <div className="mt-1 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {buttons.map((button, index) => {
                const href = stegaClean(button.href);
                if (!href) return null;

                const variant = stegaClean(button.variant);
                const secondary =
                  index > 0 || variant === "secondary" || variant === "outline";

                return (
                  <Button
                    asChild
                    key={button._key}
                    variant={secondary ? "outline" : "default"}
                  >
                    <Link
                      href={href}
                      rel={button.openInNewTab ? "noopener noreferrer" : undefined}
                      target={button.openInNewTab ? "_blank" : undefined}
                    >
                      {button.text || "Continue"}
                    </Link>
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {isLightboxOpen && embedUrl ? (
        <div
          aria-labelledby={dialogTitleId}
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#080d1e]/85 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeLightbox();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeLightbox();
          }}
          role="dialog"
        >
          <div className="relative w-full max-w-5xl rounded-[14px] border border-white/10 bg-[#0c1329] p-2 shadow-media-frame">
            <h3 className="sr-only" id={dialogTitleId}>
              {cleanTitle ? `${title} video` : "Video"}
            </h3>
            <button
              aria-label="Close video"
              className="absolute -top-12 right-0 flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/70"
              onClick={closeLightbox}
              ref={closeRef}
              type="button"
            >
              <XIcon aria-hidden="true" className="size-5" />
            </button>
            <div className="aspect-video overflow-hidden rounded-[10px] bg-black">
              <iframe
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="h-full w-full"
                src={`${embedUrl}?autoplay=1&rel=0`}
                title={cleanTitle || "Video"}
              />
            </div>
          </div>
        </div>
      ) : null}

      {!embedUrl ? (
        <div className="sr-only" role="status">
          Video unavailable
        </div>
      ) : null}
    </section>
  );
}
