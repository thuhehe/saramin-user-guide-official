/*
 * Screenshot an element of the LOCAL guide site (vite dev on :5174) at full size —
 * for checking a flowchart before it ships. Headless; touches nothing else.
 *
 *   node scripts/guide-shot.mjs <path> <css-selector> <out.png> [nth]
 */
import { chromium } from 'playwright-core'

const [, , path, sel, out, nth = '0'] = process.argv
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1500, height: 1000 }, deviceScaleFactor: 2 })
await p.goto('http://localhost:5174' + path, { waitUntil: 'networkidle' })
await p.locator(sel).nth(Number(nth)).screenshot({ path: out })
await b.close()
console.log('saved', out)
