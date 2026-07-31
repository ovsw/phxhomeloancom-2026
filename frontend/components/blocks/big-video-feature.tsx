"use client";

import { urlFor } from "@/sanity/lib/image";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { XIcon } from "lucide-react";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";

type BigVideoFeatureProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "bigVideoFeature" }
> & {
  dataAttribute?: (path: string) => string | undefined;
};

type BigVideoLightboxProps = {
  closeRef: RefObject<HTMLButtonElement | null>;
  embedUrl: string;
  iframeRef: RefObject<HTMLIFrameElement | null>;
  onClose: () => void;
  title?: string;
  titleId: string;
};

const youtubeHosts = [
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
] as const;

function getYouTubeVideoId(value?: string | null) {
  const cleanUrl = stegaClean(value);
  if (!cleanUrl) return null;

  try {
    const url = new URL(cleanUrl);
    const hostname = url.hostname.replace(/^www\./, "");

    if (!youtubeHosts.includes(hostname as (typeof youtubeHosts)[number])) {
      return null;
    }

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/").filter(Boolean)[1] ?? null;
    }

    return url.searchParams.get("v");
  } catch {
    return null;
  }
}

function BigVideoLightbox({
  closeRef,
  embedUrl,
  iframeRef,
  onClose,
  title,
  titleId,
}: Readonly<BigVideoLightboxProps>) {
  return (
    <div
      aria-labelledby={titleId}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080d1e]/85 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
      role="dialog"
    >
      <button
        aria-label="Return focus to video"
        className="sr-only"
        onFocus={() => iframeRef.current?.focus()}
        type="button"
      />
      <div className="relative w-full max-w-5xl rounded-[14px] border border-white/10 bg-[#0c1329] p-2 shadow-2xl">
        <h3 className="sr-only" id={titleId}>
          {title ? `${title} video` : "Featured video"}
        </h3>
        <button
          aria-label="Close video"
          className="absolute -top-12 right-0 flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
          onClick={onClose}
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
            ref={iframeRef}
            src={embedUrl}
            title={title || "Featured video"}
          />
        </div>
      </div>
      <button
        aria-label="Return focus to close button"
        className="sr-only"
        onFocus={() => closeRef.current?.focus()}
        type="button"
      />
    </div>
  );
}

export default function BigVideoFeature({
  dataAttribute,
  description,
  eyebrow,
  thumbnailImage,
  title,
  youtubeUrl,
}: BigVideoFeatureProps) {
  const displayDescription = stegaClean(description)?.trim();
  const displayEyebrow = stegaClean(eyebrow)?.trim();
  const displayTitle = stegaClean(title)?.trim();
  const videoId = getYouTubeVideoId(youtubeUrl);
  const embedUrl = videoId
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
    : null;
  const fallbackThumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : null;
  const headingId = useId();
  const dialogTitleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <section
      aria-labelledby={displayTitle ? headingId : undefined}
      className="relative overflow-hidden bg-[#131c3b] py-[4.5rem] md:py-[5.5rem]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(760px_340px_at_78%_-20%,rgba(180,85,45,0.22),transparent_66%)]"
      />
      <div className="container relative grid justify-items-center text-center">
        {displayEyebrow ? (
          <p
            className="text-xs font-semibold uppercase tracking-[0.26em] text-[#feb77d]/90"
            data-sanity={dataAttribute?.("eyebrow")}
          >
            {eyebrow}
          </p>
        ) : null}
        {displayTitle ? (
          <h2
            className="mt-3.5 max-w-[47.5rem] text-balance text-3xl font-semibold leading-[1.12] tracking-[-0.015em] text-white md:text-[2.875rem]"
            data-sanity={dataAttribute?.("title")}
            id={headingId}
          >
            {title}
          </h2>
        ) : null}
        {displayDescription ? (
          <p
            className="mb-[1.875rem] mt-5 max-w-[38.75rem] text-pretty text-[1.0625rem] leading-[1.7] text-white/70"
            data-sanity={dataAttribute?.("description")}
          >
            {description}
          </p>
        ) : (
          <div className="h-[1.875rem]" />
        )}

        <button
          aria-label={displayTitle ? `Play: ${displayTitle}` : "Play video"}
          className="group relative block aspect-video w-full max-w-[57.5rem] cursor-pointer overflow-hidden rounded-[18px] bg-[#0c1329] shadow-[0_30px_70px_-24px_rgba(0,0,0,0.7)] transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#feb77d] focus-visible:ring-offset-4 focus-visible:ring-offset-[#131c3b] disabled:cursor-not-allowed"
          data-sanity={dataAttribute?.("youtubeUrl")}
          disabled={!embedUrl}
          onClick={() => setIsOpen(Boolean(embedUrl))}
          ref={triggerRef}
          type="button"
        >
          {thumbnailImage?.asset?._id ? (
            <Image
              alt={thumbnailImage.alt || displayTitle || "Featured video"}
              className="object-cover"
              data-sanity={dataAttribute?.("thumbnailImage")}
              fill
              sizes="(min-width: 1024px) 920px, 100vw"
              src={urlFor(thumbnailImage).width(1280).height(720).url()}
            />
          ) : fallbackThumbnailUrl ? (
            <span
              aria-label={displayTitle || "Featured video"}
              className="absolute inset-0 bg-cover bg-center"
              role="img"
              style={{ backgroundImage: `url(${fallbackThumbnailUrl})` }}
            />
          ) : null}
          <span className="absolute inset-0 bg-gradient-to-b from-[#0c1329]/5 to-[#0c1329]/40" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-[#b4552d]/95 text-white shadow-[0_12px_40px_rgba(180,85,45,0.6)] transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105 md:size-[5.5rem]">
              <span
                aria-hidden="true"
                className="ml-1 h-0 w-0 border-y-[11px] border-y-transparent border-l-[18px] border-l-current md:border-y-[15px] md:border-l-[24px]"
              />
            </span>
          </span>
        </button>
      </div>

      {isOpen && embedUrl ? (
        <BigVideoLightbox
          closeRef={closeRef}
          embedUrl={embedUrl}
          iframeRef={iframeRef}
          onClose={() => setIsOpen(false)}
          title={displayTitle}
          titleId={dialogTitleId}
        />
      ) : null}
    </section>
  );
}
