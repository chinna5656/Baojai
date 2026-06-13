import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

const candidates = [
  process.env.K6_BIN,
  "k6",
  "C:\\Program Files\\k6\\k6.exe",
  "C:\\Program Files (x86)\\k6\\k6.exe"
].filter(Boolean);

function canRun(binary) {
  if (binary.includes("\\") && !existsSync(binary)) {
    return false;
  }

  const result = spawnSync(binary, ["version"], {
    shell: false,
    stdio: "ignore"
  });

  return result.status === 0;
}

const k6Binary = candidates.find(canRun);

if (!k6Binary) {
  console.error("Cannot find k6. Install it with: winget install k6 --source winget");
  console.error("If k6 is installed in a custom path, set K6_BIN to the full k6.exe path.");
  process.exit(1);
}

const result = spawnSync(k6Binary, process.argv.slice(2), {
  shell: false,
  stdio: "inherit"
});

process.exit(result.status ?? 1);
