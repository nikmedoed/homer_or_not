import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const releaseDir = path.resolve(rootDir, process.env.RELEASE_DIR || "../homer_or_not-release");

const packageJson = JSON.parse(await readFile(path.join(rootDir, "package.json"), "utf8"));
const rawReleaseName = process.env.RELEASE_VERSION || process.env.GITHUB_REF_NAME || packageJson.version;
const releaseVersion = getManifestVersion(rawReleaseName);

await rm(releaseDir, { recursive: true, force: true });
await mkdir(path.join(releaseDir, "icons"), { recursive: true });

await Promise.all([
  writeReleaseManifest(),
  cp(path.join(rootDir, "newtab.html"), path.join(releaseDir, "newtab.html")),
  cp(path.join(rootDir, "newtab.config.js"), path.join(releaseDir, "newtab.config.js")),
  cp(path.join(rootDir, "icons"), path.join(releaseDir, "icons"), { recursive: true }),
]);

await Promise.all([
  esbuild.build({
    entryPoints: [path.join(rootDir, "src/main.js")],
    bundle: true,
    format: "iife",
    target: ["chrome114"],
    minify: true,
    legalComments: "none",
    outfile: path.join(releaseDir, "newtab.js"),
  }),
  esbuild.build({
    entryPoints: [path.join(rootDir, "styles.css")],
    bundle: true,
    minify: true,
    legalComments: "none",
    outfile: path.join(releaseDir, "styles.css"),
  }),
]);

console.log(`Release folder: ${path.relative(rootDir, releaseDir)}`);
console.log(`Manifest version: ${releaseVersion}`);

async function writeReleaseManifest() {
  const manifest = JSON.parse(await readFile(path.join(rootDir, "manifest.json"), "utf8"));
  manifest.version = releaseVersion;
  if (rawReleaseName && rawReleaseName !== releaseVersion) {
    manifest.version_name = rawReleaseName;
  }
  await writeFile(path.join(releaseDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
}

function getManifestVersion(raw) {
  const value = String(raw || "").trim();
  const match = value.match(/(\d+(?:\.\d+){0,3})/);
  if (!match) {
    throw new Error(`Cannot derive Chrome manifest version from "${value}". Use a tag like v1.2.3.`);
  }
  const version = match[1];
  const parts = version.split(".").map((part) => Number.parseInt(part, 10));
  if (parts.length > 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 65535)) {
    throw new Error(`Invalid Chrome manifest version "${version}".`);
  }
  return version;
}
