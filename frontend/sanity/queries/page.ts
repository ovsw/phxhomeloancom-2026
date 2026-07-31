import { groq } from "next-sanity";
import { metaQuery } from "./shared/meta";
import { homeHeroQuery } from "./home-hero";
import { loanFeatureCardsQuery } from "./loan-feature-cards";
import { videoFeatureQuery } from "./video-feature";
import { phxEmbedSocialReviewsQuery } from "./phx-embed-social-reviews";
import { latestArticlesQuery } from "./latest-articles";
import { faqAccordionQuery } from "./faq-accordion";
import { awardCtaQuery } from "./award-cta";
import { pageHeaderQuery } from "./page-header";
import { storyFeatureQuery } from "./story-feature";
import { bigVideoFeatureQuery } from "./big-video-feature";
import { editorialChapterQuery } from "./editorial-chapter";
import { youtubeChannelFeatureQuery } from "./youtube-channel-feature";

export const PAGE_QUERY = groq`
  *[_type == "page" && slug.current in [$slug, "/" + $slug]][0]{
    _id,
    _type,
    blocks[]{
      _key,
      _type,
      ${homeHeroQuery},
      ${loanFeatureCardsQuery},
      ${videoFeatureQuery},
      ${phxEmbedSocialReviewsQuery},
      ${latestArticlesQuery},
      ${faqAccordionQuery},
      ${awardCtaQuery},
      ${pageHeaderQuery},
      ${storyFeatureQuery},
      ${bigVideoFeatureQuery},
      ${editorialChapterQuery},
      ${youtubeChannelFeatureQuery}
    },
    ${metaQuery},
  }
`;

export const PAGES_SLUGS_QUERY = groq`*[_type == "page" && defined(slug)]{slug}`;
