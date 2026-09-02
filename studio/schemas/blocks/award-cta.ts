import { Award } from "lucide-react";
import { defineType } from "sanity";
import { sectionNavField } from "./shared/section-nav.ts";

export default defineType({
  name: "awardCta",
  title: "Award CTA",
  type: "object",
  icon: Award,
  description:
    "Places the shared award call-to-action from Settings on this page.",
  fields: [
    sectionNavField(),
  ],
  preview: {
    prepare: () => ({
      title: "Shared Award CTA",
      subtitle: "Content managed in Settings",
    }),
  },
});
