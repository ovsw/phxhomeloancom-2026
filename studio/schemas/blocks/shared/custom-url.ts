import { defineField, defineType } from "sanity";

export default defineType({
  name: "customUrl",
  title: "URL",
  type: "object",
  fields: [
    defineField({
      name: "type",
      type: "string",
      initialValue: "external",
      options: {
        layout: "radio",
        list: [
          { title: "Internal", value: "internal" },
          { title: "External", value: "external" },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in new tab",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "external",
      title: "External URL",
      type: "string",
      hidden: ({ parent }) => parent?.type !== "external",
    }),
    defineField({
      name: "internal",
      title: "Internal Page",
      type: "reference",
      to: [{ type: "homePage" }, { type: "page" }, { type: "post" }],
      hidden: ({ parent }) => parent?.type !== "internal",
    }),
    defineField({
      name: "href",
      type: "string",
      hidden: true,
      readOnly: true,
    }),
  ],
});
