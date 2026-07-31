import { defineField, defineType } from "sanity";
import { Files } from "lucide-react";
import { orderRankField } from "@sanity/orderable-document-list";
import meta from "../blocks/shared/meta";

export default defineType({
  name: "page",
  type: "document",
  title: "Page",
  icon: Files,
  groups: [
    {
      name: "content",
      title: "Content",
    },
    {
      name: "seo",
      title: "SEO",
    },
    {
      name: "settings",
      title: "Settings",
    },
  ],
  fields: [
    defineField({ name: "title", type: "string", group: "content" }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "settings",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "blocks",
      type: "array",
      group: "content",
      of: [
        { type: "homeHero" },
        { type: "loanFeatureCards" },
        { type: "videoFeature" },
        { type: "phxEmbedSocialReviews" },
        { type: "latestArticles" },
        { type: "faqAccordion" },
        { type: "awardCta" },
        { type: "pageHeader" },
        { type: "storyFeature" },
        { type: "bigVideoFeature" },
        { type: "editorialChapter" },
      ],
      options: {
        insertMenu: {
          groups: [
            {
              name: "hero",
              title: "Hero",
              of: ["homeHero", "pageHeader"],
            },
            {
              name: "content",
              title: "Content",
              of: [
                "loanFeatureCards",
                "videoFeature",
                "phxEmbedSocialReviews",
                "latestArticles",
                "faqAccordion",
                "awardCta",
                "storyFeature",
                "bigVideoFeature",
                "editorialChapter",
              ],
            },
          ],
          views: [
            {
              name: "grid",
              previewImageUrl: (block) => `/static/images/preview/${block}.jpg`,
            },
            { name: "list" },
          ],
        },
      },
    }),
    meta,
    orderRankField({ type: "page" }),
  ],
});
