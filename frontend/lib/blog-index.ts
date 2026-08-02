export const BLOG_POSTS_PER_PAGE = 12;

export type BlogPagination = {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
};

export function parseBlogPageSegment(value: string | undefined) {
  if (!value || !/^[1-9]\d*$/.test(value)) return undefined;
  const page = Number(value);
  return Number.isSafeInteger(page) && page > 1 ? page : undefined;
}

export function getBlogPostWindow(page: number) {
  const start = (page - 1) * BLOG_POSTS_PER_PAGE;
  return { start, end: start + BLOG_POSTS_PER_PAGE };
}

export function getRegularPostQueryParams(latestPostId: string, page: number) {
  return { latestPostId, ...getBlogPostWindow(page) };
}

export function isBlogPageOutOfRange(page: number, totalPages: number) {
  return page > 1 && (totalPages === 0 || page > totalPages);
}

export function calculateBlogPagination(
  totalItems: number,
  currentPage: number,
): BlogPagination {
  const totalPages = Math.ceil(totalItems / BLOG_POSTS_PER_PAGE);
  return {
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    itemsPerPage: BLOG_POSTS_PER_PAGE,
    totalItems,
    totalPages,
  };
}

export function getBlogPaginationUrl(page: number) {
  return page === 1 ? "/blog/" : `/blog/${page}/`;
}

export const getBlogCanonicalPath = getBlogPaginationUrl;

export function getBlogPageTitle(title: string, page: number) {
  return page > 1 ? `${title} - Page ${page}` : title;
}

export function getBlogPageDescription(
  description: string | undefined,
  page: number,
) {
  if (!description || page === 1) return description;
  return `${description.trimEnd()} Page ${page}.`;
}

export function getBlogResultsLabel(
  currentPage: number,
  displayedItems: number,
  totalItems: number,
) {
  if (totalItems <= 0 || displayedItems <= 0) return "No posts";
  const start = (currentPage - 1) * BLOG_POSTS_PER_PAGE + 1;
  const end = Math.min(start + displayedItems - 1, totalItems);
  return `Showing ${start}\u2013${end} of ${totalItems} posts`;
}

export function generateBlogPaginationItems(
  currentPage: number,
  totalPages: number,
) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: Array<number | "ellipsis"> = [1];
  if (currentPage > 4) items.push("ellipsis");
  for (
    let page = Math.max(2, currentPage - 2);
    page <= Math.min(totalPages - 1, currentPage + 2);
    page += 1
  ) {
    items.push(page);
  }
  if (currentPage < totalPages - 3) items.push("ellipsis");
  items.push(totalPages);
  return items;
}
