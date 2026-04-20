import { existsSync, rmSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const targets = [
  "dist",
  "android/app/src/main/assets",
];

for (const target of targets) {
  const absolutePath = resolve(process.cwd(), target);
  if (existsSync(absolutePath)) {
    rmSync(absolutePath, { recursive: true, force: true });
  }
  mkdirSync(absolutePath, { recursive: true });
}

console.log("Cleaned dist and android/app/src/main/assets");
