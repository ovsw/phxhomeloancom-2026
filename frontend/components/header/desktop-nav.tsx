"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { cn } from "@/lib/utils";
import { HeaderLink } from "./header-link";
import type { HeaderChildLinkModel, HeaderNavigationItem, HeaderNavigationModel } from "./model";
import { NavigationIcon } from "./navigation-icon";

const primaryLinkClassName =
  "flex min-h-11 items-center whitespace-nowrap rounded-control px-1 typo-nav text-foreground transition-colors motion-fast hover:text-primary focus-ring";

const PANEL_WIDTH = 288;
const CLOSE_DELAY_MS = 120;

/** Panel geometry, measured relative to the nav element. */
type PanelPlacement = {
  /** Left edge of the panel, in px from the nav's left edge. */
  x: number;
  width: number;
  height: number;
};

type ActiveGroup = {
  key: string;
  /** Keyboard/touch opens without motion; only pointer hover animates. */
  animate: boolean;
};

function GroupPanelContent({ links }: { links: HeaderChildLinkModel[] }) {
  return (
    <div className="grid gap-1 p-2">
      {links.map((child) => (
        <HeaderLink
          className="group/nav-link flex items-center gap-3 rounded-control px-4 py-3 transition-colors motion-fast hover:bg-secondary focus-ring"
          key={child.key}
          link={child.link}
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-control bg-secondary text-primary">
            <NavigationIcon name={child.icon} />
          </span>
          <span className="grid gap-0.5">
            <span className="typo-nav font-semibold text-popover-foreground">{child.label}</span>
            <span className="line-clamp-2 typo-fine-print text-muted-foreground">
              {child.description}
            </span>
          </span>
        </HeaderLink>
      ))}
    </div>
  );
}

export default function DesktopNav({ navigation }: { navigation: HeaderNavigationModel }) {
  const [active, setActive] = useState<ActiveGroup | null>(null);
  const [placement, setPlacement] = useState<PanelPlacement | null>(null);
  /** True once the panel has been positioned at least once, so the first open fades in place. */
  const hasPlacement = useRef(false);

  const navRef = useRef<HTMLElement>(null);
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const contentRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const panelIdBase = useId();

  const groups = useMemo(
    () =>
      navigation.items.filter(
        (item): item is Extract<HeaderNavigationItem, { kind: "group" }> => item.kind === "group",
      ),
    [navigation.items],
  );
  const activeItem = groups.find((group) => group.key === active?.key) ?? null;

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  }, []);

  const openGroup = useCallback(
    (key: string, animate: boolean) => {
      cancelClose();
      setActive((current) => {
        if (current?.key === key) return current;
        // Moving between triggers animates; the first open of a cold panel does not.
        return { key, animate: animate && hasPlacement.current };
      });
    },
    [cancelClose],
  );

  const closeGroup = useCallback(() => {
    cancelClose();
    setActive(null);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setActive(null), CLOSE_DELAY_MS);
  }, [cancelClose]);

  useEffect(() => cancelClose, [cancelClose]);

  // Measure the active trigger and its content, then place the shared panel.
  // jsdom reports zeros here; the panel still renders, it just sits at the origin.
  useLayoutEffect(() => {
    if (!active) {
      hasPlacement.current = false;
      return;
    }

    const nav = navRef.current;
    const trigger = triggerRefs.current.get(active.key);
    if (!nav || !trigger) return;

    const measure = () => {
      const navBox = nav.getBoundingClientRect();
      const triggerBox = trigger.getBoundingClientRect();
      const width = PANEL_WIDTH;
      const height = contentRef.current?.offsetHeight ?? 0;

      const triggerCenter = triggerBox.left - navBox.left + triggerBox.width / 2;
      const maxX = Math.max(0, navBox.width - width);
      const x = Math.min(Math.max(triggerCenter - width / 2, 0), maxX);

      setPlacement((current) =>
        current && current.x === x && current.width === width && current.height === height
          ? current
          : { height, width, x },
      );
      hasPlacement.current = true;
    };

    measure();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    if (contentRef.current) observer.observe(contentRef.current);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [active]);

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeGroup();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape" && active) {
      event.preventDefault();
      const trigger = triggerRefs.current.get(active.key);
      closeGroup();
      trigger?.focus();
    }
  };

  /** Sliding between triggers animates; a cold open lands in place. */
  const animated = Boolean(active?.animate) && !prefersReducedMotion;
  /** Morph transition for the panel's x and height. */
  const morph = animated
    ? { damping: 30, mass: 0.6, stiffness: 380, type: "spring" as const }
    : { duration: 0 };
  /** The fade always runs, otherwise a cold open would render at opacity 0. */
  const fade = { duration: prefersReducedMotion ? 0 : 0.14 };

  return (
    <nav
      aria-label="Main navigation"
      className="relative hidden items-center gap-3 lg:flex xl:gap-8"
      onBlur={onBlur}
      onKeyDown={onKeyDown}
      onMouseLeave={scheduleClose}
      ref={navRef}
    >
      {navigation.items.map((item) => {
        if (item.kind !== "group") {
          return <HeaderLink className={primaryLinkClassName} key={item.key} link={item.link} />;
        }

        const isActive = active?.key === item.key;
        return (
          <button
            aria-controls={isActive ? panelIdBase : undefined}
            aria-expanded={isActive}
            className={cn(
              primaryLinkClassName,
              // Wider than the shared px-1 so the active background reads as a
              // deliberate pill rather than a tight smudge around the label.
              "gap-1 px-2.5",
              // The open group is denoted by background rather than a caret, in the
              // panel's own surface colour so the trigger and the panel below it
              // read as one continuous shape. bg-popover is deliberately the same
              // token the panel uses, not a matching literal, so the two cannot
              // drift apart across themes.
              //
              // Not bg-secondary: that token is cream, and so is the header, so the
              // pill measured 1.04:1 against its own backdrop and disappeared. The
              // panel's links get away with it only because they sit on the popover.
              //
              // hover:text-primary has to be overridden rather than merely followed:
              // an open trigger is by definition the hovered one, and the teal label
              // is what the closed triggers use, so leaving it would blur the very
              // distinction this background exists to draw.
              isActive &&
                "bg-popover text-popover-foreground shadow-menu-layer hover:text-popover-foreground",
            )}
            key={item.key}
            onClick={(event) => {
              // event.detail === 0 means keyboard activation (Enter/Space).
              if (event.detail === 0) {
                if (isActive) closeGroup();
                else openGroup(item.key, false);
              } else {
                openGroup(item.key, false);
              }
            }}
            onMouseEnter={() => openGroup(item.key, true)}
            ref={(node) => {
              if (node) triggerRefs.current.set(item.key, node);
              else triggerRefs.current.delete(item.key);
            }}
            type="button"
          >
            {item.label}
            <ChevronDown
              aria-hidden="true"
              className={cn("size-3 transition-transform motion-fast", isActive && "rotate-180")}
            />
          </button>
        );
      })}

      {/*
        A single persistent panel. Keying this element per group would remount it
        and restart the animation from scratch, which is what kills the follow-along.

        Position comes from motion's inline `x`, not `-translate-x-1/2`, so the
        reduced-motion guard in globals.css (which zeroes named lift utilities)
        never touches this placement. Reduced motion is handled in JS instead:
        `prefersReducedMotion` collapses every duration to zero.
      */}
      <AnimatePresence>
        {activeItem ? (
          <motion.div
            animate={{
              opacity: 1,
              x: placement?.x ?? 0,
              y: 0,
            }}
            className="absolute left-0 top-full z-[70] pt-0.5"
            exit={{ opacity: 0, transition: fade, y: -4 }}
            id={panelIdBase}
            initial={{ opacity: 0, x: placement?.x ?? 0, y: -4 }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{ width: PANEL_WIDTH }}
            transition={{ opacity: fade, x: morph, y: fade }}
          >
            <motion.div
              animate={{ height: placement?.height ?? "auto" }}
              className="relative overflow-hidden rounded-card border border-border bg-popover text-popover-foreground shadow-menu-layer dark:shadow-[0_18px_44px_rgba(0,0,0,0.28)]"
              initial={false}
              transition={morph}
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: animated ? 0 : 1 }}
                  key={activeItem.key}
                  ref={contentRef}
                  transition={{ duration: prefersReducedMotion || !animated ? 0 : 0.16 }}
                >
                  <GroupPanelContent links={activeItem.links} />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
}
