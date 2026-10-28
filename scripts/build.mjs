import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = realpathSync(fileURLToPath(new URL("..", import.meta.url)));
const output = path.join(root, "dist");
const raw = process.env.LAB_BASE || "";
if (raw && !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(raw))
  throw Error("LAB_BASE boş veya /kanban-lab biçiminde olmalı.");
const env = { ...process.env, LAB_BASE: raw, NEXT_TELEMETRY_DISABLED: "1" };
for (const name of ["mova", "rota", "katman"]) {
  const assets = path.join(root, "apps", name, "public", "assets");
  mkdirSync(assets, { recursive: true });
  cpSync(
    path.join(root, "packages", "showcase-switcher.css"),
    path.join(assets, "showcase-switcher.css"),
  );
}
function run(args) {
  const r = spawnSync(process.execPath, args, {
    cwd: root,
    env,
    stdio: "inherit",
  });
  if (r.status !== 0) throw Error(`Build failed: ${args.join(" ")}`);
}
run(["--check", "apps/mova/public/app.js"]);
run([
  "node_modules/typescript/bin/tsc",
  "--noEmit",
  "-p",
  "apps/katman/tsconfig.json",
]);
run(["node_modules/next/dist/bin/next", "build", "apps/rota"]);
run(["node_modules/vite/bin/vite.js", "build", "apps/katman"]);
// Only this project's generated dist directory is replaced.
if (path.dirname(output) !== root || path.basename(output) !== "dist")
  throw Error("Unsafe output path");
if (existsSync(output)) rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(path.join(root, "public"), output, { recursive: true });
for (const [name, folder] of [
  ["mova", "public"],
  ["rota", "out"],
  ["katman", "dist"],
]) {
  const source = path.join(root, "apps", name, folder);
  if (!existsSync(path.join(source, "index.html")))
    throw Error(`Missing ${name} export`);
  cpSync(source, path.join(output, name), { recursive: true });
}
writeFileSync(path.join(output, ".nojekyll"), "");
const report = {
  base: raw || "/",
  apps: ["/mova/", "/rota/", "/katman/"],
  backend: false,
};
console.log("Showcase built:", JSON.stringify(report));
