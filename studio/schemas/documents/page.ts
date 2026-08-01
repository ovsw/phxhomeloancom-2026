import { defineField, defineType } from "sanity";
import { Files } from "lucide-react";
import meta from "../blocks/shared/meta";

export default defineType({
  name: "page",
  type: "document",
  title: "Page",
  icon: Files,
  orderings: [
    {
      title: "Title (A–Z)",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
    {
      title: "Title (Z–A)",
      name: "titleDesc",
      by: [{ field: "title", direction: "desc" }],
    },
    {
      title: "Last updated (newest)",
      name: "updatedAtDesc",
      by: [{ field: "_updatedAt", direction: "desc" }],
    },
    {
      title: "Last updated (oldest)",
      name: "updatedAtAsc",
      by: [{ field: "_updatedAt", direction: "asc" }],
    },
    {
      title: "Created (newest)",
      name: "createdAtDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
    {
      title: "Created (oldest)",
      name: "createdAtAsc",
      by: [{ field: "_createdAt", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "slug.current",
    },
  },
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
        { type: "youtubeChannelFeature" },
        { type: "personCta" },
        { type: "locationMap" },
        { type: "personContactCta" },
        { type: "contactForm" },
        { type: "teamMembers" },
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
                "youtubeChannelFeature",
                "personCta",
                "locationMap",
                "personContactCta",
                "contactForm",
                "teamMembers",
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
  ],
});
