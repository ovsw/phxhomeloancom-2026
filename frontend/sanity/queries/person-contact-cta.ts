import { groq } from "next-sanity";
import { imageQuery } from "./shared/image";

// @sanity-typegen-ignore
export const personContactCtaQuery = groq`
  _type == "personContactCta" => {
    eyebrow,
    title,
    credentialLine,
    contactMethods[]{
      _key,
      _type,
      type,
      label,
      href
    },
    personImage {
      ${imageQuery}
    }
  }
`;
