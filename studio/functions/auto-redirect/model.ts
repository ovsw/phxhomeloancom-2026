import {
  CODE_OWNED_GONE_ROUTE_PATHS,
  normalizeRedirectPath,
  readRedirectPath,
  toStoredRedirectPath,
  type RedirectRecord,
} from "../../schemas/validation/redirect-rules.ts";

export type AutoRedirectEventData = {
  beforeSlug?: string;
  documentId?: string;
  documentType?: string;
  slug?: string;
};

type LiveRoute = {
  _id?: string;
  path?: string;
};

type AutoRedirectPlan =
  | { action: "skip"; reason: string }
  | {
      action: "apply";
      create: boolean;
      destination: string;
      retarget: { _id: string; _rev?: string }[];
      source: string;
    };

const ROUTED_DOCUMENT_TYPES = new Set(["page", "post"]);
const RESERVED_SOURCE_PATHS = new Set([
  "/",
  "/blog",
  ...CODE_OWNED_GONE_ROUTE_PATHS,
]);

export function shouldWriteAutoRedirect(local?: boolean) {
  return local !== true;
}

function isActive(record: RedirectRecord) {
  return !record.status || record.status === "active";
}

function topologyError(redirects: RedirectRecord[]) {
  const redirectsBySource = new Map<string, string>();

  for (const redirect of redirects.filter(isActive)) {
    const source = normalizeRedirectPath(readRedirectPath(redirect.source));
    const destination = normalizeRedirectPath(
      readRedirectPath(redirect.destination),
    );
    if (!source || !destination) continue;
    if (source === destination) return `Self redirect at ${source}`;

    const existingDestination = redirectsBySource.get(source);
    if (existingDestination && existingDestination !== destination) {
      return `Conflicting redirect source ${source}`;
    }
    redirectsBySource.set(source, destination);
  }

  for (const [source, destination] of redirectsBySource) {
    if (redirectsBySource.has(destination)) {
      return `Redirect chain or cycle at ${source}`;
    }
  }

  return undefined;
}

export function planAutoRedirect({
  event,
  liveRoutes,
  redirects,
}: {
  event: AutoRedirectEventData;
  liveRoutes: LiveRoute[];
  redirects: RedirectRecord[];
}): AutoRedirectPlan {
  if (!event.documentType || !ROUTED_DOCUMENT_TYPES.has(event.documentType)) {
    return { action: "skip", reason: "Document type is not routed by a slug" };
  }

  const source = normalizeRedirectPath(event.beforeSlug);
  const destination = normalizeRedirectPath(event.slug);
  if (!source || !destination) {
    return { action: "skip", reason: "The publish event has no previous slug" };
  }
  if (source === destination) {
    return { action: "skip", reason: "The normalized route did not change" };
  }
  if (RESERVED_SOURCE_PATHS.has(source)) {
    return { action: "skip", reason: "The previous route is reserved" };
  }
  if (RESERVED_SOURCE_PATHS.has(destination)) {
    return { action: "skip", reason: "The new route is reserved" };
  }

  const liveCollision = liveRoutes.find((route) => {
    if (
      route._id &&
      event.documentId &&
      route._id.replace(/^drafts\./, "") ===
        event.documentId.replace(/^drafts\./, "")
    ) {
      return false;
    }
    const path = normalizeRedirectPath(route.path);
    return path === source || path === destination;
  });
  if (liveCollision) {
    return {
      action: "skip",
      reason: `Route collision with ${liveCollision._id ?? liveCollision.path}`,
    };
  }

  const sourceRedirect = redirects.find(
    (redirect) =>
      normalizeRedirectPath(readRedirectPath(redirect.source)) === source,
  );
  if (sourceRedirect && !isActive(sourceRedirect)) {
    return {
      action: "skip",
      reason: "An inactive redirect already uses the previous route",
    };
  }

  const activeRedirects = redirects.filter(isActive);
  const directRedirect = sourceRedirect;
  if (
    directRedirect &&
    normalizeRedirectPath(readRedirectPath(directRedirect.destination)) !==
      destination
  ) {
    return { action: "skip", reason: "The previous route already redirects elsewhere" };
  }

  const destinationRedirect = activeRedirects.find(
    (redirect) =>
      normalizeRedirectPath(readRedirectPath(redirect.source)) === destination,
  );
  if (destinationRedirect) {
    return { action: "skip", reason: "The new route is already a redirect source" };
  }

  const incoming = activeRedirects.filter(
    (redirect) =>
      redirect._id &&
      normalizeRedirectPath(readRedirectPath(redirect.destination)) === source &&
      normalizeRedirectPath(readRedirectPath(redirect.source)) !== source,
  );

  const simulated = activeRedirects.map((redirect) =>
    incoming.includes(redirect)
      ? { ...redirect, destination: toStoredRedirectPath(destination) }
      : redirect,
  );
  if (!directRedirect) {
    simulated.push({
      source: toStoredRedirectPath(source),
      destination: toStoredRedirectPath(destination),
      permanent: "true",
      status: "active",
    });
  }

  const error = topologyError(simulated);
  if (error) return { action: "skip", reason: error };

  return {
    action: "apply",
    create: !directRedirect,
    destination: toStoredRedirectPath(destination),
    retarget: incoming.map((redirect) => ({
      _id: redirect._id as string,
      _rev: redirect._rev,
    })),
    source: toStoredRedirectPath(source),
  };
}
