import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const contexts = await Promise.all([
  esbuild.context({
    entryPoints: [path.join(rootDir, "src/main.js")],
    bundle: true,
    format: "iife",
    target: ["chrome114"],
    sourcemap: true,
    outfile: path.join(rootDir, "newtab.js"),
  }),
  esbuild.context({
    entryPoints: [path.join(rootDir, "src/styles/index.css")],
    bundle: true,
    legalComments: "none",
    outfile: path.join(rootDir, "styles.css"),
  }),
]);

await Promise.all(contexts.map((context) => context.watch()));
console.log("Watching src/main.js and src/styles/index.css");

async function dispose() {
  await Promise.all(contexts.map((context) => context.dispose()));
}

process.on("SIGINT", async () => {
  await dispose();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await dispose();
  process.exit(0);
});
