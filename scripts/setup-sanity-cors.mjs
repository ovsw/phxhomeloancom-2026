import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

import { managedPortPairs } from "./dev-worktree.mjs";

const CORS_API_VERSION = "v2025-08-14";

export function desiredCorsOrigins() {
  return managedPortPairs().flatMap(({ frontend, studio }) => [
    { origin: `http://localhost:${frontend}`, credentials: true },
    { origin: `http://localhost:${studio}`, credentials: true },
  ]);
}

export function planCorsChanges(
  existingOrigins,
  desiredOrigins = desiredCorsOrigins(),
) {
  const existingByOrigin = new Map(
    existingOrigins.map((entry) => [entry.origin.toLowerCase(), entry]),
  );

  return desiredOrigins.flatMap((desired) => {
    const existing = existingByOrigin.get(desired.origin.toLowerCase());

    if (!existing) {
      return [{ action: "add", desired }];
    }

    if (Boolean(existing.allowCredentials) !== desired.credentials) {
      return [{ action: "replace", desired, existing }];
    }

    return [];
  });
}

async function readSanityEnvironment(projectRoot) {
  let envFile = {};
  try {
    envFile = parseEnv(await readFile(resolve(projectRoot, "studio/.env"), "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
  const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? envFile.SANITY_STUDIO_PROJECT_ID;
  const token = process.env.SANITY_AUTH_TOKEN ?? envFile.SANITY_AUTH_TOKEN;

  if (!projectId || !token) {
    throw new Error(
      "studio/.env must define SANITY_STUDIO_PROJECT_ID and SANITY_AUTH_TOKEN.",
    );
  }

  return { projectId, token };
}

async function requestCors(context, path = "", options = {}) {
  const response = await context.fetchImplementation(
    `https://api.sanity.io/${CORS_API_VERSION}/projects/${encodeURIComponent(context.projectId)}/cors${path}`,
    {
      ...options,
      headers: {
        Authorization: `Bearer ${context.token}`,
        ...(options.body ? { "Content-Type": "application/json" } : {}),
      },
    },
  );

  if (!response.ok) {
    const detail = (await response.text()).trim();
    throw new Error(
      `Sanity CORS request failed (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`,
    );
  }

  if (options.method === "DELETE") {
    return null;
  }

  return response.json();
}

async function createCorsOrigin(context, entry) {
  return requestCors(context, "", {
    method: "POST",
    body: JSON.stringify({
      allowCredentials: entry.credentials,
      origin: entry.origin,
    }),
  });
}

async function replaceCorsOrigin(context, existing, desired) {
  await requestCors(context, `/${encodeURIComponent(existing.id)}`, {
    method: "DELETE",
  });

  try {
    await createCorsOrigin(context, desired);
  } catch (replacementError) {
    try {
      await createCorsOrigin(context, {
        origin: existing.origin,
        credentials: Boolean(existing.allowCredentials),
      });
    } catch (rollbackError) {
      throw new AggregateError(
        [replacementError, rollbackError],
        `Could not replace ${desired.origin}, and restoring its old CORS entry also failed.`,
      );
    }

    throw new Error(
      `Could not replace ${desired.origin}; its old CORS entry was restored.`,
      { cause: replacementError },
    );
  }
}

export async function configureSanityCors(
  projectRoot,
  { fetchImplementation = fetch } = {},
) {
  const environment = await readSanityEnvironment(projectRoot);
  const context = { ...environment, fetchImplementation };
  const existingOrigins = await requestCors(context);
  const changes = planCorsChanges(existingOrigins);

  if (changes.length === 0) {
    console.log("All worktree CORS origins and credential modes are already configured.");
    return;
  }

  for (const change of changes) {
    if (change.action === "replace") {
      console.log(`Enabling credentials for ${change.desired.origin}...`);
      await replaceCorsOrigin(context, change.existing, change.desired);
    } else {
      console.log(`Adding ${change.desired.origin} with credentials...`);
      await createCorsOrigin(context, change.desired);
    }
  }

  console.log(`Configured ${changes.length} Sanity CORS origins.`);
}

async function main() {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  await configureSanityCors(projectRoot);
}

const isMainModule =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((error) => {
    console.error(`Could not configure Sanity CORS: ${error.message}`);
    console.error(
      "Ensure the SANITY_AUTH_TOKEN in studio/.env can read, create, and delete project CORS origins.",
    );
    process.exitCode = 1;
  });
}
