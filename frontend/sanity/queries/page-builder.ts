import { advisorCtaQuery } from "./advisor-cta";
import { awardCtaQuery } from "./award-cta";
import { bigVideoFeatureQuery } from "./big-video-feature";
import { contactFormQuery } from "./contact-form";
import { editorialChapterQuery } from "./editorial-chapter";
import { faqAccordionQuery } from "./faq-accordion";
import { homeHeroQuery } from "./home-hero";
import { latestArticlesQuery } from "./latest-articles";
import { loanFeatureCardsQuery } from "./loan-feature-cards";
import { locationMapQuery } from "./location-map";
import { pageHeaderQuery } from "./page-header";
import { personContactCtaQuery } from "./person-contact-cta";
import { personCtaQuery } from "./person-cta";
import { phxEmbedSocialReviewsQuery } from "./phx-embed-social-reviews";
import { richTextBlockQuery } from "./rich-text-block";
import { storyFeatureQuery } from "./story-feature";
import { teamMembersQuery } from "./team-members";
import { videoFeatureQuery } from "./video-feature";
import { youtubeChannelFeatureQuery } from "./youtube-channel-feature";

export const pageBuilderQuery = `
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
    ${youtubeChannelFeatureQuery},
    ${personCtaQuery},
    ${locationMapQuery},
    ${personContactCtaQuery},
    ${contactFormQuery},
    ${teamMembersQuery},
    ${richTextBlockQuery},
    ${advisorCtaQuery}
  }
`;
