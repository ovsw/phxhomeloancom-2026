import { YouTubeEmbed } from "@next/third-parties/google";
import { PortableText, type PortableTextProps } from "@portabletext/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";

function getYouTubeVideoId(value: unknown) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }
    if (hostname === "youtube.com" || hostname === "youtube-nocookie.com") {
      return url.pathname.startsWith("/embed/")
        ? (url.pathname.split("/").filter(Boolean)[1] ?? null)
        : url.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

function getSafeIframeSrc(value: unknown) {
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

function getButtonVariant(value: unknown) {
  const variant = stegaClean(value);
  return variant === "secondary" || variant === "outline" || variant === "link"
    ? variant
    : "default";
}

export const richTextContentComponents: PortableTextProps["components"] = {
  block: {
    normal: ({ children }) => <p className="mb-4">{children}</p>,
    h2: ({ children }) => <h2 className="mb-4 mt-12 first:mt-0">{children}</h2>,
    h3: ({ children }) => <h3 className="mb-4 mt-10 first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="mb-4 mt-8 first:mt-0">{children}</h4>,
    h5: ({ children }) => <h5 className="mb-4 mt-8 first:mt-0">{children}</h5>,
    h6: ({ children }) => (
      <h6 className="mb-4 mt-8 text-base font-semibold first:mt-0">{children}</h6>
    ),
    inline: ({ children }) => <span>{children}</span>,
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-4 list-outside list-disc space-y-2 pl-6">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-4 list-outside list-decimal space-y-2 pl-6">{children}</ol>
    ),
  },
  marks: {
    customLink: ({ children, value }) =>
      value?.href ? (
        <Link
          className="text-cyan-800 underline underline-offset-2"
          href={value.href}
          rel={value.openInNewTab ? "noopener noreferrer" : undefined}
          target={value.openInNewTab ? "_blank" : undefined}
        >
          {children}
        </Link>
      ) : (
        <span>{children}</span>
      ),
    buttonLink: ({ children, value }) =>
      value?.href ? (
        <Link
          className={cn(
            buttonVariants({ variant: getButtonVariant(value.variant), size: "lg" }),
            "my-2 no-underline",
          )}
          href={value.href}
          rel={value.openInNewTab ? "noopener noreferrer" : undefined}
          target={value.openInNewTab ? "_blank" : undefined}
        >
          {children}
        </Link>
      ) : (
        <span>{children}</span>
      ),
  },
  types: {
    image: ({ value }) => {
      const asset = value.resolvedAsset;
      if (!asset?.url) return null;

      return (
        <figure className="my-8">
          <Image
            alt={value.alt || ""}
            blurDataURL={asset.metadata?.lqip || undefined}
            className="h-auto w-full rounded-2xl"
            height={asset.metadata?.dimensions?.height ?? 900}
            placeholder={asset.metadata?.lqip ? "blur" : undefined}
            quality={100}
            sizes="(min-width: 1024px) 896px, calc(100vw - 2rem)"
            src={asset.url}
            width={asset.metadata?.dimensions?.width ?? 1600}
          />
          {value.caption ? (
            <figcaption className="mt-2 text-center text-sm text-slate-500">
              {value.caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    table: ({ value }) => {
      const rows = Array.isArray(value.rows)
        ? value.rows.filter(
            (row: { cells?: unknown[] }) =>
              Array.isArray(row.cells) && row.cells.length > 0,
          )
        : [];
      const [headerRow, ...bodyRows] = rows;
      if (!headerRow) return null;

      return (
        <div className="my-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            {value.title ? <caption className="sr-only">{value.title}</caption> : null}
            <thead>
              <tr>
                {headerRow.cells.map((cell: string, index: number) => (
                  <th
                    className="border border-slate-300 bg-slate-100 px-4 py-3 font-semibold text-slate-950"
                    key={`${headerRow._key ?? "header"}-${index}`}
                    scope="col"
                  >
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map(
                (row: { _key?: string; cells: string[] }, rowIndex: number) => (
                  <tr key={row._key ?? `row-${rowIndex}`}>
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        className="border border-slate-300 px-4 py-3 align-top"
                        key={`${row._key ?? rowIndex}-${cellIndex}`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      );
    },
    youtube: ({ value }) => {
      const videoId = getYouTubeVideoId(value.url);
      if (!videoId) {
        return value.url ? (
          <p className="mb-4">
            <a
              className="text-cyan-800 underline underline-offset-2"
              href={value.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              Watch video
            </a>
          </p>
        ) : null;
      }

      return (
        <div className="my-8 aspect-video max-w-[45rem] overflow-hidden rounded-xl">
          <YouTubeEmbed videoid={videoId} params="rel=0" />
        </div>
      );
    },
    iframeEmbed: ({ value }) => {
      const src = getSafeIframeSrc(value.src);
      if (!src) return null;

      return (
        <div className="my-8 overflow-hidden rounded-xl bg-slate-100">
          <iframe
            allowFullScreen
            className="w-full"
            height={value.height ?? 450}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
            src={src}
            title={value.title || "Embedded content"}
          />
        </div>
      );
    },
  },
};

export default function RichTextContent({
  className,
  dataSanity,
  value,
}: Readonly<{
  className?: string;
  dataSanity?: string;
  value: PortableTextProps["value"];
}>) {
  return (
    <div
      className={cn(
        "text-[1.0625rem] leading-8 text-slate-700 [&_h2]:mt-12 [&_h3]:mt-10 [&_h4]:mt-8 [&_img]:my-8 [&_p]:text-pretty",
        className,
      )}
      data-sanity={dataSanity}
    >
      <PortableText components={richTextContentComponents} value={value} />
    </div>
  );
}
