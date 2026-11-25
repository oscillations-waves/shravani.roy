import { cp, lstat, mkdir, readFile, realpath, rename, rm } from "node:fs/promises";
import { extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const siteRoot = fileURLToPath(new URL("../", import.meta.url));
const checkout = resolve(process.argv[2] ?? join(siteRoot, ".private-content"));
const published = join(checkout, "published");
const staging = join(siteRoot, ".private-content-prepare");
const contentPaths = [
  { path: "src/content/blog", directory: true },
  { path: "src/assets/photography", directory: true },
  { path: "src/data/photography.ts", directory: false },
  { path: "public/blog", directory: true },
  { path: "public/cafe-portrait.webp", directory: false },
  { path: "public/home-portrait.webp", directory: false },
];
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);

async function inspect(path) {
  const entry = await lstat(path).catch((error) => {
    if (error.code !== "ENOENT") throw error;
    return undefined;
  });
  if (entry?.isSymbolicLink()) throw new Error(`Symbolic links are not allowed: ${path}`);
  return entry;
}

async function inspectParents(root, path, create = false) {
  let current = root;
  for (const part of path.split("/").slice(0, -1)) {
    current = join(current, part);
    const entry = await inspect(current);
    if (!entry && create) await mkdir(current);
    else if (!entry?.isDirectory()) throw new Error(`Expected a directory: ${current}`);
  }
}

async function verifyPublishedPost(file) {
  const source = await readFile(file, "utf8");
  const frontmatter = source.match(/^\uFEFF?---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/)?.[1];
  if (frontmatter === undefined) {
    throw new Error("Every published blog post must have YAML frontmatter.");
  }

  let metadata;
  try {
    metadata = parse(frontmatter);
  } catch {
    throw new Error("Invalid YAML frontmatter in a published blog post.");
  }
  if (metadata?.draft === true) {
    throw new Error("Move drafts and their images out of published/src/content/blog before deployment.");
  }
}

async function prepare() {
  for (const root of [checkout, published]) {
    if (!(await inspect(root))?.isDirectory()) {
      throw new Error(`Private content directory not found: ${root}`);
    }
  }

  await mkdir(staging, { mode: 0o700 }).catch((error) => {
    if (error.code !== "EEXIST") throw error;
    throw new Error(`Content preparation is already running or has recovery files in ${staging}`);
  });
  const replacements = [];
  let preserveBackup = false;
  try {
    const realCheckout = await realpath(checkout);
    const transfers = [];
    for (const { path, directory } of contentPaths) {
      const destination = join(siteRoot, path);
      const checkoutPath = relative(destination, realCheckout);
      const checkoutOutside = checkoutPath === ".." || checkoutPath.startsWith(`..${sep}`) || isAbsolute(checkoutPath);
      if (!checkoutOutside) throw new Error(`Private checkout overlaps a prepared path: ${path}`);

      await inspectParents(published, path);
      await inspectParents(siteRoot, path, true);
      const source = join(published, path);
      const from = await inspect(source);
      const destinationEntry = await inspect(destination);
      const type = directory ? "isDirectory" : "isFile";
      if (!from?.[type]()) throw new Error(`Missing or invalid published content: ${path}`);
      if (destinationEntry && !destinationEntry[type]()) {
        throw new Error(`Unexpected entry in prepared content path: ${path}`);
      }
      transfers.push({ path, source, destination, existed: Boolean(destinationEntry) });
    }

    // Check and stage the full set before changing existing local content.
    for (const [index, { path, source }] of transfers.entries()) {
      await cp(source, join(staging, `new-${index}`), {
        recursive: true,
        filter: async (file) => {
          const entry = await inspect(file);
          if (entry?.isDirectory()) return true;
          if (!entry?.isFile()) throw new Error(`Unsupported content entry: ${file}`);
          const extension = extname(file).toLowerCase();
          if (path === "public/blog" && !imageExtensions.has(extension)) {
            throw new Error(`Only published images belong in public/blog: ${file}`);
          }
          if (path === "src/content/blog" && (extension === ".md" || extension === ".mdx")) {
            await verifyPublishedPost(file);
          }
          return true;
        },
      });
    }

    for (const [index, { destination, existed }] of transfers.entries()) {
      const backup = join(staging, `backup-${index}`);
      if (existed) await rename(destination, backup);
      const replacement = { destination, backup: existed ? backup : null, installed: false };
      replacements.push(replacement);
      await rename(join(staging, `new-${index}`), destination);
      replacement.installed = true;
    }
  } catch (error) {
    try {
      for (const { destination, backup, installed } of replacements.reverse()) {
        if (installed) await rm(destination, { recursive: true });
        if (backup) await rename(backup, destination);
      }
    } catch (rollbackError) {
      preserveBackup = true;
      throw new AggregateError([error, rollbackError], `Recovery files are in ${staging}`);
    }
    throw error;
  } finally {
    if (!preserveBackup) await rm(staging, { recursive: true, force: true });
  }
}

try {
  await prepare();
  console.log("Prepared blog posts and photos for the site.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
