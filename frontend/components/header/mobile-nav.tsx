"use client";

import { Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HeaderLink } from "./header-link";
import type { HeaderNavigationModel } from "./model";
import { NavigationIcon } from "./navigation-icon";

const mobileLinkClassName =
  "flex min-h-11 items-center rounded-md px-3 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export default function MobileNav({
  brand,
  navigation,
}: {
  brand: ReactNode;
  navigation: HeaderNavigationModel;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button aria-label="Open menu" className="min-h-11 min-w-11" size="icon" variant="ghost">
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full gap-0 border-l border-border/80 bg-background px-0 sm:max-w-sm">
        <SheetHeader className="flex-row items-center justify-between border-b border-border/80 px-6 py-4 pr-14">
          <div className="flex h-10 max-w-40 items-center [&_img]:max-h-10">{brand}</div>
          <SheetTitle className="sr-only">Main navigation</SheetTitle>
          <SheetDescription className="sr-only">
            Browse primary destinations and mortgage resources.
          </SheetDescription>
        </SheetHeader>
        <nav aria-label="Main navigation" className="grid flex-1 content-start gap-1 overflow-y-auto px-3 py-4">
          <Accordion collapsible type="single">
            {navigation.items.map((item) =>
              item.kind === "link" ? (
                <HeaderLink className={mobileLinkClassName} key={item.key} link={item.link} onClick={close} />
              ) : (
                <AccordionItem className="border-b-0" key={item.key} value={item.key}>
                  <AccordionTrigger className="min-h-11 rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary hover:no-underline">
                    {item.label}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="ml-4 grid gap-1 border-l border-border pl-3">
                      {item.links.map((child) => (
                        <HeaderLink
                          className="flex min-h-11 items-start gap-3 rounded-md p-3 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          key={child.key}
                          link={child.link}
                          onClick={close}
                        >
                          <span className="mt-0.5 text-primary">
                            <NavigationIcon name={child.icon} />
                          </span>
                          <span className="grid gap-1">
                            <span className="font-medium text-foreground">{child.label}</span>
                            <span className="text-xs leading-5 text-muted-foreground">{child.description}</span>
                          </span>
                        </HeaderLink>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ),
            )}
          </Accordion>
        </nav>
        {navigation.actions.length ? (
          <SheetFooter className="border-t border-border/80 p-4">
            {navigation.actions.map((action) => (
              <HeaderLink
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                key={action.key}
                link={action.link}
                onClick={close}
              />
            ))}
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
