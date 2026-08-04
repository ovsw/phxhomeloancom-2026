import {
  CodeIcon,
  ImageIcon,
  LinkIcon,
  Table2Icon,
  TextIcon,
  VideoIcon,
} from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const linkAnnotation = (name: "buttonLink" | "customLink", title: string) =>
  defineArrayMember({
    name,
    type: "object",
    title,
    icon: LinkIcon,
    fields: [
      ...(name === "buttonLink"
        ? [
            defineField({
              name: "variant",
              title: "Button Style",
              type: "string",
              initialValue: "default",
              options: {
                layout: "radio",
                list: [
                  { title: "Default", value: "default" },
                  { title: "Secondary", value: "secondary" },
                  { title: "Outline", value: "outline" },
                  { title: "Link", value: "link" },
                ],
              },
            }),
          ]
        : []),
      defineField({
        name: "customLink",
        title: name === "buttonLink" ? "Button Destination" : "Link",
        type: "customUrl",
      }),
    ],
  });

export default defineType({
  name: "richTextBlock",
  title: "Rich Text Block",
  type: "object",
  icon: TextIcon,
  fields: [
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional short label shown above the section heading",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "Optional heading shown above the rich text content",
    }),
    defineField({
      name: "richText",
      title: "Content",
      type: "array",
      of: [
        defineArrayMember({
          name: "block",
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "H4", value: "h4" },
            { title: "H5", value: "h5" },
            { title: "H6", value: "h6" },
            { title: "Inline", value: "inline" },
          ],
          lists: [
            { title: "Numbered", value: "number" },
            { title: "Bullet", value: "bullet" },
          ],
          marks: {
            annotations: [
              linkAnnotation("customLink", "Internal/External Link"),
              linkAnnotation("buttonLink", "Button Link"),
            ],
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
          },
        }),
        defineArrayMember({
          name: "image",
          title: "Image",
          type: "image",
          icon: ImageIcon,
          options: { hotspot: true },
          fields: [
            defineField({ name: "alt", title: "Alternative Text", type: "string" }),
            defineField({ name: "caption", title: "Caption Text", type: "string" }),
          ],
        }),
        defineArrayMember({
          name: "table",
          title: "Table",
          type: "object",
          icon: Table2Icon,
          fields: [
            defineField({ name: "title", title: "Table Title", type: "string" }),
            defineField({
              name: "rows",
              title: "Rows",
              type: "array",
              of: [
                defineArrayMember({
                  name: "tableRow",
                  title: "Table Row",
                  type: "object",
                  fields: [
                    defineField({
                      name: "cells",
                      title: "Cells",
                      type: "array",
                      of: [defineArrayMember({ type: "string" })],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        defineArrayMember({
          name: "youtube",
          title: "YouTube Video",
          type: "object",
          icon: VideoIcon,
          fields: [
            defineField({
              name: "url",
              title: "YouTube URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
          ],
        }),
        defineArrayMember({
          name: "iframeEmbed",
          title: "Iframe Embed",
          type: "object",
          icon: CodeIcon,
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "src",
              title: "Iframe URL",
              type: "url",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "height",
              title: "Height",
              type: "number",
              initialValue: 450,
              validation: (rule) => rule.integer().positive(),
            }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Rich Text",
      subtitle: "Rich Text Block",
    }),
  },
});
