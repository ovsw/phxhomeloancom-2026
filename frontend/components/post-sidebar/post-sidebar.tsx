import { ChevronDown, ChevronRight, ExternalLink, Mail, Phone } from "lucide-react";
import { stegaClean } from "next-sanity";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSafeLinkHref } from "@/lib/safe-href";
import type { BlogPostSidebar, PostHeading } from "./model";
import { PostTableOfContents } from "./table-of-contents";

type Action = NonNullable<BlogPostSidebar["actions"]>[number];
type DataAttribute = (path: string) => string | undefined;

function getButtonVariant(action: Action) {
  const variant = "variant" in action ? stegaClean(action.variant) : null;
  return variant === "outline" ||
    variant === "secondary" ||
    variant === "link"
    ? variant
    : "default";
}

function ContactActionButton({
  action,
  dataAttribute,
  path,
}: {
  action: Action;
  dataAttribute?: DataAttribute;
  path: string;
}) {
  const href = getSafeLinkHref("href" in action ? action.href : null);
  const label = "text" in action ? action.text : null;
  if (!href || !label) return null;

  const actionType = stegaClean(action.actionType);
  const openInNewTab =
    "openInNewTab" in action && stegaClean(action.openInNewTab) === true;
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const isHttp = /^https?:\/\//i.test(href);
  const icon = isInternal ? (
    <ChevronRight aria-hidden="true" />
  ) : actionType === "call" || href.startsWith("tel:") ? (
    <Phone aria-hidden="true" />
  ) : href.startsWith("mailto:") ? (
    <Mail aria-hidden="true" />
  ) : (
    <ExternalLink aria-hidden="true" />
  );
  const content = (
    <>
      <span>{label}</span>
      {icon}
    </>
  );
  const className =
    "h-auto min-h-11 w-full justify-between whitespace-normal py-2.5 text-left";

  return (
    <Button asChild className={className} variant={getButtonVariant(action)}>
      {isInternal ? (
        <Link data-sanity={dataAttribute?.(`${path}.button.text`)} href={href}>
          {content}
        </Link>
      ) : (
        <a
          data-sanity={dataAttribute?.(`${path}.button.text`)}
          href={href}
          rel={isHttp && openInNewTab ? "noopener noreferrer" : undefined}
          target={isHttp && openInNewTab ? "_blank" : undefined}
        >
          {content}
        </a>
      )}
    </Button>
  );
}

export function PostSidebar({
  dataAttribute,
  sidebar,
}: {
  dataAttribute?: DataAttribute;
  sidebar: BlogPostSidebar | null;
}) {
  const actions = sidebar?.actions ?? [];
  if (!sidebar || actions.length === 0) return null;

  const sidebarPath = "blogPostSidebar";

  return (
    <aside
      aria-label="Post contact options"
      className="min-w-0 self-stretch"
      data-sanity={dataAttribute?.(sidebarPath)}
    >
      <div className="grid gap-5 lg:sticky lg:top-24">
        {sidebar.title || sidebar.description ? (
          <header className="space-y-2">
            {sidebar.title ? (
              <h2
                className="typo-subsection-heading text-foreground"
                data-sanity={dataAttribute?.(`${sidebarPath}.title`)}
              >
                {sidebar.title}
              </h2>
            ) : null}
            {sidebar.description ? (
              <p
                className="typo-body-sm text-muted-foreground"
                data-sanity={dataAttribute?.(`${sidebarPath}.description`)}
              >
                {sidebar.description}
              </p>
            ) : null}
          </header>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {actions.map((action) => {
            const actionKey = stegaClean(action._key);
            const actionPath = `${sidebarPath}.actions[_key=="${actionKey}"]`;

            return (
              <Card className="p-5" data-sanity={dataAttribute?.(actionPath)} key={actionKey}>
                <section className="space-y-3">
                  {action.title ? (
                    <h3
                      className="typo-card-title text-foreground"
                      data-sanity={dataAttribute?.(`${actionPath}.title`)}
                    >
                      {action.title}
                    </h3>
                  ) : null}
                  {action.description ? (
                    <p
                      className="typo-body-sm text-muted-foreground"
                      data-sanity={dataAttribute?.(`${actionPath}.description`)}
                    >
                      {action.description}
                    </p>
                  ) : null}
                  <ContactActionButton
                    action={action}
                    dataAttribute={dataAttribute}
                    path={actionPath}
                  />
                </section>
              </Card>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export function PostTableOfContentsRail({ headings }: { headings: PostHeading[] }) {
  return (
    <aside
      aria-label="Post table of contents"
      className="hidden min-w-0 self-stretch lg:block"
    >
      <div className="sticky top-24">
        <Card className="p-5">
          <details className="group" open>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm typo-meta-label text-foreground focus-underline [&::-webkit-details-marker]:hidden">
              <span>Table of Contents</span>
              <ChevronDown
                aria-hidden="true"
                className="size-5 shrink-0 transition-transform motion-fast group-open:rotate-180"
              />
            </summary>
            <div className="mt-4">
              <PostTableOfContents headings={headings} />
            </div>
          </details>
        </Card>
      </div>
    </aside>
  );
}
