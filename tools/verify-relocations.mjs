import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
const root=new URL("../",import.meta.url); const map=JSON.parse(await readFile(new URL("docs/provenance/relocations.json",root),"utf8"));
const seen=new Set(); for(const item of map.mappings){assert.ok(!seen.has(item.historicalPath)); seen.add(item.historicalPath); const digest=`sha256:${createHash("sha256").update(await readFile(new URL(item.currentPath,root))).digest("hex")}`; assert.equal(digest,item.currentDigest,item.currentPath)}
console.log(`Provenance relocation verified: ${map.mappings.length} mappings`)
