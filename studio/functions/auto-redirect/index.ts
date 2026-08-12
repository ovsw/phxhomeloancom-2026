import { createClient } from "@sanity/client";
import { documentEventHandler } from "@sanity/functions";

import { getPresentationPath } from "../../presentation/routes.ts";
import type { RedirectRecord } from "../../schemas/validation/redirect-rules.ts";
import {
  autoRedirectId,
  planAutoRedirect,
  shouldWriteAutoRedirect,
  type AutoRedirectEventData,
} from "./model.ts";

const API_VERSION = "2026-03-23";

export const handler = documentEventHandler<AutoRedirectEventData>(
  async ({ context, event }) => {
    const client = createClient({
      ...context.clientOptions,
      apiVersion: API_VERSION,
      perspective: "published",
      useCdn: false,
    });

    const [redirects, rawLiveRoutes] = await Promise.all([
      client.fetch<RedirectRecord[]>(`
        *[
          _type == "redirect" &&
          !(_id in path("drafts.**"))
        ]{
          _id,
          _rev,
          status,
          source,
          destination,
          permanent
        }
      `),
      client.fetch<{ _id: string; _type: string; slug: string }[]>(
        `*[
          _type in ["page", "post", "category"] &&
          !(_id in path("drafts.**")) &&
          _id != $documentId &&
          defined(slug.current)
        ]{
          _id,
          _type,
          "slug": slug.current
        }`,
        { documentId: event.data.documentId ?? "" },
      ),
    ]);
    const liveRoutes = rawLiveRoutes.map((route) => ({
      _id: route._id,
      path: getPresentationPath(route._type, route.slug) ?? undefined,
    }));

    const plan = planAutoRedirect({
      event: event.data,
      liveRoutes,
      redirects,
    });
    if (plan.action === "skip") {
      console.info(`Auto redirect skipped: ${plan.reason}`);
      return;
    }
    if (!plan.create && plan.retarget.length === 0) {
      console.info(`Auto redirect already exists: ${plan.source}`);
      return;
    }
    if (!shouldWriteAutoRedirect(context.local)) {
      console.info(
        `Auto redirect local test: would apply ${plan.source} -> ${plan.destination}`,
      );
      return;
    }

    const destination = { _type: "slug", current: plan.destination };
    const transaction = client.transaction();
    for (const redirect of plan.retarget) {
      transaction.patch(redirect._id, (patch) => {
        const guardedPatch = redirect._rev
          ? patch.ifRevisionId(redirect._rev)
          : patch;
        return guardedPatch.set({ destination });
      });
    }
    if (plan.create) {
      // Function events are delivered at least once. Deriving the id from the
      // source keeps a redelivered publish from creating a second redirect that
      // would collide with this one in the topology rules.
      transaction.createIfNotExists({
        _id: autoRedirectId(plan.source),
        _type: "redirect",
        status: "active",
        source: { _type: "slug", current: plan.source },
        destination,
        permanent: "true",
      });
    }

    await transaction.commit();
    console.info(`Auto redirect applied: ${plan.source} -> ${plan.destination}`);
  },
);
