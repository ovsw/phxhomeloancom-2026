import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";

import { HARD_CODED_GONE_ROUTE_PATHS } from "@/lib/gone-routes";
import { config, proxy } from "@/proxy";

const { fetchMock } = vi.hoisted(() => ({ fetchMock: vi.fn() }));

vi.mock("@/sanity/lib/client", () => ({
  client: { fetch: fetchMock },
}));

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

describe("blog post count cache", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  test("does not query Sanity for the main blog route", async () => {
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.phxhomeloan.com/blog/"),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("does not query Sanity for validated draft-mode pagination", async () => {
    vi.stubEnv("__NEXT_PREVIEW_MODE_ID", "preview-id");
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.phxhomeloan.com/blog/2/", {
        headers: { cookie: "__prerender_bypass=preview-id" },
      }),
    );

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test("returns 404 when a pagination route is out of range", async () => {
    fetchMock.mockResolvedValueOnce(1);
    const { proxy: freshProxy } = await import("@/proxy");

    const response = await freshProxy(
      new NextRequest("https://www.phxhomeloan.com/blog/2/"),
    );

    expect(response.status).toBe(404);
    expect(await response.text()).toBe("Not Found");
  });

  test("shares one Sanity request across concurrent cache misses", async () => {
    let resolveFetch!: (value: number) => void;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<number>((resolve) => {
          resolveFetch = resolve;
        }),
    );
    const { proxy: freshProxy } = await import("@/proxy");
    const requests = [1, 2, 3].map(() =>
      freshProxy(new NextRequest("https://www.phxhomeloan.com/blog/2/")),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFetch(30);

    const responses = await Promise.all(requests);
    expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
  });

  test("fetches a fresh count after the cache expires", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    fetchMock.mockResolvedValueOnce(30).mockResolvedValueOnce(30);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(new NextRequest("https://www.phxhomeloan.com/blog/2/"));

    await request();
    vi.advanceTimersByTime(59_999);
    await request();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(1);
    await request();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("clears a failed request so the next request can retry", async () => {
    fetchMock
      .mockRejectedValueOnce(new Error("Sanity unavailable"))
      .mockResolvedValueOnce(30);
    const { proxy: freshProxy } = await import("@/proxy");
    const request = () =>
      freshProxy(new NextRequest("https://www.phxhomeloan.com/blog/2/"));

    await expect(request()).rejects.toThrow("Sanity unavailable");
    await expect(request()).resolves.toMatchObject({ status: 200 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
