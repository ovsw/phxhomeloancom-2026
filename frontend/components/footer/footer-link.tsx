import Link from "next/link";
import type { ReactNode } from "react";
import type { FooterLinkModel } from "./model";

const baseClassName =
  "break-words text-[14.5px] leading-[1.45] text-white/80 transition-colors [overflow-wrap:anywhere] hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#feb77d] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0c1329]";

export function FooterLink({
  children,
  className = "",
  link,
}: {
  children?: ReactNode;
  className?: string;
  link: FooterLinkModel;
}) {
  return (
    <Link
      className={`${baseClassName} ${className}`}
      href={link.href}
      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
      target={link.openInNewTab ? "_blank" : undefined}
    >
      {children ?? link.label}
    </Link>
  );
}
