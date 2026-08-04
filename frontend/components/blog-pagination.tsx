import {
  generateBlogPaginationItems,
  getBlogPaginationUrl,
  type BlogPagination as BlogPaginationData,
} from "@/lib/blog-index";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function BlogPagination({ pagination }: { pagination: BlogPaginationData }) {
  if (pagination.totalPages <= 1) return null;
  const items = generateBlogPaginationItems(
    pagination.currentPage,
    pagination.totalPages,
  );
  const buttonClass =
    "inline-flex min-h-9 min-w-10 items-center justify-center rounded-[9px] border-[1.5px] border-slate-200 bg-white px-4 text-sm font-semibold leading-none text-slate-950 transition-colors hover:bg-slate-50";

  return (
    <nav aria-label="Pagination" className="mt-14 flex flex-wrap items-center justify-center gap-2">
      {pagination.hasPreviousPage ? (
        <Link className={buttonClass} href={getBlogPaginationUrl(pagination.currentPage - 1)}>
          {"\u2190"} Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(buttonClass, "opacity-40")}>{"\u2190"} Previous</span>
      )}
      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span aria-hidden="true" className="inline-flex min-h-9 min-w-10 items-center justify-center text-slate-500" key={`ellipsis-${index}`}>...</span>
        ) : (
          <Link
            aria-current={item === pagination.currentPage ? "page" : undefined}
            aria-label={`Go to page ${item}`}
            className={cn(buttonClass, "px-0", item === pagination.currentPage && "border-cyan-800 bg-cyan-800 text-white hover:bg-cyan-700")}
            href={getBlogPaginationUrl(item)}
            key={item}
          >
            {item}
          </Link>
        ),
      )}
      {pagination.hasNextPage ? (
        <Link className={buttonClass} href={getBlogPaginationUrl(pagination.currentPage + 1)}>
          Next {"\u2192"}
        </Link>
      ) : (
        <span aria-disabled="true" className={cn(buttonClass, "opacity-40")}>Next {"\u2192"}</span>
      )}
    </nav>
  );
}
