"use client";

import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { HeaderLink } from "./header-link";
import type { HeaderNavigationItem, HeaderNavigationModel } from "./model";
import { NavigationIcon } from "./navigation-icon";

const primaryLinkClassName =
  "flex min-h-11 items-center whitespace-nowrap rounded-md px-1 typo-nav text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40";

function DesktopGroup({ item }: { item: Extract<HeaderNavigationItem, { kind: "group" }> }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = `header-group-${item.key}`;

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };
  const openGroup = () => {
    cancelClose();
    setOpen(true);
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) scheduleClose();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      cancelClose();
      setOpen(false);
      trigger.current?.focus();
    }
  };

  useEffect(() => cancelClose, []);

  return (
    <div
      className="group/nav-column relative"
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onMouseEnter={openGroup}
      onMouseLeave={scheduleClose}
      ref={container}
    >
      <button
        aria-controls={panelId}
        aria-expanded={open}
        className={cn(primaryLinkClassName, "gap-1")}
        onClick={(event) => {
          if (event.detail === 0) setOpen((value) => !value);
          else setOpen(true);
        }}
        ref={trigger}
        type="button"
      >
        {item.label}
        <ChevronDown
          aria-hidden="true"
          className={cn("size-3 transition-transform", open && "rotate-180")}
        />
      </button>
      {open ? (
        <div
          className="absolute left-1/2 top-full z-[70] w-72 -translate-x-1/2 pt-0.5"
          id={panelId}
        >
          <div className="grid gap-1 rounded-xl border border-border bg-popover p-2 text-popover-foreground shadow-[0_18px_44px_rgba(19,28,59,0.16)] dark:shadow-[0_18px_44px_rgba(0,0,0,0.28)]">
            {item.links.map((child) => (
              <HeaderLink
                className="group/nav-link flex items-center gap-3 rounded-lg px-4 py-[11px] transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/40"
                key={child.key}
                link={child.link}
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[9px] bg-secondary text-primary">
                  <NavigationIcon name={child.icon} />
                </span>
                <span className="grid gap-0.5">
                  <span className="typo-nav font-semibold text-popover-foreground">
                    {child.label}
                  </span>
                  <span className="line-clamp-2 typo-fine-print text-muted-foreground">
                    {child.description}
                  </span>
                </span>
              </HeaderLink>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function DesktopNav({ navigation }: { navigation: HeaderNavigationModel }) {
  return (
    <nav aria-label="Main navigation" className="hidden items-center gap-3 lg:flex xl:gap-[34px]">
      {navigation.items.map((item) =>
        item.kind === "group" ? (
          <DesktopGroup item={item} key={item.key} />
        ) : (
          <HeaderLink className={primaryLinkClassName} key={item.key} link={item.link} />
        ),
      )}
    </nav>
  );
}
