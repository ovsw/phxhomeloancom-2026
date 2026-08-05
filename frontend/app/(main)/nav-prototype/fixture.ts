/**
 * Prototype-only fixture. Mirrors the live Sanity navigation document, plus two
 * extra groups ("Resources", "Calculators") so the rightmost trigger sits far
 * from the nav's centre — the case we're actually trying to judge.
 */
import type { HeaderNavigationModel } from "@/components/header/model";

const link = (href: string, label: string) => ({ href, label, openInNewTab: false });

export const prototypeNavigation: HeaderNavigationModel = {
  items: [
    {
      key: "about-us",
      kind: "group",
      label: "About Us",
      links: [
        {
          key: "our-team",
          label: "Our Team",
          description: "The highly motivated team behind every step of your mortgage.",
          icon: "users-2",
          link: link("/about-us/our-team", "Our Team"),
        },
        {
          key: "jimmys-story",
          label: "Jimmy's Story",
          description: "From Marine Corps to top Phoenix mortgage originator.",
          icon: "award",
          link: link("/about-us/jimmys-story", "Jimmy's Story"),
        },
      ],
    },
    {
      key: "loan-information",
      kind: "group",
      label: "Loan Info",
      links: [
        {
          key: "loan-options",
          label: "Loan Options",
          description: "Compare common mortgage loan options.",
          icon: "list-collapse",
          link: link("/loan-information/loan-options", "Loan Options"),
        },
        {
          key: "refinancing",
          label: "Refinancing",
          description: "Review refinance options for an existing mortgage.",
          icon: "refresh-cw",
          link: link("/loan-information/refinancing", "Refinancing"),
        },
        {
          key: "mortgage-insurance",
          label: "What is Mortgage Insurance",
          description: "Learn when Private Mortgage Insurance (PMI) may apply.",
          icon: "shield-plus",
          link: link("/loan-information/mortgage-insurance", "What is Mortgage Insurance"),
        },
      ],
    },
    {
      key: "types-of-loans",
      kind: "group",
      label: "Loan Types",
      links: [
        {
          key: "conventional",
          label: "Conventional Loan",
          description: "Conventional mortgage basics for Phoenix buyers.",
          icon: "home",
          link: link("/types-of-loans/conventional-loan", "Conventional Loan"),
        },
        {
          key: "fha",
          label: "FHA Loan",
          description: "FHA loan basics and eligibility factors.",
          icon: "key",
          link: link("/types-of-loans/fha-loan", "FHA Loan"),
        },
        {
          key: "jumbo",
          label: "Jumbo Loan",
          description: "Jumbo loan options for higher loan amounts.",
          icon: "building-2",
          link: link("/types-of-loans/jumbo-loan", "Jumbo Loan"),
        },
        {
          key: "construction",
          label: "Construction-to-Permanent Loan",
          description: "Financing for construction-to-permanent loans.",
          icon: "chevron-right",
          link: link("/types-of-loans/construction-to-permanent-loan", "Construction Loan"),
        },
        {
          key: "va",
          label: "VA Loan",
          description: "VA loan information for eligible borrowers.",
          icon: "shield-check",
          link: link("/types-of-loans/va-loan", "VA Loan"),
        },
      ],
    },
    {
      key: "blog",
      kind: "group",
      label: "Blog",
      links: [
        {
          key: "blog-types",
          label: "Types of Loans",
          description: "Articles comparing mortgage products.",
          icon: "chevron-right",
          link: link("/blog/types-of-loans", "Types of Loans"),
        },
        {
          key: "blog-finances",
          label: "Personal Finances",
          description: "Credit, savings, and budgeting for buyers.",
          icon: "chevron-right",
          link: link("/blog/personal-finances", "Personal Finances"),
        },
        {
          key: "blog-requirements",
          label: "Requirements",
          description: "What lenders look for in an application.",
          icon: "chevron-right",
          link: link("/blog/requirements", "Requirements"),
        },
        {
          key: "blog-benefits",
          label: "Benefits of Buying Now",
          description: "Market timing and long-term ownership value.",
          icon: "chevron-right",
          link: link("/blog/benefits-of-buying-now", "Benefits of Buying Now"),
        },
        {
          key: "blog-education",
          label: "Buyer Education",
          description: "Guides for first-time Phoenix homebuyers.",
          icon: "chevron-right",
          link: link("/blog/buyer-education", "Buyer Education"),
        },
      ],
    },
    // --- Added beyond the live document, to widen the bar ---
    {
      key: "resources",
      kind: "group",
      label: "Resources",
      links: [
        {
          key: "res-checklist",
          label: "Document Checklist",
          description: "Everything to gather before you apply.",
          icon: "list-collapse",
          link: link("/resources/document-checklist", "Document Checklist"),
        },
        {
          key: "res-glossary",
          label: "Mortgage Glossary",
          description: "Plain-language definitions of loan terms.",
          icon: "chevron-right",
          link: link("/resources/glossary", "Mortgage Glossary"),
        },
        {
          key: "res-process",
          label: "The Loan Process",
          description: "Step by step from pre-approval to closing.",
          icon: "refresh-cw",
          link: link("/resources/loan-process", "The Loan Process"),
        },
      ],
    },
    {
      key: "calculators",
      kind: "group",
      label: "Calculators",
      links: [
        {
          key: "calc-payment",
          label: "Payment Calculator",
          description: "Estimate a monthly principal and interest payment.",
          icon: "home",
          link: link("/calculators/payment", "Payment Calculator"),
        },
        {
          key: "calc-affordability",
          label: "Affordability Calculator",
          description: "See what price range fits your budget.",
          icon: "building-2",
          link: link("/calculators/affordability", "Affordability Calculator"),
        },
        {
          key: "calc-refi",
          label: "Refinance Break-Even",
          description: "Find out when a refinance pays for itself.",
          icon: "refresh-cw",
          link: link("/calculators/refinance-break-even", "Refinance Break-Even"),
        },
      ],
    },
    {
      key: "contact",
      kind: "link",
      label: "Contact",
      link: link("/contact", "Contact"),
    },
  ],
  actions: [
    {
      key: "schedule",
      link: { href: "/contact", label: "Schedule Consult", openInNewTab: false },
    },
  ],
};
