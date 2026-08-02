import Image from "next/image";
import Link from "next/link";
import type { FooterLinkModel, FooterModel } from "./model";
import { FooterLink } from "./footer-link";

const headingClassName =
  "mb-5 text-[13px] font-semibold uppercase leading-none tracking-[0.18em] text-white/70";

function LinkList({ links }: { links: FooterLinkModel[] }) {
  return (
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.key}>
          <FooterLink link={link} />
        </li>
      ))}
    </ul>
  );
}

export function SiteFooter({ model }: { model: FooterModel }) {
  return (
    <footer className="bg-[#0c1329] pt-16 text-white md:pt-[5.5rem]" data-footer-state="ready">
      <section
        aria-labelledby="site-footer-heading"
        className="mx-auto w-full max-w-7xl px-4 md:px-10"
      >
        <h2 className="sr-only" id="site-footer-heading">
          Site footer
        </h2>
        <div className="grid gap-12 pb-16 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-14">
          <section aria-labelledby="footer-brand-heading" className="flex flex-col gap-5">
            <h3 className="sr-only" id="footer-brand-heading">
              {model.brand.label}
            </h3>
            <Link
              aria-label="Home page"
              className="w-fit rounded-[10px] bg-white px-[18px] py-3.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#feb77d] focus-visible:ring-offset-4 focus-visible:ring-offset-[#0c1329]"
              href="/"
            >
              {model.brand.image ? (
                <Image
                  alt=""
                  className="h-16 w-auto max-w-[10rem] object-contain"
                  height={model.brand.image.height}
                  priority
                  quality={100}
                  src={model.brand.image.src}
                  width={model.brand.image.width}
                />
              ) : (
                <span className="text-lg font-semibold text-[#0c1329]">{model.brand.label}</span>
              )}
            </Link>
            <div className="text-[14.5px] leading-[1.7] text-white/75">
              <p>NMLS ID {model.brand.organizationNmlsId}</p>
              <p>
                Call: <FooterLink className="inline text-white/90" link={model.brand.phone} />
              </p>
              <address className="not-italic">
                {model.brand.addressLines.map((line) => (
                  <span className="block" key={line}>
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </section>

          <section aria-labelledby="footer-resources-heading">
            <h3 className={headingClassName} id="footer-resources-heading">
              {model.resources.heading}
            </h3>
            <LinkList links={model.resources.links} />
          </section>

          <section aria-labelledby="footer-contact-heading">
            <h3 className={headingClassName} id="footer-contact-heading">
              {model.contact.heading}
            </h3>
            <div className="flex flex-col gap-3 text-[14.5px] leading-[1.5] text-white/80">
              <p className="font-semibold text-white">
                {model.contact.fullName}
                <br />
                <span className="text-[13px] font-normal text-white/70">
                  NMLS# {model.contact.nmlsId}
                </span>
              </p>
              <FooterLink link={model.contact.phone} />
              <FooterLink link={model.contact.email} />
              <FooterLink link={model.contact.website} />
            </div>
          </section>

          <section aria-labelledby="footer-social-heading">
            <h3 className={headingClassName} id="footer-social-heading">
              {model.social.heading}
            </h3>
            <LinkList links={[...model.social.links, model.brand.mapLink]} />
          </section>
        </div>

        <section
          aria-labelledby="footer-compliance-heading"
          className="border-t border-white/15 py-8 text-[12.5px] text-white/75"
        >
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
            <div>
              <h3 className="sr-only" id="footer-compliance-heading">
                {model.compliance.headline}
              </h3>
              <p className="max-w-[53.75rem] leading-[1.7] text-white/70">
                {model.compliance.disclaimer}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <FooterLink
                className="rounded-md border border-white/35 px-3 py-2 text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-white/80 hover:border-white/60"
                link={model.compliance.nmlsConsumerAccess}
              />
              <span className="inline-flex min-h-8 items-center rounded-md border border-white/35 px-3 text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-white/80">
                {model.compliance.equalHousingLabel}
              </span>
            </div>
          </div>
          <div className="mt-8 border-t border-white/15 pt-6">
            <p className="leading-[1.6] text-white/65">
              © {model.compliance.copyrightYears} {model.compliance.copyrightOwner}. NMLS ID{" "}
              {model.compliance.organizationNmlsId}. Call:{" "}
              <FooterLink
                className="inline text-[12.5px] leading-[1.6] text-white/75"
                link={model.compliance.organizationPhone}
              />
              . All rights reserved.
              {model.compliance.credit ? ` | ${model.compliance.credit}` : ""}
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
              {model.compliance.legalLinks.map((link) => (
                <li key={link.key}>
                  <FooterLink className="text-[12.5px] leading-[1.6] text-white/65" link={link} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      </section>
    </footer>
  );
}
