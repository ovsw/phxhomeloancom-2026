import { describe, expect, test } from "vitest";
import { NextRequest } from "next/server";

import { HARD_CODED_GONE_ROUTE_PATHS } from "@/lib/gone-routes";
import { config, proxy } from "@/proxy";

const EXPECTED_GONE_ROUTES = [
  "/home-office-ideas-that-will-inspire-you",
  "/staycation-ideas-your-family-will-enjoy",
  "/top-10-interior-design-trends-in-2020-to-freshen-up-your-home",
  "/phoenix-home-loan-payoff-vision-board",
  "/make-home-attractive-before-putting-on-market",
  "/virtual-showings-what-you-need-to-know",
];

describe("legacy 410 Gone routes", () => {
  test("keeps the exact legacy route inventory", () => {
    expect(HARD_CODED_GONE_ROUTE_PATHS).toEqual(EXPECTED_GONE_ROUTES);
    expect(config.matcher).toEqual(["/((?!_next|api|.*\\..*).*)"]);
  });

  test("preserves trailing-slash redirects for ordinary routes", async () => {
    const response = await proxy(
      new NextRequest("https://www.phxhomeloan.com/ordinary-page"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://www.phxhomeloan.com/ordinary-page/",
    );
  });

  test.each(EXPECTED_GONE_ROUTES)("returns 410 for %s with both slash forms", async (route) => {
    for (const pathname of [route, `${route}/`]) {
      const response = await proxy(
        new NextRequest(`https://www.phxhomeloan.com${pathname}`),
      );

      expect(response.status).toBe(410);
      expect(await response.text()).toBe("Gone");
      expect(response.headers.get("content-type")).toBe(
        "text/plain; charset=utf-8",
      );
      expect(response.headers.get("x-robots-tag")).toBe("noindex");
    }
  });
});
