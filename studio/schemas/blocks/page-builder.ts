import { defineField } from "sanity";

export const pageBuilderBlockTypes = [
  "homeHero",
  "loanFeatureCards",
  "videoFeature",
  "phxEmbedSocialReviews",
  "latestArticles",
  "faqAccordion",
  "awardCta",
  "pageHeader",
  "storyFeature",
  "bigVideoFeature",
  "editorialChapter",
  "youtubeChannelFeature",
  "personCta",
  "locationMap",
  "personContactCta",
  "contactForm",
  "teamMembers",
  "richTextBlock",
  "advisorCta",
] as const;

const heroBlockTypes = ["homeHero", "pageHeader"] as const;
const contentBlockTypes = pageBuilderBlockTypes.filter(
  (type) => !heroBlockTypes.includes(type as (typeof heroBlockTypes)[number]),
);

export const blocksField = defineField({
  name: "blocks",
  type: "array",
  group: "content",
  of: pageBuilderBlockTypes.map((type) => ({ type })),
  options: {
    insertMenu: {
      groups: [
        { name: "hero", title: "Hero", of: [...heroBlockTypes] },
        { name: "content", title: "Content", of: contentBlockTypes },
      ],
      views: [
        {
          name: "grid",
          previewImageUrl: (block: string) =>
            `/static/images/preview/${block}.jpg`,
        },
        { name: "list" },
      ],
    },
  },
});
