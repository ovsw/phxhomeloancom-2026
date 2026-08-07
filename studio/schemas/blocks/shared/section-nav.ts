import { defineField, defineType } from "sanity";

export default defineType({
  name: "section-nav",
  title: "Quick Nav",
  type: "object",
  description:
    "Controls whether this section appears in the page's quick nav bar",
  fields: [
    defineField({
      name: "showInQuickNav",
      type: "boolean",
      title: "Show in quick nav",
      description:
        "Include this section in the sticky quick nav below the hero. The section also needs a label to actually appear.",
    }),
    defineField({
      name: "navLabel",
      type: "string",
      title: "Quick nav label",
      description:
        'Short label shown in the quick nav, e.g. "Why refinance". Also used for the section\'s link anchor.',
      validation: (rule) => [
        rule
          .max(40)
          .warning("Keep quick nav labels short — 40 characters or less."),
        rule
          .custom((value, context) => {
            const parent = context.parent as
              | { showInQuickNav?: boolean }
              | undefined;
            if (parent?.showInQuickNav && !value?.trim()) {
              return "Add a short label to show this section in the quick nav.";
            }
            return true;
          })
          .warning(),
      ],
    }),
  ],
});

/**
 * Attach quick-nav controls to a section block. `defaultOn` only sets the
 * toggle's initial state for newly inserted sections — a section appears in
 * the quick nav when it has a label and the toggle is not explicitly off.
 */
export function sectionNavField({ defaultOn }: { defaultOn: boolean }) {
  return defineField({
    name: "sectionNav",
    title: "Quick Nav",
    type: "section-nav",
    initialValue: { showInQuickNav: defaultOn },
  });
}
