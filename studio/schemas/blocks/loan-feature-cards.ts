import { BadgeDollarSign } from "lucide-react";
import { defineArrayMember, defineField, defineType } from "sanity";

const loanIconOptions = [
  { title: "Conventional Loan", value: "conventional-loan" },
  { title: "FHA Loan", value: "fha-loan" },
  { title: "American Flag", value: "american-flag" },
  { title: "Adjustable Rate Mortgage", value: "adjustable-rate-mortgage" },
  { title: "Elephant", value: "elephant" },
];

const loanFeatureCard = defineArrayMember({
  name: "phxLoanFeatureCard",
  type: "object",
  fields: [
    defineField({
      name: "title",
      type: "string",
      description: "The loan card heading visitors will see",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "Choose the mortgage loan icon that should appear on this card",
      options: { list: loanIconOptions },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bullets",
      type: "array",
      description: "Short supporting points for this loan option",
      of: [defineArrayMember({ type: "string" })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: "link",
      title: "Link",
      type: "customUrl",
      description: "The page visitors should open to learn about this loan",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "icon" },
    prepare: ({ title, subtitle }) => ({
      title: title || "Untitled Loan Card",
      subtitle: subtitle || "Loan card",
    }),
  },
});

export default defineType({
  name: "loanFeatureCards",
  title: "Loan Feature Cards",
  type: "object",
  icon: BadgeDollarSign,
  description: "Mortgage loan feature cards with a controlled set of industry-specific icons",
  fields: [
    defineField({
      name: "useCreamBackground",
      title: "Use Cream Background",
      type: "boolean",
      description: "Turn on to use a cream background for this section. Leave off for white.",
      initialValue: false,
    }),
    defineField({
      name: "eyebrow",
      type: "string",
      description: "Optional text shown above the section title",
    }),
    defineField({
      name: "title",
      type: "string",
      description: "The main heading for the loan cards section",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "cards",
      type: "array",
      description: "The loan options to feature on the homepage",
      of: [loanFeatureCard],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: "title" },
    prepare: ({ title }) => ({
      title: title || "Untitled Loan Feature Cards",
      subtitle: "Loan Feature Cards",
    }),
  },
});
