import { execFile, spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { networkInterfaces } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const FRONTEND_PORT_START = 3100;
const STUDIO_PORT_START = 4100;
const TAILSCALE_PORT_OFFSET = 2000;
const PORT_SLOT_COUNT = 10;
const PORT_FILE_NAME = ".worktree-ports.json";
const execFileAsync = promisify(execFile);
export const SHUTDOWN_SIGNALS = [
  { signal: "SIGINT", exitCode: 130 },
  { signal: "SIGTERM", exitCode: 143 },
  { signal: "SIGHUP", exitCode: 129 },
];

export function registerShutdownSignals(target, stopChildren) {
  const handlers = SHUTDOWN_SIGNALS.map(({ signal, exitCode }) => {
    const handler = () => stopChildren(signal, exitCode);
    target.once(signal, handler);
    return { signal, handler };
  });

  return () => {
    for (const { signal, handler } of handlers) {
      target.off(signal, handler);
    }
  };
}

export function tailscaleServePlan(frontendPort, tailscaleStatus) {
  const dnsName = tailscaleStatus?.Self?.DNSName?.replace(/\.$/, "");
  const tailscalePort = frontendPort + TAILSCALE_PORT_OFFSET;

  if (!dnsName) {
    throw new Error(
      "Tailscale is not connected or did not report a Tailnet DNS name.",
    );
  }

  if (tailscalePort > 65535) {
    throw new Error("The derived Tailscale preview port is outside the valid range.");
  }

  return {
    url: `https://${dnsName}:${tailscalePort}`,
    startArguments: [
      "serve",
      "--yes",
      `--https=${tailscalePort}`,
      `http://127.0.0.1:${frontendPort}`,
    ],
  };
}

export async function startTailscalePreview(
  frontendPort,
  {
    runCommand = execFileAsync,
    spawnCommand = spawn,
  } = {},
) {
  let status;

  try {
    const { stdout } = await runCommand("tailscale", ["status", "--json"]);
    status = JSON.parse(stdout);
  } catch (error) {
    throw new Error(`Could not read Tailscale status: ${error.message}`, {
      cause: error,
    });
  }

  const plan = tailscaleServePlan(frontendPort, status);
  const child = spawnCommand("tailscale", plan.startArguments, {
    detached: false,
    stdio: "inherit",
  });

  try {
    await new Promise((resolveSpawn, rejectSpawn) => {
      child.once("spawn", resolveSpawn);
      child.once("error", rejectSpawn);
    });
  } catch (error) {
    throw new Error(`Could not start the Tailscale preview: ${error.message}`, {
      cause: error,
    });
  }

  let active = true;
  child.once("close", () => {
    active = false;
  });

  return {
    child,
    url: plan.url,
    stop(signal = "SIGTERM") {
      if (!active) {
        return;
      }

      active = false;
      child.kill(signal);
    },
  };
}

export function stopTailscalePreviewOnExit(
  tailscalePreview,
  onError = () => {},
) {
  if (!tailscalePreview) {
    return;
  }

  try {
    tailscalePreview.stop("SIGTERM");
  } catch (error) {
    onError(error);
  }
}

function isPrivateIpv4(address) {
  const octets = address.split(".").map(Number);

  if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet))) {
    return false;
  }

  return (
    octets[0] === 10 ||
    (octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31) ||
    (octets[0] === 192 && octets[1] === 168)
  );
}

export function findLanIpv4(interfaces = networkInterfaces()) {
  for (const addresses of Object.values(interfaces)) {
    for (const address of addresses ?? []) {
      if (
        address.family === "IPv4" &&
        !address.internal &&
        isPrivateIpv4(address.address)
      ) {
        return address.address;
      }
    }
  }

  return null;
}

export function mergeAllowedDevOrigins(configuredOrigins, ...discoveredHosts) {
  return [
    ...(configuredOrigins ?? "").split(","),
    ...discoveredHosts,
  ]
    .map((host) => host?.trim())
    .filter(Boolean)
    .filter((host, index, hosts) => hosts.indexOf(host) === index)
    .join(",");
}

export function worktreeAllowedDevOrigins(
  configuredOrigins,
  lanAddress,
  tailnetDnsName,
) {
  return mergeAllowedDevOrigins(
    configuredOrigins,
    "127.0.0.1",
    lanAddress,
    tailnetDnsName,
  );
}

export function devServerCommands(pair) {
  return [
    [
      "--dir",
      "frontend",
      "exec",
      "next",
      "dev",
      "--hostname",
      "0.0.0.0",
      "--port",
      String(pair.frontend),
    ],
    [
      "--dir",
      "studio",
      "exec",
      "sanity",
      "dev",
      "--host",
      "0.0.0.0",
      "--port",
      String(pair.studio),
    ],
  ];
}

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
    server.listen({ host: "0.0.0.0", port }, () => {
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
  const lanAddress = findLanIpv4();
  let tailscalePreview = null;
  let shuttingDown = false;

  try {
    tailscalePreview = await startTailscalePreview(pair.frontend);
  } catch (error) {
    console.warn(`Tailscale preview unavailable: ${error.message}`);
  }

  const allowedDevOrigins = worktreeAllowedDevOrigins(
    process.env.NEXT_ALLOWED_DEV_ORIGINS,
    lanAddress,
    tailscalePreview ? new URL(tailscalePreview.url).hostname : null,
  );

  const sharedEnvironment = {
    ...process.env,
    NEXT_ALLOWED_DEV_ORIGINS: allowedDevOrigins,
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
  const children = devServerCommands(pair).map((arguments_) =>
    spawn("pnpm", arguments_, spawnOptions),
  );

  if (tailscalePreview) {
    tailscalePreview.child.once("error", (error) => {
      console.warn(`Tailscale preview stopped with an error: ${error.message}`);
    });
    tailscalePreview.child.once("close", (code, signal) => {
      if (!shuttingDown) {
        const detail = signal ? `signal ${signal}` : `exit code ${code}`;
        console.warn(`Tailscale preview stopped with ${detail}; local development continues.`);
      }
    });
  }

  console.log(`Frontend: ${frontendUrl}`);
  console.log(`Studio:   ${studioUrl}`);
  if (lanAddress) {
    console.log(`LAN:      http://${lanAddress}:${pair.frontend}`);
  }
  if (tailscalePreview) {
    console.log(`Phone HTTPS: ${tailscalePreview.url}`);
  }
  console.log("Press Ctrl+C to stop both servers.\n");

  let closedChildren = 0;
  let removeShutdownSignals = () => {};
  const stopChildrenOnParentExit = () => {
    for (const child of children) {
      killProcessGroup(child, "SIGTERM");
    }

    stopTailscalePreviewOnExit(tailscalePreview, (error) => {
      console.warn(`Could not stop the Tailscale preview during exit: ${error.message}`);
    });
  };

  try {
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
        tailscalePreview?.stop(signal);

        const forceKillTimer = setTimeout(() => {
          for (const child of children) {
            killProcessGroup(child, "SIGKILL");
          }
        }, 5_000);
        forceKillTimer.unref();
      };

      removeShutdownSignals = registerShutdownSignals(process, stopChildren);
      process.once("exit", stopChildrenOnParentExit);

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
  } finally {
    removeShutdownSignals();
    process.off("exit", stopChildrenOnParentExit);

    if (tailscalePreview) {
      try {
        tailscalePreview.stop("SIGTERM");
        console.log(`Stopped the Tailscale preview for frontend port ${pair.frontend}.`);
      } catch (error) {
        console.warn(`Could not stop the Tailscale preview: ${error.message}`);
      }
    }
  }
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
