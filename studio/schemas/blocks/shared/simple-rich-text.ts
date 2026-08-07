import { defineArrayMember, defineType } from "sanity";

/**
 * Deliberately minimal rich text: paragraphs with bold and italic, nothing else.
 * Use it where copy needs multiple paragraphs but must not introduce headings,
 * lists, links, or embedded media that would break the section's design.
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
        annotations: [],
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
      },
    }),
  ],
});
