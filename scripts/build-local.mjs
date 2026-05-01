import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

await Promise.all([
  esbuild.build({
    entryPoints: [path.join(rootDir, "src/main.js")],
    bundle: true,
    format: "iife",
    target: ["chrome114"],
    outfile: path.join(rootDir, "newtab.js"),
  }),
  esbuild.build({
    entryPoints: [path.join(rootDir, "src/styles/index.css")],
    bundle: true,
    legalComments: "none",
    outfile: path.join(rootDir, "styles.css"),
  }),
]);
