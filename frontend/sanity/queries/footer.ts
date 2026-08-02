import { defineQuery } from "next-sanity";

const destinationProjection = `{
  openInNewTab,
  "href": select(
    kind == "internal" => select(
      internal->_id == "blogIndex" => "/blog/",
      internal->_type == "post" && defined(internal->slug.current) => "/blog/" + internal->slug.current + "/",
      internal->slug.current == "index" => "/",
      string::startsWith(internal->slug.current, "/") => internal->slug.current + "/",
      defined(internal->slug.current) => "/" + internal->slug.current + "/"
    ),
    kind == "external" => external
  )
}`;

const linkProjection = `{
  _key,
  label,
  destination${destinationProjection}
}`;

export const FOOTER_QUERY = defineQuery(`
  *[_type == "footer" && _id == "footer"][0]{
    _id,
    brand{
      phone${linkProjection},
      addressLines,
      mapLink${linkProjection}
    },
    resources{
      heading,
      links[]${linkProjection}
    },
    contact{
      heading,
      fullName,
      nmlsId,
      phone${linkProjection},
      email${linkProjection},
      website${linkProjection}
    },
    social{
      heading,
      links[]${linkProjection}
    },
    compliance{
      headline,
      disclaimer,
      nmlsConsumerAccess${linkProjection},
      equalHousingLabel,
      copyrightStartYear,
      copyrightOwner,
      organizationNmlsId,
      organizationPhone${linkProjection},
      credit,
      legalLinks[]${linkProjection}
    }
  }
`);
