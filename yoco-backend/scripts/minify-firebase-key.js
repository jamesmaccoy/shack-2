#!/usr/bin/env node
/**
 * Usage: node scripts/minify-firebase-key.js path/to/shack-30405-firebase-adminsdk.json
 * Prints one line to paste into Vercel FIREBASE_SERVICE_ACCOUNT_JSON.
 */
const fs = require("fs");
const path = process.argv[2];
if (!path) {
  console.error("Usage: node scripts/minify-firebase-key.js <service-account.json>");
  process.exit(1);
}
const json = JSON.parse(fs.readFileSync(path, "utf8"));
if (json.project_id !== "shack-30405") {
  console.warn(`Warning: project_id is "${json.project_id}", expected shack-30405`);
}
process.stdout.write(JSON.stringify(json));
