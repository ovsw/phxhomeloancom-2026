import type { ValidationContext } from "sanity";

export type RedirectRecord = {
  _id?: string;
  _rev?: string;
  destination?: { current?: string } | string;
  permanent?: "false" | "true" | boolean;
  source?: { current?: string } | string;
  status?: string;
};

type LiveRoute = {
  _id?: string;
  path?: string;
  type?: string;
};

type RedirectValidationData = {
  liveRoutes: LiveRoute[];
  redirects: RedirectRecord[];
};

const LIVE_SYSTEM_PATHS = new Set(["/", "/blog"]);
const CODE_OWNED_REDIRECT_PATHS = new Set(["/index"]);

export function normalizeRedirectPath(value?: string | null) {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.includes("\\")) return "";

  const pathOnly = trimmed.split(/[?#]/, 1)[0] ?? "";
  const parts = pathOnly.split("/").filter(Boolean);
  return parts.length === 0 ? "/" : `/${parts.join("/")}`;
}

export function toStoredRedirectPath(value?: string | null) {
  const normalized = normalizeRedirectPath(value);
  if (!normalized || normalized === "/") return normalized;
  return `${normalized}/`;
}

export function readRedirectPath(value: RedirectRecord["source"]) {
  return typeof value === "string" ? value : value?.current;
}

function active(record: RedirectRecord) {
  return !record.status || record.status === "active";
}

export function getRedirectValidationIssues({
  current,
  liveRoutes,
  redirects,
}: {
  current: RedirectRecord;
  liveRoutes: LiveRoute[];
  redirects: RedirectRecord[];
}) {
  const sourceValue = readRedirectPath(current.source);
  const destinationValue = readRedirectPath(current.destination);
  const source = normalizeRedirectPath(sourceValue);
  const destination = normalizeRedirectPath(destinationValue);
  const errors: { destination?: string; source?: string } = {};
  let destinationWarning: string | undefined;

  if (sourceValue && (!sourceValue.trim().startsWith("/") || !source)) {
    errors.source = "The source must be an internal path that starts with /";
  }
  if (
    destinationValue &&
    (!destinationValue.trim().startsWith("/") || !destination)
  ) {
    errors.destination =
      "The destination must be an internal path that starts with /";
  }
  if (source && destination && source === destination) {
    errors.destination = "Source and destination cannot be the same route";
  }

  if (source && (LIVE_SYSTEM_PATHS.has(source) || CODE_OWNED_REDIRECT_PATHS.has(source))) {
    errors.source = "This source is reserved by an existing site route";
  }

  const livePath = liveRoutes.find(
    (route) => normalizeRedirectPath(route.path) === source,
  );
  if (source && livePath) {
    errors.source = `This source is already used by a ${livePath.type ?? "published document"}`;
  }

  if (active(current)) {
    const activeRedirects = redirects.filter(active);
    const duplicateSource = activeRedirects.find(
      (redirect) =>
        normalizeRedirectPath(readRedirectPath(redirect.source)) === source,
    );
    if (source && duplicateSource) {
      errors.source = "Another active redirect already uses this source";
    }

    const sourceIsDestination = activeRedirects.find(
      (redirect) =>
        normalizeRedirectPath(readRedirectPath(redirect.destination)) === source,
    );
    if (source && sourceIsDestination) {
      errors.source = "This source is already the destination of another redirect";
    }

    const destinationIsSource = activeRedirects.find(
      (redirect) =>
        normalizeRedirectPath(readRedirectPath(redirect.source)) === destination,
    );
    if (destination && destinationIsSource) {
      errors.destination = "This destination redirects again and would create a chain";
    }
    if (destination && CODE_OWNED_REDIRECT_PATHS.has(destination)) {
      errors.destination = "This destination redirects again and would create a chain";
    }
  }

  const destinationExists =
    destination &&
    (LIVE_SYSTEM_PATHS.has(destination) ||
      liveRoutes.some(
        (route) => normalizeRedirectPath(route.path) === destination,
      ));
  if (destination && !destinationExists && !errors.destination) {
    destinationWarning = "No published page or post currently uses this destination";
  }

  return { destinationWarning, errors };
}

function documentIds(documentId?: string) {
  const publishedId = documentId?.replace(/^drafts\./, "") ?? "";
  return [publishedId, `drafts.${publishedId}`];
}

async function fetchValidationData(context: ValidationContext) {
  const client = context.getClient({ apiVersion: "2026-03-23" });
  return client.fetch<RedirectValidationData>(
    `{
      "redirects": *[
        _type == "redirect" &&
        !(_id in $currentIds)
      ]{
        _id,
        status,
        source,
        destination,
        permanent
      },
      "liveRoutes": *[
        _type in ["page", "post"] &&
        !(_id in path("drafts.**")) &&
        defined(slug.current)
      ]{
        _id,
        "path": slug.current,
        "type": _type
      }
    }`,
    { currentIds: documentIds(context.document?._id) },
  );
}

function currentRedirect(context: ValidationContext): RedirectRecord {
  return (context.document ?? {}) as RedirectRecord;
}

export async function validateRedirectSource(
  _value: unknown,
  context: ValidationContext,
) {
  const data = await fetchValidationData(context);
  return (
    getRedirectValidationIssues({
      current: currentRedirect(context),
      ...data,
    }).errors.source ?? true
  );
}

export async function validateRedirectDestination(
  _value: unknown,
  context: ValidationContext,
) {
  const data = await fetchValidationData(context);
  return (
    getRedirectValidationIssues({
      current: currentRedirect(context),
      ...data,
    }).errors.destination ?? true
  );
}

export async function warnMissingRedirectDestination(
  _value: unknown,
  context: ValidationContext,
) {
  const data = await fetchValidationData(context);
  return (
    getRedirectValidationIssues({
      current: currentRedirect(context),
      ...data,
    }).destinationWarning ?? true
  );
}
