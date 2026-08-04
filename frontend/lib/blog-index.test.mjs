import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  BLOG_POSTS_PER_PAGE,
  calculateBlogPagination,
  getBlogCanonicalPath,
  getBlogPageTitle,
  getBlogPaginationUrl,
  getBlogPostWindow,
  getRegularPostQueryParams,
  getBlogResultsLabel,
  parseBlogPageSegment,
  isBlogPageOutOfRange,
} from "./blog-index.ts";

test("keeps 12 regular posts per page and calculates five pages for 57 posts", () => {
  assert.equal(BLOG_POSTS_PER_PAGE, 12);
  assert.deepEqual(calculateBlogPagination(57, 1), {
    currentPage: 1,
    hasNextPage: true,
    hasPreviousPage: false,
    itemsPerPage: 12,
    totalItems: 57,
    totalPages: 5,
  });
});

test("calculates regular-post query windows independently of the latest post", () => {
  assert.deepEqual(getBlogPostWindow(1), { end: 12, start: 0 });
  assert.deepEqual(getBlogPostWindow(2), { end: 24, start: 12 });
  assert.deepEqual(getBlogPostWindow(5), { end: 60, start: 48 });
});

test("passes the latest post ID as an explicit regular-list exclusion", () => {
  assert.deepEqual(getRegularPostQueryParams("latest-post", 2), {
    end: 24,
    latestPostId: "latest-post",
    start: 12,
  });
});

test("the regular-post GROQ excludes the one latest post and uses deterministic ordering", () => {
  const source = readFileSync(
    new URL("../sanity/queries/blog-index.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /_id != \$latestPostId/);
  assert.match(source, /publishedAt desc, _createdAt desc, _id asc/);
  assert.match(source, /order\(\$\{blogPostOrder\}\)\[0\]/);
});

test("listing cards clamp excerpts and expose every visible post field to Presentation", () => {
  const cardSource = readFileSync(
    new URL("../components/blog-card.tsx", import.meta.url),
    "utf8",
  );
  const querySource = readFileSync(
    new URL("../sanity/queries/blog-index.ts", import.meta.url),
    "utf8",
  );

  assert.equal(cardSource.match(/line-clamp-3/g)?.length, 2);
  for (const path of ["excerpt", "image", "publishedAt", "title"]) {
    assert.match(cardSource, new RegExp(`dataAttribute\\?\\.\\("${path}"\\)`));
  }
  assert.match(cardSource, /categoryDataAttribute\?\.\("title"\)/);
  assert.match(cardSource, /!stega \? <span className="absolute inset-0" \/> : null/);
  assert.match(querySource, /categories\[\]\->\{_id, title\}/);
});

test("accepts only pagination route segments greater than one", () => {
  assert.equal(parseBlogPageSegment("2"), 2);
  assert.equal(parseBlogPageSegment("12"), 12);
  for (const value of ["1", "0", "-1", "1.5", "two", "02", "", undefined]) {
    assert.equal(parseBlogPageSegment(value), undefined);
  }
});

test("rejects page one aliases and pages beyond the regular-list total", () => {
  assert.equal(isBlogPageOutOfRange(1, 0), false);
  assert.equal(isBlogPageOutOfRange(2, 0), true);
  assert.equal(isBlogPageOutOfRange(5, 5), false);
  assert.equal(isBlogPageOutOfRange(6, 5), true);
});

test("builds trailing-slash pagination URLs and self-canonical paths", () => {
  assert.equal(getBlogPaginationUrl(1), "/blog/");
  assert.equal(getBlogPaginationUrl(2), "/blog/2/");
  assert.equal(getBlogCanonicalPath(1), "/blog/");
  assert.equal(getBlogCanonicalPath(3), "/blog/3/");
});

test("makes metadata titles unique after page one", () => {
  assert.equal(getBlogPageTitle("Mortgage insights", 1), "Mortgage insights");
  assert.equal(getBlogPageTitle("Mortgage insights", 2), "Mortgage insights - Page 2");
});

test("reports result counts for the regular collection only", () => {
  assert.equal(getBlogResultsLabel(1, 12, 57), "Showing 1–12 of 57 posts");
  assert.equal(getBlogResultsLabel(5, 9, 57), "Showing 49–57 of 57 posts");
  assert.equal(getBlogResultsLabel(1, 0, 0), "No posts");
});
