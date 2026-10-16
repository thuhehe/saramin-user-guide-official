/*
 * Writes src/updated.json — { pageKey: 'YYYY-MM-DD' }, the last day each page's
 * doc entry changed. Read from `git blame`: the newest commit touching any line
 * of the entry (`  key: {` … `  },`) inside a `*PAGE_DOCS` object. Lines not yet
 * committed count as today, so a page being edited reads as updated today.
 *
 * Runs before dev and build. Where there is no full history — Vercel's checkout
 * is shallow, and a CLI upload has no .git at all — it leaves the committed file
 * alone, because blame on a shallow clone would date every line to its tip.
 */
import { execFileSync } from 'node:child_process'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = 'src/updated.json'
const FILES = ['src/docs.ts', ...readdirSync('src/pagedocs').filter((f) => f.endsWith('.ts')).map((f) => join('src/pagedocs', f))]

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] })
}

try {
  if (process.env.VERCEL || git(['rev-parse', '--is-shallow-repository']).trim() !== 'false') process.exit(0)
} catch {
  process.exit(0) // not a git checkout
}

/** line number (1-based) → unix seconds of the commit that last touched it */
function blameTimes(file) {
  const times = []
  const byCommit = new Map()
  let commit = null
  let line = 0
  for (const row of git(['blame', '--line-porcelain', '--', file]).split('\n')) {
    const head = /^([0-9a-f]{40}) \d+ (\d+)/.exec(row)
    if (head) { commit = head[1]; line = Number(head[2]); continue }
    if (row.startsWith('committer-time ')) byCommit.set(commit, Number(row.slice(15)))
    if (row.startsWith('\t')) {
      // an uncommitted line is the zero hash with the current time
      times[line] = /^0+$/.test(commit) ? Date.now() / 1000 : byCommit.get(commit)
    }
  }
  return times
}

const day = (secs) => new Date(secs * 1000).toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' })

const out = {}
for (const file of FILES) {
  const lines = readFileSync(file, 'utf8').split('\n')
  const times = blameTimes(file)
  let inPageDocs = false
  let key = null
  let newest = 0
  lines.forEach((text, i) => {
    if (/^export const \w*PAGE_DOCS\b.*= \{\s*$/.test(text)) { inPageDocs = true; return }
    if (!inPageDocs) return
    if (/^\}/.test(text)) { inPageDocs = false; return }
    const open = /^ {2}(?:'([^']+)'|([A-Za-z0-9_-]+)): \{/.exec(text)
    if (open && !key) { key = open[1] ?? open[2]; newest = 0 }
    if (key) newest = Math.max(newest, times[i + 1] ?? 0)
    if (key && /^ {2}\},?\s*$/.test(text)) { out[key] = day(newest); key = null }
  })
}

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)))
writeFileSync(OUT, JSON.stringify(sorted, null, 1) + '\n')
console.log(`updated.json: ${Object.keys(sorted).length} pages`)
