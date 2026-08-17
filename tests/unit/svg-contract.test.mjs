import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const root = new URL("../../", import.meta.url)
const assets = [
  {
    path: "docs/assets/curiosity-hero.svg",
    concepts: ["v0.8.0", "4 agents", "5 skills", "12 commands", "1 always rule", "Main agent", "Read-only roles", "One writer", "Curiosity Gate", "semantic prompt policy", "Cursor does not enforce"],
  },
  {
    path: "docs/assets/curiosity-architecture.svg",
    concepts: ["v0.8.0", "4 agents", "5 skills", "12 commands", "1 always rule", "Main agent", "Explore", "Strategist", "Researcher", "Implementer", "Reviewer", "Curiosity Gate", "File-only change lifecycle", "semantic prompt policy", "Cursor does not enforce"],
  },
]

const activeContent = /<(?:script|foreignObject|iframe|object|embed|audio|video|image|animate|animateMotion|animateTransform|set)\b|\bon\w+\s*=|\b(?:href|xlink:href)\s*=\s*["']\s*(?:https?:|data:|javascript:|\/\/)/i
const externalContent = /(?:url\(\s*["']?\s*(?:https?:|data:|\/\/)|@import\b|@font-face\b)/i

const assertSvgContract = (svg, path) => {
  assert.match(svg, /^\s*<svg\b[^>]*\bxmlns=["']http:\/\/www\.w3\.org\/2000\/svg["'][^>]*>/i, `${path}: root SVG namespace`)
  assert.match(svg, /^\s*<svg\b[^>]*\bviewBox=["'][^"']+["'][^>]*>/i, `${path}: viewBox`)
  assert.match(svg, /^\s*<svg\b[^>]*\brole=["']img["'][^>]*>/i, `${path}: image role`)
  assert.match(svg, /<title\b[^>]*>[^<]+<\/title>/i, `${path}: title`)
  assert.match(svg, /<desc\b[^>]*>[^<]+<\/desc>/i, `${path}: description`)
  assert.match(svg, /<\/svg>\s*$/i, `${path}: closed root`)
  assert.doesNotMatch(svg, activeContent, `${path}: active or externally loaded element`)
  assert.doesNotMatch(svg, externalContent, `${path}: external URL, raster, or font`)
}

for (const asset of assets) {
  test(`${asset.path} is accessible, meaningful static SVG`, async () => {
    const svg = await readFile(new URL(asset.path, root), "utf8")
    assertSvgContract(svg, asset.path)
    const text = svg.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ")
    for (const concept of asset.concepts) assert.match(text, new RegExp(concept, "i"), `${asset.path}: ${concept}`)
  })
}

test("SVG safety contract rejects representative mutations", async () => {
  const safe = await readFile(new URL(assets[0].path, root), "utf8")
  for (const mutation of [
    '<script>alert("x")</script>',
    '<foreignObject><iframe src="https://example.test"></iframe></foreignObject>',
    '<image href="data:image/png;base64,AAAA"/>',
    '<animate attributeName="opacity" values="0;1"/>',
    '<a href="javascript:alert(1)">unsafe</a>',
    '<style>@font-face { src: url(https://example.test/font.woff2); }</style>',
  ]) {
    const changed = safe.replace("</svg>", `${mutation}</svg>`)
    assert.throws(() => assertSvgContract(changed, "mutated.svg"), mutation)
  }
})
