import { cn } from "@/lib/utils";
import { urlFor } from "@/sanity/lib/image";
import type { PAGE_QUERY_RESULT } from "@/sanity.types";
import { stegaClean } from "next-sanity";
import Image from "next/image";
import Link from "next/link";

type LatestArticlesProps = Extract<
  NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number],
  { _type: "latestArticles" }
>;

type Article = NonNullable<LatestArticlesProps["articles"]>[number];
type ArticleImage = LatestArticlesProps["fallbackImage"];

function getArticleHref(slug?: string | null) {
  const cleanSlug = stegaClean(slug)?.replace(/^\/+|\/+$/g, "");
  return cleanSlug ? `/blog/${cleanSlug}` : "#";
}

function formatPublishedDate(publishedAt?: string | null) {
  const cleanPublishedAt = stegaClean(publishedAt);
  if (!cleanPublishedAt) return null;

  const date = new Date(cleanPublishedAt);
  if (Number.isNaN(date.getTime())) return null;

  return date
    .toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
      year: "numeric",
    })
    .toUpperCase();
}

function ArticleCard({
  article,
  fallbackImage,
}: Readonly<{ article: Article; fallbackImage?: ArticleImage }>) {
  const image = article.image?.asset?._id ? article.image : fallbackImage;
  const categoryLabel = article.categories?.[0]?.title;
  const publishedDate = formatPublishedDate(article.publishedAt);
  const title = article.title || "Untitled article";

  return (
    <Link
      aria-label={`Read post: ${stegaClean(title)}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 no-underline shadow-sm transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[0_22px_48px_rgba(19,28,59,0.14)]"
      href={getArticleHref(article.slug)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        {image?.asset?._id ? (
          <Image
            alt={image.alt || stegaClean(title)}
            blurDataURL={image.asset.metadata?.lqip || undefined}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            fill
            placeholder={image.asset.metadata?.lqip ? "blur" : undefined}
            sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
            src={urlFor(image).width(720).height(450).url()}
          />
        ) : null}
        {categoryLabel ? (
          <div className="absolute left-3.5 top-3.5 rounded-full bg-slate-950/80 px-2.5 py-1.5 text-[0.65625rem] font-semibold uppercase leading-none tracking-[0.12em] text-white backdrop-blur-sm">
            {categoryLabel}
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 px-6 py-6 md:px-7 md:py-[1.875rem]">
        {publishedDate ? (
          <time
            className="text-xs font-semibold uppercase leading-none tracking-[0.08em] text-slate-500"
            dateTime={stegaClean(article.publishedAt) || undefined}
          >
            {publishedDate}
          </time>
        ) : null}
        <h3 className="text-balance text-[1.3125rem] font-semibold leading-[1.25] tracking-normal text-slate-950">
          {title}
        </h3>
        {article.description ? (
          <p className="line-clamp-3 flex-1 text-[0.90625rem] leading-[1.6] text-slate-600">
            {article.description}
          </p>
        ) : null}
        <span className="mt-1 text-sm font-semibold leading-none text-cyan-800 transition-colors group-hover:text-cyan-600">
          Read post <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </Link>
  );
}

function SectionLink({ button }: Readonly<{ button?: NonNullable<LatestArticlesProps["buttons"]>[number] }>) {
  const href = stegaClean(button?.href);
  if (!href || !button?.text) return null;

  return (
    <Link
      className="text-[0.9375rem] font-semibold leading-none text-cyan-800 transition-colors hover:text-cyan-600"
      href={href}
      rel={stegaClean(button.openInNewTab) ? "noopener noreferrer" : undefined}
      target={stegaClean(button.openInNewTab) ? "_blank" : undefined}
    >
      {button.text} <span aria-hidden="true">&rarr;</span>
    </Link>
  );
}

export default function LatestArticles({
  articles,
  buttons,
  description,
  eyebrow,
  fallbackImage,
  title,
  useCreamBackground,
}: LatestArticlesProps) {
  if (!articles?.length) return null;

  return (
    <section
      className={cn(
        "scroll-mt-24 py-20 md:py-24 lg:py-[6.875rem]",
        stegaClean(useCreamBackground) ? "bg-[#f7f4ed]" : "bg-white",
      )}
      id="educational-content"
    >
      <div className="container">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-8 md:mb-[3.25rem] lg:gap-12">
          <div className="max-w-3xl">
            {eyebrow ? (
              <p className="mb-3.5 text-xs font-semibold uppercase leading-none tracking-[0.22em] text-cyan-800">
                {eyebrow}
              </p>
            ) : null}
            {title ? (
              <h2 className="text-balance text-[2.125rem] font-semibold leading-[1.12] tracking-normal text-slate-950 md:text-[2.75rem]">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-4 max-w-2xl text-[1.03125rem] leading-relaxed text-slate-600">
                {description}
              </p>
            ) : null}
          </div>
          <SectionLink button={buttons?.[0]} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 6).map((article) => (
            <ArticleCard article={article} fallbackImage={fallbackImage} key={article._id} />
          ))}
        </div>
      </div>
    </section>
  );
}
