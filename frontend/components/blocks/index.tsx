import { PAGE_QUERY_RESULT } from "@/sanity.types";
import { type LivePerspective } from "next-sanity/live";
import { createDataAttribute } from "next-sanity";
import HomeHero from "@/components/blocks/home-hero";
import LoanFeatureCards from "@/components/blocks/loan-feature-cards";
import VideoFeature from "@/components/blocks/video-feature";
import PhxEmbedSocialReviews from "@/components/blocks/phx-embed-social-reviews";
import LatestArticles from "@/components/blocks/latest-articles";
import FaqAccordion from "@/components/blocks/faq-accordion";
import AwardCta from "@/components/blocks/award-cta";
import PageHeader from "@/components/blocks/page-header";
import StoryFeature from "@/components/blocks/story-feature";
import BigVideoFeature from "@/components/blocks/big-video-feature";
import EditorialChapter from "@/components/blocks/editorial-chapter";
import YoutubeChannelFeature from "@/components/blocks/youtube-channel-feature";
import PersonCta from "@/components/blocks/person-cta";
import { dataset, projectId } from "@/sanity/lib/env";

type Block = NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

type BlockEditingProps = {
  dataAttribute?: (path: string) => string | undefined;
};

const componentMap: Partial<{
  [K in Block["_type"]]: React.ComponentType<
    Extract<Block, { _type: K }> & BlockEditingProps
  >;
}> = {
  homeHero: HomeHero,
  loanFeatureCards: LoanFeatureCards,
  videoFeature: VideoFeature,
  phxEmbedSocialReviews: PhxEmbedSocialReviews,
  latestArticles: LatestArticles,
  faqAccordion: FaqAccordion,
  awardCta: AwardCta,
  pageHeader: PageHeader,
  storyFeature: StoryFeature,
  bigVideoFeature: BigVideoFeature,
  editorialChapter: EditorialChapter,
  youtubeChannelFeature: YoutubeChannelFeature,
  personCta: PersonCta,
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
          | React.ComponentType<Block & BlockEditingProps>
          | undefined;
        if (!Component) return null;

        const blockPath = `blocks[_key=="${block._key}"]`;
        const dataSanity = stega
          ? createDataAttribute({
              baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
              dataset,
              id: documentId,
              path: blockPath,
              projectId,
              type: "page",
            }).toString()
          : undefined;
        const dataAttribute = stega
          ? (path: string) =>
              createDataAttribute({
                baseUrl: process.env.NEXT_PUBLIC_STUDIO_URL || "http://localhost:3333",
                dataset,
                id: documentId,
                path: `${blockPath}.${path}`,
                projectId,
                type: "page",
              }).toString()
          : undefined;

        return (
          <div data-sanity={dataSanity} key={block._key}>
            <Component {...block} dataAttribute={dataAttribute} />
          </div>
        );
      })}
    </>
  );
}
