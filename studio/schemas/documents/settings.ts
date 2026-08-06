import { defineField, defineType } from "sanity";
import { Settings } from "lucide-react";

export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  icon: Settings,
  fields: [
    defineField({
      name: "logo",
      title: "Main logo",
      description:
        "The primary brand lockup. Sits at the left of the header, with the secondary logo beside it.",
      type: "object",
      fields: [
        defineField({
          name: "dark",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "light",
          type: "image",
          options: { hotspot: true },
        }),
        defineField({
          name: "width",
          type: "number",
          title: "Width",
          description:
            "The width of the logo. Default is dimensions of the image.",
        }),
        defineField({
          name: "height",
          type: "number",
          title: "Height",
          description:
            "The height of the logo. Default is dimensions of the image.",
        }),
      ],
    }),
    defineField({
      name: "secondaryLogo",
      title: "Secondary logo",
      type: "object",
      description:
        "Parent-brand or affiliate attribution shown beside the main logo — currently 'A division of Luminate Bank'. Kept separate from the main logo so the two can be sized independently. Sits to the right of the main logo, and below it on the narrowest phones.",
      fields: [
        defineField({
          name: "dark",
          type: "image",
          title: "Dark mode (optional)",
          description:
            "Optional. Leave empty to invert the light asset instead. Multi-color marks rarely invert cleanly, so supply a dedicated file once one is available.",
          options: { hotspot: true },
        }),
        defineField({
          name: "light",
          type: "image",
          title: "Light mode",
          description:
            "Compact horizontal lockup. Used on light backgrounds, and inverted for dark mode until a dedicated dark asset is supplied.",
          options: { hotspot: true },
        }),
        defineField({
          name: "width",
          type: "number",
          title: "Width",
          description:
            "The width of the logo. Default is dimensions of the image.",
        }),
        defineField({
          name: "height",
          type: "number",
          title: "Height",
          description:
            "The height of the logo. Default is dimensions of the image.",
        }),
      ],
    }),
    defineField({
      name: "siteName",
      type: "string",
      description: "The name of your site",
      validation: (Rule) => Rule.required().error("Site name is required"),
    }),
  ],
  preview: {
    select: {
      title: "siteName",
      media: "logo",
    },
    prepare({ title, media }) {
      return {
        title: title || "Site Settings",
        media,
      };
    },
  },
});
