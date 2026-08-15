import { defineArrayMember, defineField, defineType } from "sanity";

export const blogPostSidebarAction = defineType({
  name: "blogPostSidebarAction",
  title: "Sidebar Action",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "actionType",
      title: "Action Type",
      type: "string",
      description: "Chooses the icon shown on the button.",
      initialValue: "outboundLink",
      options: {
        layout: "radio",
        list: [
          { title: "Call", value: "call" },
          { title: "Form", value: "form" },
          { title: "Outbound Link", value: "outboundLink" },
        ],
      },
    }),
    defineField({
      name: "button",
      type: "button",
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "button.text",
    },
  },
});

/**
 * The call-to-action panel shown beside blog post bodies. Single object rather
 * than a keyed array: there is exactly one blog post sidebar, so selecting one
 * by key would be indirection with nothing to select between.
 */
export const blogPostSidebar = defineType({
  name: "blogPostSidebar",
  title: "Blog Post Sidebar",
  type: "object",
  description:
    "Calls to action shown alongside blog post content. Keep this to two or three actions — the panel is sticky, and a taller panel than the screen cannot stay pinned while readers scroll.",
  fields: [
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "actions",
      type: "array",
      of: [defineArrayMember({ type: "blogPostSidebarAction" })],
    }),
  ],
  preview: {
    select: {
      title: "title",
      actions: "actions",
    },
    prepare({ title, actions }) {
      const count = Array.isArray(actions) ? actions.length : 0;
      return {
        title: title || "Blog Post Sidebar",
        subtitle: `${count} action${count === 1 ? "" : "s"}`,
      };
    },
  },
});
