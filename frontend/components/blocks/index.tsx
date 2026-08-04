import { PAGE_QUERY_RESULT } from "@/sanity.types";
import { type LivePerspective } from "next-sanity/live";
import Hero1 from "@/components/blocks/hero/hero-1";

type Block = NonNullable<NonNullable<PAGE_QUERY_RESULT>["blocks"]>[number];

const componentMap: {
  [K in Block["_type"]]: React.ComponentType<
    Extract<Block, { _type: K }>
  >;
} = {
  "hero-1": Hero1,
};

export default function Blocks({
  blocks,
}: {
  blocks: Block[];
  perspective: LivePerspective;
  stega: boolean;
}) {
  return (
    <>
      {blocks?.map((block) => {
        const Component = componentMap[
          block._type
        ] as React.ComponentType<Block>;
        if (!Component) {
          // Fallback for development/debugging of new component types
          console.warn(
            `No component implemented for block type: ${block._type}`,
          );
          return <div data-type={block._type} key={block._key} />;
        }
        return <Component {...block} key={block._key} />;
      })}
    </>
  );
}
