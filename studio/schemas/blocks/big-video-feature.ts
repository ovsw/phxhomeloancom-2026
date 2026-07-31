import { PlayCircle } from "lucide-react";
import { defineField, defineType } from "sanity";

const youtubeHosts = [
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
] as const;

function getYouTubeVideoId(value?: string) {
  if (!value) return null;

  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (!youtubeHosts.includes(hostname as (typeof youtubeHosts)[number])) {
      return null;
    }

    if (hostname === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] ?? null;
    }

    if (url.pathname.startsWith("/embed/")) {
      return url.pathname.split("/").filter(Boolean)[1] ?? null;
    }

    return url.searchParams.get("v");
  } catch {
    return null;
  }
}

export default defineType({
  name: "bigVideoFeature",
  title: "Big Video Feature",
  type: "object",
  icon: PlayCircle,
  description: "A prominent video introduction with centered supporting copy",
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown above the section heading",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The main heading for this video",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      description: "Optional concise introduction shown above the video",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
      description: "The YouTube watch, share, or embed URL for the video",
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ["https"] })
          .custom((value) =>
            !value || getYouTubeVideoId(value)
              ? true
              : "Enter a YouTube URL with a valid video ID",
          ),
    }),
    defineField({
      name: "thumbnailImage",
      title: "Thumbnail Image",
      type: "image",
      description:
        "Optional custom video thumbnail. The YouTube thumbnail is used when this is empty.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          description: "Describe the thumbnail for visitors using screen readers",
          validation: (rule) =>
            rule.custom((value, context) => {
              const image = context.parent as { asset?: unknown } | undefined;
              return image?.asset && !value?.trim()
                ? "Alternative text is required when a thumbnail is set"
                : true;
            }),
        }),
      ],
    }),
  ],
  preview: {
    select: { media: "thumbnailImage", title: "title" },
    prepare: ({ media, title }) => ({
      media,
      subtitle: "Big Video Feature",
      title: title || "Untitled Big Video Feature",
    }),
  },
});
