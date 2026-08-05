"use client";

/**
 * navbar14's desktop nav, adapted to our Sanity model.
 *
 * Deliberately minimal adaptation: NextLink instead of <a>, our icon-string
 * resolver instead of LucideIcon components, and our nav model instead of its
 * hardcoded props. Everything else — including <NavigationMenu>'s default
 * `viewport` mode, which is what produces the shared morphing panel — is left
 * exactly as the block ships it, so what we judge is the block's behaviour and
 * not my restyling of it.
 */

import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { NavigationIcon } from "@/components/header/navigation-icon";
import type { HeaderNavigationModel } from "@/components/header/model";

export function RadixNav({ navigation }: { navigation: HeaderNavigationModel }) {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigation.items.map((item) => {
          if (item.kind !== "group") {
            return (
              <NavigationMenuItem key={item.key}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href={item.link.href}>{item.label}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            );
          }

          return (
            <NavigationMenuItem key={item.key}>
              <NavigationMenuTrigger>{item.label}</NavigationMenuTrigger>
              <NavigationMenuContent className="p-0">
                <div className="w-[22rem] p-4">
                  <p className="mb-3 text-[10px] uppercase text-muted-foreground">
                    {item.label}
                  </p>
                  {item.links.map((child) => (
                    <NavigationMenuLink asChild key={child.key}>
                      <Link
                        className="group flex cursor-pointer flex-row gap-3"
                        href={child.link.href}
                      >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                          <NavigationIcon name={child.icon} />
                        </span>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium whitespace-nowrap">
                            {child.label}
                          </span>
                          <p className="text-xs text-muted-foreground">{child.description}</p>
                        </div>
                      </Link>
                    </NavigationMenuLink>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          );
        })}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
