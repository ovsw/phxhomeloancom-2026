import { LinkIcon } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Deliberately minimal rich text: paragraphs with bold, italic, and inline
 * links, nothing else. Use it where copy needs multiple paragraphs but must
 * not introduce headings, lists, or embedded media that would break the
 * section's design.
 */
export default defineType({
  name: "simpleRichText",
  title: "Simple Rich Text",
  type: "array",
  of: [
    defineArrayMember({
      name: "block",
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
      marks: {
        annotations: [
          defineArrayMember({
            name: "customLink",
            type: "object",
            title: "Link",
            icon: LinkIcon,
            fields: [
              defineField({
                name: "customLink",
                title: "Link",
                type: "customUrl",
                validation: (rule) => rule.required(),
              }),
            ],
          }),
        ],
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
      },
    }),
  ],
});
