import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const FRONTEND_PORT_START = 3100;
const STUDIO_PORT_START = 4100;
const PORT_SLOT_COUNT = 10;
const PORT_FILE_NAME = ".worktree-ports.json";

export function hashWorktreePath(worktreePath) {
  let hash = 2166136261;

  for (const character of worktreePath) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function derivePortPair(worktreePath, offset = 0) {
  const slot = (hashWorktreePath(worktreePath) + offset) % PORT_SLOT_COUNT;
  return {
    frontend: FRONTEND_PORT_START + slot,
    studio: STUDIO_PORT_START + slot,
  };
}

export function managedPortPairs() {
  return Array.from({ length: PORT_SLOT_COUNT }, (_, slot) => ({
    frontend: FRONTEND_PORT_START + slot,
    studio: STUDIO_PORT_START + slot,
  }));
}

function isManagedPortPair(pair) {
  return managedPortPairs().some(
    (managedPair) =>
      managedPair.frontend === pair.frontend && managedPair.studio === pair.studio,
  );
}

function parsePort(value, name) {
  const port = Number(value);

  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new Error(`${name} must be an integer from 1024 through 65535.`);
  }

  return port;
}

function validatePortPair(pair) {
  const validated = {
    frontend: parsePort(pair.frontend, "Frontend port"),
    studio: parsePort(pair.studio, "Studio port"),
  };

  if (validated.frontend === validated.studio) {
    throw new Error("Frontend and Studio ports must be different.");
  }

  return validated;
}

export async function isPortAvailable(port) {
  return new Promise((resolveAvailability) => {
    const server = createServer();

    server.unref();
    server.once("error", () => resolveAvailability(false));
    server.listen({ host: "127.0.0.1", port }, () => {
      server.close(() => resolveAvailability(true));
    });
  });
}

async function assertPairAvailable(pair, checkPort) {
  const [frontendAvailable, studioAvailable] = await Promise.all([
    checkPort(pair.frontend),
    checkPort(pair.studio),
  ]);

  if (!frontendAvailable || !studioAvailable) {
    const occupied = [
      !frontendAvailable ? `frontend ${pair.frontend}` : null,
      !studioAvailable ? `Studio ${pair.studio}` : null,
    ]
      .filter(Boolean)
      .join(" and ");

    throw new Error(
      `Saved worktree port is already in use: ${occupied}. ` +
        "The server may already be running. Stop it or delete .worktree-ports.json to allocate another pair.",
    );
  }
}

async function readSavedPair(portFile) {
  try {
    return validatePortPair(JSON.parse(await readFile(portFile, "utf8")));
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null;
    }

    throw new Error(`Could not read ${portFile}: ${error.message}`, { cause: error });
  }
}

export async function selectPortPair({
  worktreePath,
  portFile = resolve(worktreePath, PORT_FILE_NAME),
  frontendOverride,
  studioOverride,
  checkPort = isPortAvailable,
}) {
  const hasFrontendOverride = frontendOverride !== undefined && frontendOverride !== "";
  const hasStudioOverride = studioOverride !== undefined && studioOverride !== "";

  if (hasFrontendOverride !== hasStudioOverride) {
    throw new Error("Set FRONTEND_PORT and STUDIO_PORT together, or leave both unset.");
  }

  if (hasFrontendOverride && hasStudioOverride) {
    const pair = validatePortPair({
      frontend: frontendOverride,
      studio: studioOverride,
    });
    await assertPairAvailable(pair, checkPort);
    return { pair, source: "environment" };
  }

  const savedPair = await readSavedPair(portFile);
  if (savedPair && isManagedPortPair(savedPair)) {
    await assertPairAvailable(savedPair, checkPort);
    return { pair: savedPair, source: portFile };
  }

  const replaceOutdatedPortFile = savedPair !== null;

  for (let offset = 0; offset < PORT_SLOT_COUNT; offset += 1) {
    const pair = derivePortPair(worktreePath, offset);
    const [frontendAvailable, studioAvailable] = await Promise.all([
      checkPort(pair.frontend),
      checkPort(pair.studio),
    ]);

    if (!frontendAvailable || !studioAvailable) {
      continue;
    }

    try {
      await writeFile(portFile, `${JSON.stringify(pair, null, 2)}\n`, {
        flag: replaceOutdatedPortFile ? "w" : "wx",
      });
      return { pair, source: portFile };
    } catch (error) {
      if (error?.code !== "EEXIST") {
        throw error;
      }

      const concurrentlySavedPair = await readSavedPair(portFile);
      await assertPairAvailable(concurrentlySavedPair, checkPort);
      return { pair: concurrentlySavedPair, source: portFile };
    }
  }

  throw new Error("Could not find an available frontend and Studio port pair.");
}

function killProcessGroup(child, signal) {
  if (!child.pid) {
    return;
  }

  try {
    if (process.platform === "win32") {
      child.kill(signal);
    } else {
      process.kill(-child.pid, signal);
    }
  } catch (error) {
    if (error?.code !== "ESRCH") {
      throw error;
    }
  }
}

export async function runDevServers(projectRoot, pair) {
  const frontendUrl = `http://localhost:${pair.frontend}`;
  const studioUrl = `http://localhost:${pair.studio}`;
  const sharedEnvironment = {
    ...process.env,
    NEXT_PUBLIC_SITE_URL: frontendUrl,
    NEXT_PUBLIC_STUDIO_URL: studioUrl,
    SANITY_STUDIO_PREVIEW_URL: frontendUrl,
  };
  const spawnOptions = {
    cwd: projectRoot,
    detached: process.platform !== "win32",
    env: sharedEnvironment,
    stdio: "inherit",
  };
  const children = [
    spawn(
      "pnpm",
      [
        "--dir",
        "frontend",
        "exec",
        "next",
        "dev",
        "--hostname",
        "127.0.0.1",
        "--port",
        String(pair.frontend),
      ],
      spawnOptions,
    ),
    spawn(
      "pnpm",
      [
        "--dir",
        "studio",
        "exec",
        "sanity",
        "dev",
        "--host",
        "127.0.0.1",
        "--port",
        String(pair.studio),
      ],
      spawnOptions,
    ),
  ];

  console.log(`Frontend: ${frontendUrl}`);
  console.log(`Studio:   ${studioUrl}`);
  console.log("Press Ctrl+C to stop both servers.\n");

  let shuttingDown = false;
  let closedChildren = 0;

  await new Promise((resolveChildren) => {
    const stopChildren = (signal, exitCode) => {
      if (shuttingDown) {
        return;
      }

      shuttingDown = true;
      process.exitCode = exitCode;

      for (const child of children) {
        killProcessGroup(child, signal);
      }

      const forceKillTimer = setTimeout(() => {
        for (const child of children) {
          killProcessGroup(child, "SIGKILL");
        }
      }, 5_000);
      forceKillTimer.unref();
    };

    process.once("SIGINT", () => stopChildren("SIGINT", 130));
    process.once("SIGTERM", () => stopChildren("SIGTERM", 143));

    for (const child of children) {
      child.once("error", (error) => {
        console.error(`Could not start a dev server: ${error.message}`);
        stopChildren("SIGTERM", 1);
      });
      child.once("close", (code, signal) => {
        closedChildren += 1;

        if (!shuttingDown) {
          const detail = signal ? `signal ${signal}` : `exit code ${code}`;
          console.error(`A dev server stopped with ${detail}. Stopping the other server.`);
          stopChildren("SIGTERM", code || 1);
        }

        if (closedChildren === children.length) {
          resolveChildren();
        }
      });
    }
  });
}

async function main() {
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const { pair, source } = await selectPortPair({
    worktreePath: projectRoot,
    frontendOverride: process.env.FRONTEND_PORT,
    studioOverride: process.env.STUDIO_PORT,
  });

  console.log(`Port selection: ${source}`);
  await runDevServers(projectRoot, pair);
}

const isMainModule = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
