import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { POST_QUERY_RESULT } from "@/sanity.types";

type PostHeroProps = NonNullable<POST_QUERY_RESULT>;

export default function PostHero({
  title,
  excerpt,
  image,
}: PostHeroProps) {
  return (
    <>
      <header className="mb-8 max-w-3xl">
        {title ? (
          <h1 className="text-balance text-4xl font-semibold leading-tight tracking-normal md:text-5xl">
            {title}
          </h1>
        ) : null}
        {excerpt ? (
          <p className="mt-4 text-pretty text-lg leading-8 text-muted-foreground">
            {excerpt}
          </p>
        ) : null}
      </header>
      {image && image.asset?._id && (
        <div className="mb-12 overflow-hidden rounded-lg border border-border/80 shadow-sm">
          <Image
            src={urlFor(image).quality(100).url()}
            alt={image.alt || ""}
            placeholder={image?.asset?.metadata?.lqip ? "blur" : undefined}
            blurDataURL={image.asset?.metadata?.lqip || undefined}
            width={image.asset?.metadata?.dimensions?.width || 1200}
            height={image?.asset?.metadata?.dimensions?.height || 630}
            quality={100}
            className="h-auto w-full"
            sizes="(min-width: 1024px) 896px, calc(100vw - 2rem)"
          />
        </div>
      )}
    </>
  );
}
