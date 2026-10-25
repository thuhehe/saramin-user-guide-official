/*
 * Opens a real Chromium on the dev admin and keeps it open, so screenshots are
 * taken against the LIVE build. scripts/shot.mjs sends it one job at a time over
 * a tiny local HTTP port (9334) — one process owns the browser, nothing reattaches.
 *
 * The script never types a credential: it opens the admin and waits for a human
 * to sign in. The profile lives in .pw-profile/ (gitignored), so the next run is
 * usually already signed in.
 *
 *   node scripts/browser.mjs            # leave it running
 */
import { chromium } from 'playwright-core'
import http from 'node:http'

const BASE = process.env.ADMIN_BASE ?? 'https://dev-admin.saramin.vn'
const ctx = await chromium.launchPersistentContext(process.env.PW_PROFILE ?? new URL('../.pw-profile', import.meta.url).pathname, {
  headless: false,
  viewport: { width: 1408, height: 880 },
})
/* Always act on the newest open tab — a sign-in redirect or a closed window must
   not strand the server on a dead page. */
let page = ctx.pages()[0] ?? (await ctx.newPage())
const live = async () => {
  const open = ctx.pages().filter((p) => !p.isClosed())
  page = open.filter((p) => p.url().startsWith(BASE)).at(-1) ?? open.at(-1) ?? (await ctx.newPage())
  return page
}
await page.goto(BASE + '/', { waitUntil: 'domcontentloaded' }).catch(() => {})

async function run({ path, out, steps = [] }) {
  await live()
  if (path && path !== '-') await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => {})
  await page.waitForTimeout(1200)
  let full = false
  for (const s of steps) {
    const [k, ...r] = s.split(':')
    const v = r.join(':')
    if (k === 'click') await page.getByText(v, { exact: false }).filter({ visible: true }).first().click({ timeout: 8000 })
    else if (k === 'exact') await page.getByText(v, { exact: true }).filter({ visible: true }).first().click({ timeout: 8000 })
    else if (k === 'css') await page.locator(v).filter({ visible: true }).first().click({ timeout: 8000 })
    else if (k === 'row') await page.locator('.ant-table-tbody tr.ant-table-row').nth(Number(v) - 1).click({ timeout: 8000 })
    else if (k === 'wait') await page.waitForTimeout(Number(v))
    else if (k === 'scroll')
      // the innermost visible element that actually scrolls — a dialog body before the page
      await page.evaluate((px) => {
        const all = [...document.querySelectorAll('*')].filter((e) => {
          const st = getComputedStyle(e)
          return e.scrollHeight > e.clientHeight + 4 && /(auto|scroll)/.test(st.overflowY) && e.getClientRects().length
        })
        const inDialog = all.filter((e) => e.closest('.ant-modal, .ant-drawer, [role=dialog]'))
        const el = (inDialog.length ? inDialog : all).at(-1) ?? document.scrollingElement
        el.scrollBy(0, px)
      }, Number(v))
    else if (k === 'js') await page.evaluate(v)
    else if (k === 'fill') {
      // fill:<css selector>|<text> — types into the first visible match and presses Enter
      const [sel, ...t] = v.split('|')
      const box = page.locator(sel).filter({ visible: true }).first()
      await box.fill(t.join('|'))
      await box.press('Enter')
    }
    else if (k === 'full') full = true
    await page.waitForTimeout(600)
  }
  await page.waitForTimeout(800)
  if (out) await page.screenshot({ path: out, type: 'jpeg', quality: 85, fullPage: full })
  return { url: page.url(), title: await page.title() }
}

http
  .createServer((req, res) => {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', async () => {
      try {
        const job = body ? JSON.parse(body) : {}
        if (job.eval) {
          await live()
          res.end(JSON.stringify({ url: page.url(), result: await page.evaluate(job.eval) }))
          return
        }
        if (job.text) {
          await live()
          await page.waitForTimeout(500)
          res.end(JSON.stringify({ url: page.url(), text: (await page.locator('body').innerText()).slice(0, job.text) }))
          return
        }
        res.end(JSON.stringify(await run(job)))
      } catch (e) {
        res.statusCode = 500
        res.end(JSON.stringify({ error: String(e), url: page.url() }))
      }
    })
  })
  .listen(Number(process.env.PW_PORT ?? 9334), '127.0.0.1', () => console.log(`Browser open; jobs on http://127.0.0.1:${process.env.PW_PORT ?? 9334}`))
