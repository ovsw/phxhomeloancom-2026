import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Header } from "./site-header";
import type { HeaderModel, HeaderNavigationModel } from "./model";
import { SITE_HEADER_OFFSET_PROPERTY } from "./site-header-shell";

const navigation: HeaderNavigationModel = {
  items: [
    {
      key: "contact",
      kind: "link",
      label: "Contact",
      link: { href: "/contact", label: "Contact", openInNewTab: false },
    },
    {
      key: "loans",
      kind: "group",
      label: "Loan Types",
      links: [
        {
          key: "va",
          label: "VA Loan",
          description: "Benefits for eligible service members.",
          icon: "shield-check",
          link: {
            href: "/phoenix-va-loan",
            label: "VA Loan",
            openInNewTab: false,
          },
        },
      ],
    },
  ],
  actions: [
    {
      key: "schedule",
      link: {
        href: "https://example.com/book",
        label: "Schedule Consult",
        openInNewTab: true,
      },
    },
  ],
};

const model: HeaderModel = {
  brand: { dark: null, label: "PHX Home Loan", light: null },
  navigation,
};

describe("Site Header", () => {
  it("renders branding, navigation hierarchy, theme control, and safe actions", async () => {
    const user = userEvent.setup();
    render(<Header model={model} />);

    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getAllByRole("navigation", { name: "Main navigation" })).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Contact" })[0]).toHaveAttribute("href", "/contact");
    await user.click(screen.getByRole("button", { name: "Loan Types" }));
    expect(screen.getByText("Benefits for eligible service members.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Toggle theme" }).length).toBeGreaterThan(0);
    const action = screen.getAllByRole("link", { name: "Schedule Consult" })[0];
    expect(action).toHaveAttribute("href", "https://example.com/book");
    expect(action).toHaveAttribute("rel", "noopener noreferrer");
    expect(action).toHaveAttribute("target", "_blank");
    expect(document.querySelector('a[href="#"]')).not.toBeInTheDocument();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("operates a desktop disclosure with Enter and Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<Header model={model} />);
    const trigger = screen.getByRole("button", { name: "Loan Types" });

    trigger.focus();
    await user.keyboard("{Enter}");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /^VA Loan/ })).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveFocus();
  });

  it("opens the mobile Sheet and closes it after navigation", async () => {
    const user = userEvent.setup();
    render(<Header model={model} />);

    await user.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("dialog", { name: "Main navigation" })).toBeInTheDocument();
    await user.click(screen.getAllByRole("link", { name: "Contact" }).at(-1)!);
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Main navigation" })).not.toBeInTheDocument(),
    );
  });

  it("hides on meaningful downward scroll and reveals on upward scroll or focus", () => {
    render(<Header model={model} />);
    const banner = screen.getByRole("banner");
    expect(document.documentElement.style.getPropertyValue(SITE_HEADER_OFFSET_PROPERTY)).toBe(
      "86px",
    );
    Object.defineProperty(window, "scrollY", { configurable: true, value: 200 });
    fireEvent.scroll(window);
    expect(banner).toHaveAttribute("data-visible", "false");
    expect(document.documentElement.style.getPropertyValue(SITE_HEADER_OFFSET_PROPERTY)).toBe(
      "0px",
    );

    Object.defineProperty(window, "scrollY", { configurable: true, value: 150 });
    fireEvent.scroll(window);
    expect(banner).toHaveAttribute("data-visible", "true");

    Object.defineProperty(window, "scrollY", { configurable: true, value: 300 });
    fireEvent.scroll(window);
    expect(banner).toHaveAttribute("data-visible", "false");
    fireEvent.focus(screen.getByRole("link", { name: "Home page" }));
    expect(banner).toHaveAttribute("data-visible", "true");
  });
});
