import assert from "node:assert/strict"
import { access, readFile } from "node:fs/promises"
await access(new URL("../dist/index.js",import.meta.url)); await access(new URL("../dist/index.d.ts",import.meta.url));
const pkg=JSON.parse(await readFile(new URL("../package.json",import.meta.url),"utf8")); assert.equal(pkg.dependencies["@opencode-ai/plugin"],"0.0.0-next-17125");
const loaded=await import(new URL("../dist/index.js",import.meta.url)); assert.equal(loaded.default.id,"iamsterling.opencode2-config");
const text=await readFile(new URL("../dist/plugin/plugin.js",import.meta.url),"utf8"); assert.match(text,/Plugin\.define/); console.log("Built artifact imports and exact OpenCode pin verified")
