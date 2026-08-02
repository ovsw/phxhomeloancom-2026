import assert from "node:assert/strict";
import test from "node:test";
import { transformLegacyFooter } from "./migrate-footer.mjs";

const legacyLink = (key, name, href) => ({
  _key: key,
  _type: "footerColumnLink",
  name,
  url: { _type: "customUrl", external: href, href, openInNewTab: false, type: "external" },
});

const source = {
  _id: "footer",
  _type: "footer",
  columns: [
    {
      _key: "useful-resources",
      _type: "footerColumn",
      links: Array.from({ length: 8 }, (_, index) =>
        legacyLink(`resource-${index}`, `Resource ${index}`, `/resource-${index}/`),
      ),
      title: "Useful Resources",
    },
    {
      _key: "contact-jimmy",
      _type: "footerColumn",
      links: [
        legacyLink("call-jimmy", "480-800-8387", "tel:+14808008387"),
        legacyLink(
          "email-jimmy",
          "jimmy.vercellino@goluminate.com",
          "mailto:jimmy.vercellino@goluminate.com",
        ),
        legacyLink("website", "phxhomeloan.com", "/"),
      ],
      title: "Contact Jimmy",
    },
  ],
  compliance: {
    copyrightOwner: "Luminate Bank, Member FDIC",
    copyrightStartYear: 2019,
    credit: "Website by OVS Websites.",
    disclaimer: "Approved disclaimer.",
    equalHousingLabel: "Equal Housing Lender",
    headline: "Important",
    legalLinks: [legacyLink("terms", "Terms", "/terms"), legacyLink("privacy", "Privacy", "/privacy")],
    nmlsConsumerAccessLabel: "NMLS Consumer Access",
    nmlsConsumerAccessUrl: "https://www.nmlsconsumeraccess.org/",
    organizationNmlsId: "477166",
    organizationPhone: "1-877-505-1281",
  },
};

test("transforms the displayed legacy footer into explicit semantic sections", () => {
  const result = transformLegacyFooter(source);

  assert.equal(result.resources.links.length, 8);
  assert.equal(result.contact.phone.label, "480-800-8387");
  assert.equal(result.contact.nmlsId, "184169");
  assert.equal(result.brand.phone.label, "602-908-5849");
  assert.equal(result.compliance.organizationPhone.label, "1-877-505-1281");
  assert.equal(result.compliance.organizationPhone.destination.external, "tel:+18775051281");
  assert.equal(result.social.links.length, 5);
  assert.equal(result.social.links.find((link) => link._key === "facebook").destination.external, "https://www.facebook.com/TheVercellinoTeam");
  assert.deepEqual(result.brand.addressLines, ["3602 E Campbell Ave,", "Phoenix AZ 85018"]);
  assert.equal("columns" in result, false);
});

test("uses stable source keys rather than editable displayed headings", () => {
  const renamed = structuredClone(source);
  renamed.columns[0].title = "Learning Center";
  renamed.columns[1].title = "Reach Jimmy";

  const result = transformLegacyFooter(renamed);
  assert.equal(result.resources.heading, "Learning Center");
  assert.equal(result.contact.heading, "Reach Jimmy");
});
