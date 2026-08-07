import type { QuickNavItem } from "@/lib/quick-nav";

export default function QuickNav({ items }: { items: QuickNavItem[] }) {
  return (
    <nav
      aria-label="On this page"
      className="sticky top-[var(--site-header-offset,var(--header-height))] z-50 bg-accent transition-[top] motion-slow motion-reduce:transition-none"
    >
      <div className="container flex h-14 items-center gap-2 overflow-x-auto">
        <span className="mr-2 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-accent-foreground/70">
          On this page
        </span>
        {items.map((item) => (
          <a
            className="inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-white/15 focus-ring-on-dark"
            href={`#${item.id}`}
            key={item.key}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
