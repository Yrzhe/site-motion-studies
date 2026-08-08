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
  "media/README.md",
  "screenshots/README.md",
];

const prohibitedPathParts = [
  "node_modules",
  "_next/static",
  "assets/network",
  "mirror/site",
  "original-source",
  "original-assets",
  "original-long-capture",
  "framerusercontent.com",
  "ctfassets.net",
];

const suspiciousExtensions = new Set([
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".glb",
  ".gltf",
  ".sog",
  ".buf",
  ".riv",
]);

const mediaExtensions = new Set([".mp4", ".mov", ".webm"]);

function isAllowedStudyMedia(normalizedPath) {
  return (
    normalizedPath.includes("/media/demo-recordings/") ||
    normalizedPath.includes("/media/original-reference/")
  );
}

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
  if (safety.contains_original_reference_media && !safety.reference_media_is_commentary_only) {
    logError(`${slug}: original reference media must be marked commentary-only`);
  }
}

const requiredRecipeSections = [
  "## Contract",
  "## Mechanism",
  "## Build steps",
  "## Asset adaptation",
  "## Acceptance checks",
  "## Porting notes",
];

function checkEffects(studyRoot, slug) {
  const effectsDir = path.join(studyRoot, "effects");
  const manifest = readJson(path.join(studyRoot, "manifest.json")) || {};
  const listed = Array.isArray(manifest.effects) ? manifest.effects : [];

  const folders = fs.existsSync(effectsDir)
    ? fs
        .readdirSync(effectsDir, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .map((entry) => entry.name)
        .sort()
    : [];

  if (manifest.status === "public" && folders.length === 0) {
    logError(`${slug}: public study must contain at least one effects/<effect>/`);
  }

  for (const name of listed) {
    if (!folders.includes(name)) {
      logError(`${slug}: manifest.effects lists "${name}" but effects/${name}/ does not exist`);
    }
  }
  for (const name of folders) {
    if (!listed.includes(name)) {
      logError(`${slug}: effects/${name}/ exists but is not listed in manifest.effects`);
    }
  }

  for (const name of folders) {
    const recipePath = path.join(effectsDir, name, "RECIPE.md");
    const demoPath = path.join(effectsDir, name, "demo", "index.html");

    if (!fs.existsSync(recipePath)) {
      logError(`${slug}: effects/${name}/ is missing RECIPE.md`);
    } else {
      const recipe = fs.readFileSync(recipePath, "utf8");
      for (const section of requiredRecipeSections) {
        if (!recipe.includes(section)) {
          logError(`${slug}: effects/${name}/RECIPE.md is missing "${section}" section`);
        }
      }
      if (/see effect \d|effects\/\d\d-[a-z-]+\/RECIPE/i.test(recipe) && !recipe.includes("Combine with recipe")) {
        logWarning(`${slug}: effects/${name}/RECIPE.md may cross-reference another effect for its mechanism — recipes must be self-contained`);
      }
      if (!/```json/.test(recipe)) {
        logWarning(`${slug}: effects/${name}/RECIPE.md has no machine-readable acceptance fixture (\`\`\`json block)`);
      }
    }

    if (!fs.existsSync(demoPath)) {
      logError(`${slug}: effects/${name}/ is missing demo/index.html`);
    }
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
  checkEffects(studyRoot, slug);

  for (const file of walkFiles(studyRoot)) {
    const relative = path.relative(root, file);
    const normalized = relative.split(path.sep).join("/");

    for (const marker of prohibitedPathParts) {
      if (normalized.includes(marker)) {
        logError(`${normalized}: prohibited private clone path marker "${marker}"`);
      }
    }

    if (
      suspiciousExtensions.has(path.extname(file).toLowerCase()) &&
      !isAllowedStudyMedia(normalized)
    ) {
      logWarning(`${normalized}: binary/media asset needs explicit asset-notes.md permission`);
    }

    if (
      mediaExtensions.has(path.extname(file).toLowerCase()) &&
      !isAllowedStudyMedia(normalized)
    ) {
      logWarning(`${normalized}: media files should live under media/original-reference or media/demo-recordings`);
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
