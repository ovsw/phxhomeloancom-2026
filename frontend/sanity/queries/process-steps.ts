import { groq } from "next-sanity";

// @sanity-typegen-ignore
export const processStepsQuery = groq`
  _type == "processSteps" => {
    useCreamBackground,
    eyebrow,
    title,
    intro,
    "steps": array::compact(steps[]{
      _key,
      _type,
      title,
      summary,
      body
    })
  }
`;
