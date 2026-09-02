import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import test from "node:test";

import {
  devServerCommands,
  derivePortPair,
  findLanIpv4,
  mergeAllowedDevOrigins,
  registerShutdownSignals,
  selectPortPair,
  startTailscalePreview,
  stopTailscalePreviewOnExit,
  tailscaleServePlan,
  worktreeAllowedDevOrigins,
} from "./dev-worktree.mjs";

test("registerShutdownSignals treats terminal closure as a server shutdown", () => {
  const target = new EventEmitter();
  const calls = [];
  const removeListeners = registerShutdownSignals(target, (signal, exitCode) => {
    calls.push({ signal, exitCode });
  });

  target.emit("SIGHUP");
  removeListeners();
  target.emit("SIGTERM");

  assert.deepEqual(calls, [{ signal: "SIGHUP", exitCode: 129 }]);
  assert.equal(target.listenerCount("SIGINT"), 0);
  assert.equal(target.listenerCount("SIGTERM"), 0);
  assert.equal(target.listenerCount("SIGHUP"), 0);
});

test("devServerCommands binds both services to all network interfaces", () => {
  const [frontend, studio] = devServerCommands({ frontend: 3103, studio: 4103 });

  assert.deepEqual(frontend.slice(-4), ["--hostname", "0.0.0.0", "--port", "3103"]);
  assert.deepEqual(studio.slice(-4), ["--host", "0.0.0.0", "--port", "4103"]);
});

test("tailscaleServePlan maps one frontend port to a foreground HTTPS proxy", () => {
  assert.deepEqual(
    tailscaleServePlan(3103, {
      Self: { DNSName: "forge.example-tailnet.ts.net." },
    }),
    {
      url: "https://forge.example-tailnet.ts.net:5103",
      startArguments: [
        "serve",
        "--yes",
        "--https=5103",
        "http://127.0.0.1:3103",
      ],
    },
  );
});

test("startTailscalePreview keeps Serve in the terminal group and stops it once", async () => {
  const calls = [];
  const stopSignals = [];
  const child = new EventEmitter();
  child.pid = process.pid;
  child.kill = (signal) => stopSignals.push(signal);
  const runCommand = async (command, arguments_) => {
    calls.push([command, arguments_]);
    return { stdout: '{"Self":{"DNSName":"forge.example-tailnet.ts.net."}}' };
  };
  const spawnCommand = (command, arguments_, options) => {
    calls.push([command, arguments_, options]);
    queueMicrotask(() => child.emit("spawn"));
    return child;
  };

  const preview = await startTailscalePreview(3103, {
    runCommand,
    spawnCommand,
  });

  preview.stop("SIGINT");
  preview.stop("SIGINT");

  assert.equal(preview.url, "https://forge.example-tailnet.ts.net:5103");
  assert.deepEqual(calls, [
    ["tailscale", ["status", "--json"]],
    [
      "tailscale",
      [
        "serve",
        "--yes",
        "--https=5103",
        "http://127.0.0.1:3103",
      ],
      {
        detached: false,
        stdio: "inherit",
      },
    ],
  ]);
  assert.deepEqual(stopSignals, ["SIGINT"]);
});

test("process exit uses synchronous Tailscale cleanup", async () => {
  const stopSignals = [];
  const child = new EventEmitter();
  child.pid = process.pid;
  const runCommand = async (command, arguments_) => {
    return { stdout: '{"Self":{"DNSName":"forge.example-tailnet.ts.net."}}' };
  };
  const spawnCommand = () => {
    queueMicrotask(() => child.emit("spawn"));
    return child;
  };

  const preview = await startTailscalePreview(3103, {
    runCommand,
    spawnCommand,
  });
  preview.stop = (signal) => stopSignals.push(signal);
  stopTailscalePreviewOnExit(preview);

  assert.deepEqual(stopSignals, ["SIGTERM"]);
});

test("findLanIpv4 selects a private LAN address instead of loopback or Tailscale", () => {
  assert.equal(
    findLanIpv4({
      lo: [{ address: "127.0.0.1", family: "IPv4", internal: true }],
      tailscale0: [{ address: "100.118.199.2", family: "IPv4", internal: false }],
      public: [{ address: "203.0.113.10", family: "IPv4", internal: false }],
      wifi: [{ address: "192.168.100.233", family: "IPv4", internal: false }],
    }),
    "192.168.100.233",
  );
});

test("findLanIpv4 skips virtual bridge interfaces listed before the physical one", () => {
  assert.equal(
    findLanIpv4({
      docker0: [{ address: "172.17.0.1", family: "IPv4", internal: false }],
      virbr0: [{ address: "192.168.122.1", family: "IPv4", internal: false }],
      wifi: [{ address: "192.168.100.233", family: "IPv4", internal: false }],
    }),
    "192.168.100.233",
  );
});

test("mergeAllowedDevOrigins adds LAN and Tailscale hosts without losing configured hosts", () => {
  assert.equal(
    mergeAllowedDevOrigins(
      "custom.test, 192.168.100.233",
      "192.168.100.233",
      "forge.example-tailnet.ts.net",
    ),
    "custom.test,192.168.100.233,forge.example-tailnet.ts.net",
  );
});

test("worktreeAllowedDevOrigins includes the numeric loopback used by T3 previews", () => {
  assert.equal(
    worktreeAllowedDevOrigins(
      "custom.test",
      "192.168.100.233",
      "forge.example-tailnet.ts.net",
    ),
    "custom.test,127.0.0.1,192.168.100.233,forge.example-tailnet.ts.net",
  );
});

test("derivePortPair returns a stable pair in separate ranges", () => {
  const first = derivePortPair("/work/dev/.t3/worktrees/example/feature-a");
  const second = derivePortPair("/work/dev/.t3/worktrees/example/feature-a");

  assert.deepEqual(first, second);
  assert.ok(first.frontend >= 3100 && first.frontend < 3110);
  assert.ok(first.studio >= 4100 && first.studio < 4110);
  assert.equal(first.studio - first.frontend, 1000);
});

test("selectPortPair replaces a saved pair from the old wide range", async (context) => {
  const worktreePath = await mkdtemp(resolve(tmpdir(), "dev-worktree-test-"));
  const portFile = resolve(worktreePath, ".worktree-ports.json");

  context.after(() => rm(worktreePath, { force: true, recursive: true }));
  await writeFile(portFile, '{"frontend":3923,"studio":4923}\n');

  const selected = await selectPortPair({
    worktreePath,
    checkPort: async () => true,
  });
  const saved = JSON.parse(await readFile(portFile));

  assert.deepEqual(selected.pair, derivePortPair(worktreePath));
  assert.deepEqual(saved, selected.pair);
});

test("selectPortPair skips occupied pairs and remembers its choice", async (context) => {
  const worktreePath = await mkdtemp(resolve(tmpdir(), "dev-worktree-test-"));
  const firstPair = derivePortPair(worktreePath);
  const occupiedPorts = new Set([firstPair.frontend, firstPair.studio]);
  const checkPort = async (port) => !occupiedPorts.has(port);

  context.after(() => rm(worktreePath, { force: true, recursive: true }));

  const selected = await selectPortPair({ worktreePath, checkPort });
  const saved = JSON.parse(await readFile(resolve(worktreePath, ".worktree-ports.json")));

  assert.deepEqual(selected.pair, derivePortPair(worktreePath, 1));
  assert.deepEqual(saved, selected.pair);

  const selectedAgain = await selectPortPair({ worktreePath, checkPort });
  assert.deepEqual(selectedAgain.pair, selected.pair);
});

test("selectPortPair requires both explicit port overrides", async () => {
  await assert.rejects(
    selectPortPair({
      worktreePath: "/worktree",
      frontendOverride: "3200",
      checkPort: async () => true,
    }),
    /Set FRONTEND_PORT and STUDIO_PORT together/,
  );
});

test("selectPortPair uses a complete explicit override without saving it", async () => {
  const selected = await selectPortPair({
    worktreePath: "/worktree",
    frontendOverride: "3200",
    studioOverride: "4200",
    checkPort: async () => true,
  });

  assert.deepEqual(selected, {
    pair: { frontend: 3200, studio: 4200 },
    source: "environment",
  });
});
