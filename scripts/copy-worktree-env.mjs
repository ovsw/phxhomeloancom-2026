import {
  constants,
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  realpathSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

const envFiles = ["frontend/.env.local", "studio/.env"];
const sourceArgument = process.argv[2] ?? process.env.T3CODE_PROJECT_ROOT;

if (!sourceArgument) {
  console.error(
    "Missing source checkout. Set T3CODE_PROJECT_ROOT or pass its path as the first argument.",
  );
  process.exit(1);
}

const destinationRoot = realpathSync(process.cwd());
let sourceRoot;
try {
  sourceRoot = realpathSync(sourceArgument);
} catch (error) {
  console.error(`Could not resolve the source checkout ${sourceArgument}: ${error.message}`);
  process.exit(1);
}

if (sourceRoot === destinationRoot) {
  console.error("The source checkout and destination worktree must be different directories.");
  process.exit(1);
}

const missingSources = envFiles.filter((relativePath) => {
  const sourcePath = resolve(sourceRoot, relativePath);
  return !existsSync(sourcePath) || !lstatSync(sourcePath).isFile();
});

if (missingSources.length > 0) {
  for (const relativePath of missingSources) {
    console.error(`Missing source file: ${resolve(sourceRoot, relativePath)}`);
  }
  process.exit(1);
}

for (const relativePath of envFiles) {
  const sourcePath = resolve(sourceRoot, relativePath);
  const destinationPath = resolve(destinationRoot, relativePath);

  if (existsSync(destinationPath)) {
    console.log(`Skipped existing file: ${relativePath}`);
    continue;
  }

  mkdirSync(dirname(destinationPath), { recursive: true });
  copyFileSync(sourcePath, destinationPath, constants.COPYFILE_EXCL);
  console.log(`Copied ${relativePath}`);
}
