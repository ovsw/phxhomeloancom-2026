import { FileText } from "lucide-react";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "blog",
  title: "Legacy Blog (read-only)",
  type: "document",
  icon: FileText,
  description:
    "Compatibility schema for legacy article data used by the homepage Latest Articles block.",
  fields: [
    defineField({ name: "title", type: "string", readOnly: true }),
    defineField({ name: "description", type: "text", readOnly: true }),
    defineField({ name: "publishedAt", type: "date", readOnly: true }),
    defineField({
      name: "image",
      type: "image",
      readOnly: true,
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative Text",
          type: "string",
          readOnly: true,
        }),
      ],
    }),
    defineField({ name: "seoHideFromLists", type: "boolean", readOnly: true }),
    defineField({ name: "seoNoIndex", type: "boolean", readOnly: true }),
  ],
  preview: {
    select: { title: "title", media: "image" },
    prepare: ({ title, media }) => ({
      title: title || "Untitled legacy article",
      subtitle: "Legacy Blog (read-only)",
      media,
    }),
  },
});
