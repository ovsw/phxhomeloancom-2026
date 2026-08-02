import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "./site-footer";
import type { FooterModel } from "./model";

const link = (key: string, label: string, href: string, openInNewTab = false) => ({
  key,
  label,
  href,
  openInNewTab,
});

const model: FooterModel = {
  brand: {
    label: "PHX Home Loan",
    image: null,
    phone: link("brand-phone", "602-908-5849", "tel:+16029085849"),
    addressLines: ["3602 E Campbell Ave,", "Phoenix AZ 85018"],
    mapLink: link("map", "Google Maps", "https://maps.example.com", true),
    organizationNmlsId: "477166",
  },
  resources: {
    heading: "Useful Resources",
    links: [link("c2p", "Construction-to-Permanent Loan", "/construction-to-permanent-loan/")],
  },
  contact: {
    heading: "Contact Jimmy",
    fullName: "Jimmy Vercellino",
    nmlsId: "184169",
    phone: link("jimmy-phone", "480-800-8387", "tel:+14808008387"),
    email: link("email", "jimmy.vercellino@goluminate.com", "mailto:jimmy.vercellino@goluminate.com"),
    website: link("website", "phxhomeloan.com", "/"),
  },
  social: { heading: "Follow", links: [link("youtube", "YouTube", "https://youtube.com", true)] },
  compliance: {
    headline: "Important",
    disclaimer: "Approved mortgage disclaimer.",
    nmlsConsumerAccess: link("nmls", "NMLS Consumer Access", "https://nmls.example.com", true),
    equalHousingLabel: "Equal Housing Lender",
    copyrightYears: "2019-2026",
    copyrightOwner: "Luminate Bank, Member FDIC",
    organizationNmlsId: "477166",
    organizationPhone: link("org-phone", "1-877-505-1281", "tel:+18775051281"),
    credit: "Website by OVS Websites.",
    legalLinks: [link("privacy", "Privacy Policy", "/privacy")],
  },
};

describe("Site Footer", () => {
  it("renders the complete semantic footer contract with authored labels", () => {
    render(<SiteFooter model={model} />);

    const footer = screen.getByRole("contentinfo");
    expect(within(footer).getByRole("heading", { name: "Site footer" })).toBeInTheDocument();
    expect(within(footer).getByRole("heading", { name: "Useful Resources" })).toBeInTheDocument();
    expect(within(footer).getByRole("heading", { name: "Contact Jimmy" })).toBeInTheDocument();
    expect(within(footer).getByRole("heading", { name: "Follow" })).toBeInTheDocument();
    expect(within(footer).getByRole("heading", { name: "Important" })).toBeInTheDocument();
    expect(within(footer).getByRole("link", { name: "Home page" })).toHaveAttribute("href", "/");
    expect(within(footer).getByRole("link", { name: "Construction-to-Permanent Loan" })).toHaveAttribute(
      "href",
      "/construction-to-permanent-loan",
    );
    expect(within(footer).getByText("Approved mortgage disclaimer.")).toBeInTheDocument();
    expect(within(footer).getByText("Equal Housing Lender")).toBeInTheDocument();
    expect(within(footer).getByText(/2019-2026 Luminate Bank/)).toBeInTheDocument();
    expect(document.querySelector('a[href="#"]')).not.toBeInTheDocument();
  });

  it("uses safe configured target behavior for external destinations", () => {
    render(<SiteFooter model={model} />);

    for (const name of ["YouTube", "Google Maps", "NMLS Consumer Access"]) {
      const external = screen.getByRole("link", { name });
      expect(external).toHaveAttribute("target", "_blank");
      expect(external).toHaveAttribute("rel", "noopener noreferrer");
    }
    expect(screen.getByRole("link", { name: "Privacy Policy" })).not.toHaveAttribute("target");
  });
});
