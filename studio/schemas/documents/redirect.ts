import { TrendingUpDown } from "lucide-react";
import { defineField, defineType } from "sanity";

import {
  validateRedirectDestination,
  validateRedirectSource,
} from "../validation/redirect-rules";

export default defineType({
  name: "redirect",
  title: "Redirect",
  type: "document",
  icon: TrendingUpDown,
  description:
    "Send an old internal path to a current one after the next frontend build.",
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      description: "Enable or disable this redirect.",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Inactive", value: "inactive" },
        ],
        layout: "radio",
      },
      initialValue: "active",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "source",
      title: "Source",
      type: "slug",
      description: "The old internal path, starting with /.",
      validation: (Rule) => [
        Rule.required(),
        Rule.custom(validateRedirectSource),
      ],
    }),
    defineField({
      name: "destination",
      title: "Destination",
      type: "slug",
      description: "The current internal path, starting with /.",
      options: {
        // Many old routes may legitimately point to the same current route.
        isUnique: () => true,
      },
      validation: (Rule) =>
        Rule.required().custom(validateRedirectDestination),
    }),
    defineField({
      name: "permanent",
      title: "Redirect type",
      type: "string",
      description: "Use 301 for a permanent move or 302 for a temporary one.",
      options: {
        list: [
          { title: "Permanent (301)", value: "true" },
          { title: "Temporary (302)", value: "false" },
        ],
        layout: "radio",
      },
      initialValue: "true",
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      destination: "destination.current",
      permanent: "permanent",
      source: "source.current",
      status: "status",
    },
    prepare: ({ destination, permanent, source, status }) => ({
      title: `${source || "Untitled"} → ${destination || "Untitled"}`,
      subtitle: `${permanent === "false" ? "302 temporary" : "301 permanent"}, ${status || "inactive"}`,
      media: TrendingUpDown,
    }),
  },
});
