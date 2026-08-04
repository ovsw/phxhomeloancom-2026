import { ChevronDown, ChevronRight, ExternalLink, Phone } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { PostBodyModel, PostHeading } from "./model";
import { POST_CONTACT_SIDEBAR } from "./model";

function ContactActionButton({ action }: { action: (typeof POST_CONTACT_SIDEBAR.actions)[number] }) {
  const icon =
    action.kind === "internal" ? (
      <ChevronRight aria-hidden="true" />
    ) : action.kind === "phone" ? (
      <Phone aria-hidden="true" />
    ) : (
      <ExternalLink aria-hidden="true" />
    );
  const className = "h-auto min-h-11 w-full justify-between whitespace-normal py-2.5 text-left";
  const content = (
    <>
      <span>{action.buttonLabel}</span>
      {icon}
    </>
  );

  return (
    <Button asChild className={className} variant={action.variant}>
      {action.kind === "internal" ? (
        <Link href={action.href}>{content}</Link>
      ) : (
        <a
          href={action.href}
          rel={action.kind === "external" ? "noopener noreferrer" : undefined}
          target={action.kind === "external" ? "_blank" : undefined}
        >
          {content}
        </a>
      )}
    </Button>
  );
}

function ContactSidebar() {
  return (
    <div className="space-y-4">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{POST_CONTACT_SIDEBAR.title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">
          {POST_CONTACT_SIDEBAR.description}
        </p>
      </header>
      <div className="grid gap-4">
        {POST_CONTACT_SIDEBAR.actions.map((action) => (
          <Card className="p-5" key={action.title}>
            <section className="space-y-3">
              <h3 className="text-base font-semibold tracking-normal">{action.title}</h3>
              <p className="text-sm leading-6 text-muted-foreground">{action.description}</p>
              <ContactActionButton action={action} />
            </section>
          </Card>
        ))}
      </div>
    </div>
  );
}

function HeadingLinks({ headings }: { headings: PostHeading[] }) {
  return (
    <ul className="space-y-2">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            className="block rounded-sm py-1 text-sm leading-5 text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline focus-underline"
            href={`#${heading.id}`}
          >
            {heading.text}
          </a>
          {heading.children.length ? (
            <div className="mt-1 border-l pl-4">
              <HeadingLinks headings={heading.children} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function TableOfContents({ headings }: { headings: PostHeading[] }) {
  return (
    <div className="hidden lg:sticky lg:top-24 lg:block">
      <Card className="p-5">
        <details className="group" open>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm text-sm font-semibold uppercase tracking-wide focus-underline [&::-webkit-details-marker]:hidden">
            <span>Table of Contents</span>
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 transition-transform group-open:rotate-180"
            />
          </summary>
          <nav aria-label="Table of Contents" className="mt-4">
            <HeadingLinks headings={headings} />
          </nav>
        </details>
      </Card>
    </div>
  );
}

export function PostSidebar({
  bodyModel,
}: {
  bodyModel: PostBodyModel;
}) {
  return (
    <aside aria-label="Post sidebar" className="min-w-0 space-y-6 lg:w-80">
      <ContactSidebar />
      {bodyModel.showTableOfContents ? <TableOfContents headings={bodyModel.headings} /> : null}
    </aside>
  );
}
