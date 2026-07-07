#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const studiesDir = path.join(root, "studies");

const requiredFiles = [
  "README.md",
  "manifest.json",
  "teardown.md",
  "design-system.md",
  "typography.md",
  "motion.md",
  "interaction-map.md",
  "asset-notes.md",
  "references.md",
  "screenshots/README.md",
];

const prohibitedPathParts = [
  "node_modules",
  "_next/static",
  "assets/network",
  "mirror/site",
  "original-source",
  "original-assets",
  "framerusercontent.com",
  "ctfassets.net",
];

const suspiciousExtensions = new Set([
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".mp4",
  ".mov",
  ".webm",
  ".glb",
  ".gltf",
  ".sog",
  ".buf",
  ".riv",
]);

let errors = 0;
let warnings = 0;

function logError(message) {
  errors += 1;
  console.error(`ERROR ${message}`);
}

function logWarning(message) {
  warnings += 1;
  console.warn(`WARN  ${message}`);
}

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    logError(`${path.relative(root, file)} is not valid JSON: ${error.message}`);
    return null;
  }
}

function checkManifest(studyRoot, slug) {
  const manifestPath = path.join(studyRoot, "manifest.json");
  const manifest = readJson(manifestPath);
  if (!manifest) return;

  if (manifest.slug !== slug) {
    logError(`${slug}: manifest.slug must equal folder name`);
  }

  if (!manifest.original_url) {
    logError(`${slug}: manifest.original_url is required`);
  }

  if (!["draft", "review", "public", "withdrawn"].includes(manifest.status)) {
    logError(`${slug}: manifest.status is invalid`);
  }

  const safety = manifest.public_safety || {};
  if (safety.contains_original_source) {
    logError(`${slug}: contains_original_source must be false for public repo`);
  }
  if (safety.contains_original_fonts) {
    logError(`${slug}: contains_original_fonts must be false for public repo`);
  }
}

function checkStudy(studyRoot) {
  const slug = path.basename(studyRoot);

  for (const relativeFile of requiredFiles) {
    if (!fs.existsSync(path.join(studyRoot, relativeFile))) {
      logError(`${slug}: missing ${relativeFile}`);
    }
  }

  checkManifest(studyRoot, slug);

  for (const file of walkFiles(studyRoot)) {
    const relative = path.relative(root, file);
    const normalized = relative.split(path.sep).join("/");

    for (const marker of prohibitedPathParts) {
      if (normalized.includes(marker)) {
        logError(`${normalized}: prohibited private clone path marker "${marker}"`);
      }
    }

    if (suspiciousExtensions.has(path.extname(file).toLowerCase())) {
      logWarning(`${normalized}: binary/media asset needs explicit asset-notes.md permission`);
    }
  }
}

if (!fs.existsSync(studiesDir)) {
  logError("studies/ directory does not exist");
} else {
  const studies = fs
    .readdirSync(studiesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(studiesDir, entry.name));

  for (const study of studies) {
    checkStudy(study);
  }
}

console.log(`check-study: ${errors} error(s), ${warnings} warning(s)`);
process.exitCode = errors > 0 ? 1 : 0;

