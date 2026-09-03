// Print the local Studio Presentation URL for a content document, so a
// reviewer can click straight to the page after a dataset edit.
//
//   pnpm presentation:url <documentType> [slug]
//   pnpm presentation:url page about
//   pnpm presentation:url blogIndex
//
// The path comes from the same resolver the Studio's "Open in Presentation"
// action uses (studio/presentation/routes.ts), so the two never disagree.
// The Studio port is resolved the same way `pnpm dev:worktree` assigns it:
// STUDIO_PORT, then .worktree-ports.json, then the plain `pnpm dev` port.
// A worktree never falls back to the plain port: Studio and frontend ports
// are a pair, and 3333 previews the main checkout's frontend on 3000, so the
// link would show the wrong code.

import { readFile, stat } from "node:fs/promises";
import { createConnection } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { getPresentationPath } from "../studio/presentation/routes.ts";

const DEFAULT_STUDIO_PORT = 3333;
const PORT_FILE_NAME = ".worktree-ports.json";
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function parsePort(value, name) {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`${name} must be an integer from 1024 through 65535.`);
  }
  return port;
}

// A linked worktree has a `.git` file pointing at the main repo; the main
// checkout has a `.git` directory. Same rule as .claude/hooks/copy-local-env.sh.
async function isLinkedWorktree(projectRoot) {
  try {
    return (await stat(resolve(projectRoot, ".git"))).isFile();
  } catch (error) {
    if (error?.code === "ENOENT") return false;
    throw error;
  }
}

export async function resolveStudioPort({
  projectRoot = REPO_ROOT,
  studioOverride = process.env.STUDIO_PORT,
} = {}) {
  if (studioOverride) {
    return { port: parsePort(studioOverride, "STUDIO_PORT"), source: "STUDIO_PORT" };
  }

  const portFile = resolve(projectRoot, PORT_FILE_NAME);
  let saved;
  try {
    saved = JSON.parse(await readFile(portFile, "utf8"));
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw new Error(`Could not read ${portFile}: ${error.message}`, { cause: error });
    }
    if (await isLinkedWorktree(projectRoot)) {
      throw new Error(
        `This is a worktree with no ${PORT_FILE_NAME}. Run \`pnpm dev:worktree\` here first, ` +
          "so the preview shows this worktree's frontend. " +
          "Set STUDIO_PORT to point at another Studio on purpose.",
      );
    }
    return { port: DEFAULT_STUDIO_PORT, source: "default" };
  }

  return { port: parsePort(saved?.studio, `Studio port in ${portFile}`), source: portFile };
}

export function buildPresentationUrl(studioPort, documentType, slug) {
  const path = getPresentationPath(documentType, slug);
  if (!path) {
    throw new Error(
      `No Presentation route for type "${documentType}"` +
        (slug ? ` with slug "${slug}".` : ". Pass the document's slug."),
    );
  }

  const url = new URL(`http://localhost:${studioPort}/presentation`);
  url.searchParams.set("preview", path);
  return url.toString();
}

export function isPortListening(port, host = "localhost") {
  return new Promise((resolveListening) => {
    const socket = createConnection({ host, port });
    socket.setTimeout(500);
    socket.once("connect", () => {
      socket.destroy();
      resolveListening(true);
    });
    const fail = () => {
      socket.destroy();
      resolveListening(false);
    };
    socket.once("error", fail);
    socket.once("timeout", fail);
  });
}

async function main(argv) {
  const [documentType, slug] = argv;
  if (!documentType) {
    console.error("Usage: pnpm presentation:url <documentType> [slug]");
    process.exitCode = 2;
    return;
  }

  const { port, source } = await resolveStudioPort();
  const url = buildPresentationUrl(port, documentType, slug);

  if (!(await isPortListening(port))) {
    console.warn(
      `Warning: nothing is listening on Studio port ${port} (from ${source}). ` +
        "Start it with `pnpm dev` or `pnpm dev:worktree`.",
    );
  }

  console.log(url);
}

const isMainModule =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
