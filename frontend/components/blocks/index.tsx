import { PAGE_QUERY_RESULT } from "@/sanity.types";
import { type LivePerspective } from "next-sanity/live";
import { createDataAttribute } from "next-sanity";
import HomeHero from "@/components/blocks/home-hero";
import LoanFeatureCards from "@/components/blocks/loan-feature-cards";
import VideoFeature from "@/components/blocks/video-feature";
import PhxEmbedSocialReviews from "@/components/blocks/phx-embed-social-reviews";
import { dataset, projectId } from "@/sanity/lib/env";

type Block = NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

const componentMap: Partial<{
  [K in Block["_type"]]: React.ComponentType<
    Extract<Block, { _type: K }>
  >;
}> = {
  homeHero: HomeHero,
  loanFeatureCards: LoanFeatureCards,
  videoFeature: VideoFeature,
  phxEmbedSocialReviews: PhxEmbedSocialReviews,
};

export default function Blocks({
  blocks,
  documentId,
  stega,
}: {
  blocks: Block[];
  documentId: string;
  perspective: LivePerspective;
  stega: boolean;
}) {
  return (
    <>
      {blocks?.map((block) => {
        const Component = componentMap[block._type] as
          | React.ComponentType<Block>
          | undefined;
        if (!Component) return null;

        const dataSanity = stega
          ? createDataAttribute({
              baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
              dataset,
              id: documentId,
              path: `blocks[_key=="${block._key}"]`,
              projectId,
              type: "page",
            }).toString()
          : undefined;

        return (
          <div data-sanity={dataSanity} key={block._key}>
            <Component {...block} />
          </div>
        );
      })}
    </>
  );
}
