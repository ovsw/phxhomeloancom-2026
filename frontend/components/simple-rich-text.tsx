import type { PortableTextProps } from "@portabletext/react";
import { getSafeLinkHref } from "@/lib/safe-href";
import Link from "next/link";

/**
 * Serializers for the `simpleRichText` schema: paragraphs with bold, italic,
 * and inline links, nothing else. The shared PortableTextRenderer carries
 * inline margins and serializers for blocks this field cannot contain, so
 * sections space the paragraphs themselves (e.g. `grid gap-(--space-stack)`
 * on the wrapper).
 */
export const simpleRichTextComponents: PortableTextProps["components"] = {
  block: {
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    customLink: ({ children, value }) => {
      const href = getSafeLinkHref(value?.href);
      return href ? (
        <Link
          className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
          href={href}
          rel={value.openInNewTab ? "noopener noreferrer" : undefined}
          target={value.openInNewTab ? "_blank" : undefined}
        >
          {children}
        </Link>
      ) : (
        <span>{children}</span>
      );
    },
  },
};
