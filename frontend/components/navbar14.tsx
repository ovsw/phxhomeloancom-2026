"use client";

import {
  Award,
  BarChart3,
  Bell,
  Book,
  BookOpen,
  Brain,
  ChevronRight,
  FileCode,
  FileText,
  GraduationCap,
  MessageSquare,
  Users,
  Video,
} from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { useState } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  href: string;
  description?: string;
  icon: LucideIcon;
}

interface FeaturedContent {
  title: string;
  description: string;
  href: string;
  image: {
    src: string;
    alt: string;
  };
}

interface MenuSection {
  label: string;
  items: MenuItem[];
}

interface MegaMenu {
  label: string;
  sections: MenuSection[];
  featured?: FeaturedContent;
}

interface Navbar14Props {
  logo?: {
    src: string;
    alt: string;
    href?: string;
    title?: string;
  };
  menus?: MegaMenu[];
  links?: { label: string; href: string }[];
  auth?: {
    login: { label: string; href: string };
    signup: { label: string; href: string };
  };
  className?: string;
}

const Navbar14 = ({
  logo = {
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo.svg",
    alt: "logo",
    href: "#",
    title: "Shadcnblocks",
  },
  menus = [
    {
      label: "Products",
      sections: [
        {
          label: "Tools",
          items: [
            {
              title: "Course Management & Content",
              description: "Create, organize and deliver courses",
              icon: GraduationCap,
              href: "#",
            },
            {
              title: "Student Analytics",
              description: "Track progress and performance data",
              icon: BarChart3,
              href: "#",
            },
            {
              title: "Interactive Learning",
              description: "Engage students with multimedia content",
              icon: Video,
              href: "#",
            },
            {
              title: "AI-Powered Tutoring",
              description: "Personalized learning with AI assistance",
              icon: Brain,
              href: "#",
            },
            {
              title: "Collaboration & Discussion",
              description: "Connect students and instructors seamlessly",
              icon: MessageSquare,
              href: "#",
            },
            {
              title: "Assessments & Certification",
              description: "Evaluate learning with comprehensive testing",
              icon: Award,
              href: "#",
            },
          ],
        },
        {
          label: "Quick Start",
          items: [
            {
              title: "Shadcnblocks 101",
              icon: BookOpen,
              href: "#",
            },
            {
              title: "Find a tutor",
              icon: Users,
              href: "#",
            },
          ],
        },
      ],
      featured: {
        title: "One Platform. Every Learner.",
        description: "Personalized learning paths for every student.",
        href: "#",
        image: {
          src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg",
          alt: "Featured content",
        },
      },
    },
    {
      label: "Support",
      sections: [
        {
          label: "Guides",
          items: [
            {
              title: "Learning Center",
              description: "Discover how to use EduMax effectively",
              icon: Book,
              href: "#",
            },
            {
              title: "Course Catalog",
              description: "Browse our comprehensive course library",
              icon: BookOpen,
              href: "#",
            },
            {
              title: "API Documentation",
              description: "Integrate EduMax into your platform",
              icon: FileCode,
              href: "#",
            },
          ],
        },
        {
          label: "About Us",
          items: [
            { title: "Platform Updates", icon: FileText, href: "#" },
            { title: "News & Events", icon: Bell, href: "#" },
            { title: "Education Blog", icon: Book, href: "#" },
            { title: "Join Our Team", icon: Users, href: "#" },
          ],
        },
      ],
    },
  ],
  links = [{ label: "About", href: "#" }],
  auth = {
    login: { label: "Login", href: "#" },
    signup: { label: "Demo", href: "#" },
  },
  className,
}: Navbar14Props) => {
  const [isOpen, setIsOpen] = useState(false);

  const hasDescription = (items: MenuItem[]) =>
    items.some((item) => item.description);

  return (
    <section
      className={cn(
        "border-b border-border bg-background lg:border-b",
        isOpen && "fixed inset-0 z-50 flex h-dvh flex-col border-b-0",
        className,
      )}
    >
      <div className="container mx-auto">
        <nav className="flex items-center justify-between py-4">
          <div className="flex flex-1 items-center gap-9">
            <a href={logo.href} className="flex items-center gap-2">
              <img src={logo.src} alt={logo.alt} className="h-8 dark:invert" />
              {logo.title && (
                <span className="text-lg font-semibold">{logo.title}</span>
              )}
            </a>
            <div className="hidden items-center gap-1.5 lg:flex">
              <NavigationMenu>
                <NavigationMenuList>
                  {menus.map((menu) => (
                    <NavigationMenuItem key={menu.label}>
                      <NavigationMenuTrigger>
                        {menu.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="p-0">
                        <div className="flex">
                          <div className="p-4">
                            {menu.sections
                              .filter((s) => hasDescription(s.items))
                              .map((section, i) => (
                                <div key={section.label}>
                                  {i > 0 && <Separator className="my-3" />}
                                  <p className="mb-3 text-[10px] text-muted-foreground uppercase">
                                    {section.label}
                                  </p>
                                  {section.items.map((item) => (
                                    <NavigationMenuLink
                                      key={item.title}
                                      asChild
                                    >
                                      <a
                                        href={item.href}
                                        className="group flex cursor-pointer flex-row gap-3"
                                      >
                                        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                                          <item.icon className="size-5!" />
                                        </span>
                                        <div className="flex flex-col">
                                          <span className="flex items-center gap-0.5 text-sm font-medium whitespace-nowrap">
                                            {item.title}
                                            <ChevronRight className="size-4 text-primary! opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100" />
                                          </span>
                                          {item.description && (
                                            <p className="text-xs whitespace-nowrap text-muted-foreground">
                                              {item.description}
                                            </p>
                                          )}
                                        </div>
                                      </a>
                                    </NavigationMenuLink>
                                  ))}
                                </div>
                              ))}
                          </div>
                          <Separator
                            orientation="vertical"
                            className="data-[orientation=vertical]:h-auto"
                          />
                          <div
                            className={cn(
                              "p-4",
                              menu.featured && "w-64 shrink-0",
                            )}
                          >
                            {menu.sections
                              .filter((s) => !hasDescription(s.items))
                              .map((section, i) => (
                                <div key={section.label}>
                                  {i > 0 && (
                                    <p className="mt-5 mb-3 text-[10px] text-muted-foreground uppercase">
                                      {section.label}
                                    </p>
                                  )}
                                  {i === 0 && (
                                    <p className="mb-3 text-[10px] text-muted-foreground uppercase">
                                      {section.label}
                                    </p>
                                  )}
                                  <div>
                                    {section.items.map((item) => (
                                      <NavigationMenuLink
                                        key={item.title}
                                        asChild
                                      >
                                        <a
                                          href={item.href}
                                          className="flex flex-row items-center gap-3"
                                        >
                                          <item.icon className="size-4!" />
                                          <span className="text-sm font-medium whitespace-nowrap">
                                            {item.title}
                                          </span>
                                        </a>
                                      </NavigationMenuLink>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            {menu.featured && (
                              <>
                                <p className="mt-5 mb-3 text-[10px] text-muted-foreground uppercase">
                                  Latest Updates
                                </p>
                                <NavigationMenuLink asChild>
                                  <a href={menu.featured.href}>
                                    <div className="rounded-lg bg-primary p-3">
                                      <img
                                        src={menu.featured.image.src}
                                        alt={menu.featured.image.alt}
                                        className="aspect-video w-full rounded-md object-cover"
                                      />
                                    </div>
                                  </a>
                                </NavigationMenuLink>
                                <div className="mt-2 flex flex-col gap-1 px-1">
                                  <p className="text-xs font-medium">
                                    {menu.featured.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {menu.featured.description}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ))}
                  {links.map((link) => (
                    <NavigationMenuItem key={link.label}>
                      <NavigationMenuLink
                        asChild
                        className={navigationMenuTriggerStyle()}
                      >
                        <a href={link.href}>{link.label}</a>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="outline" asChild>
              <a href={auth.login.href}>{auth.login.label}</a>
            </Button>
            <Button asChild>
              <a href={auth.signup.href}>{auth.signup.label}</a>
            </Button>
          </div>

          <button
            className="flex size-10 items-center justify-center rounded-md border lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <div className="flex w-3.5 flex-col gap-1">
              <span
                className={cn(
                  "h-[1.5px] w-full origin-center rounded-full bg-foreground transition-all duration-300",
                  isOpen && "translate-y-[5.5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "h-[1.5px] w-full origin-center rounded-full bg-foreground transition-all duration-300",
                  isOpen && "scale-x-0 opacity-0",
                )}
              />
              <span
                className={cn(
                  "h-[1.5px] w-full origin-center rounded-full bg-foreground transition-all duration-300",
                  isOpen && "-translate-y-[5.5px] -rotate-45",
                )}
              />
            </div>
          </button>
        </nav>
      </div>

      {isOpen && (
        <div className="flex min-h-0 flex-1 animate-in flex-col overflow-y-auto border-t bg-background duration-200 fade-in slide-in-from-top-2 lg:hidden">
          <Accordion className="w-full">
            {menus.map((menu) => (
              <AccordionItem
                key={menu.label}
                value={menu.label}
                className="border-b"
              >
                <AccordionTrigger className="container mx-auto items-center pr-10 text-base font-medium hover:no-underline">
                  {menu.label}
                </AccordionTrigger>
                <AccordionContent className="container mx-auto [&_a]:no-underline">
                  <div className="space-y-5">
                    {menu.sections.map((section, i) => (
                      <div key={section.label}>
                        {i > 0 && <Separator className="mb-5" />}
                        <p className="mb-3 text-[10px] text-muted-foreground uppercase">
                          {section.label}
                        </p>
                        <div className="space-y-5">
                          {section.items.map((item) => (
                            <a
                              key={item.title}
                              href={item.href}
                              className={cn(
                                "flex cursor-pointer flex-row gap-3 rounded-md transition-colors",
                                !item.description && "items-center",
                              )}
                              onClick={() => setIsOpen(false)}
                            >
                              {item.description ? (
                                <>
                                  <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
                                    <item.icon className="size-4" />
                                  </span>
                                  <div className="flex min-w-0 flex-col">
                                    <span className="text-sm leading-tight font-medium">
                                      {item.title}
                                    </span>
                                    <p className="text-xs leading-tight text-muted-foreground">
                                      {item.description}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <item.icon className="size-4" />
                                  <span className="text-sm font-medium">
                                    {item.title}
                                  </span>
                                </>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                    {menu.featured && (
                      <>
                        <Separator />
                        <div>
                          <p className="mb-3 text-[10px] text-muted-foreground uppercase">
                            Latest Updates
                          </p>
                          <a
                            href={menu.featured.href}
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="rounded-lg bg-primary p-3">
                              <img
                                src={menu.featured.image.src}
                                alt={menu.featured.image.alt}
                                className="aspect-video w-full rounded-md object-cover"
                              />
                            </div>
                          </a>
                          <div className="mt-2 flex flex-col gap-1 px-1">
                            <span className="text-xs font-medium">
                              {menu.featured.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {menu.featured.description}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block border-b border-border py-4 text-base font-medium transition-colors"
            >
              <span className="container mx-auto block">{link.label}</span>
            </a>
          ))}

          <div className="container mx-auto mt-auto flex flex-col gap-2 py-8">
            <Button variant="outline" className="w-full" asChild>
              <a href={auth.login.href}>{auth.login.label}</a>
            </Button>
            <Button className="w-full" asChild>
              <a href={auth.signup.href}>{auth.signup.label}</a>
            </Button>
          </div>
        </div>
      )}
    </section>
  );
};

export { Navbar14 };
